const args = process.argv.slice(2);
let modsPath = "";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const archiver = require("archiver");
const homeDir = require('os').homedir();

const isExclusive = args.includes("-exclusive") || args.includes("-pack");
const isPotato = args.includes("-potato") || args.includes("-pack");
const isBuild = args.includes("-build");

for (const arg of args) {
    if (arg.startsWith("-path=")) {
        modsPath = arg.slice(6);
        break;
    }
}

if (modsPath) {
    console.log(`Using mods path: ${modsPath}`);
} else {
    console.error(
        "No mods path specified. Please provide a path using the -path argument."
    );
    process.exit(1);
}

if (!path.isAbsolute(modsPath)) {
    modsPath = path.join(homeDir, "AppData", "Roaming", "ModrinthApp", "profiles", modsPath, "mods");
}

// Create directories for sorting
let clientDir, serverDir, bothDir, potatoDir;

if (isExclusive) {
    console.log("Running in exclusive mode.");
    const exclusiveDir = path.join(__dirname, "output", "exclusive");
    clientDir = path.join(exclusiveDir, "client");
    serverDir = path.join(exclusiveDir, "server");
    bothDir = path.join(exclusiveDir, "both");

    // Clear and recreate directories
    if (fs.existsSync(clientDir)) {
        fs.rmSync(clientDir, { recursive: true, force: true });
    }
    if (fs.existsSync(serverDir)) {
        fs.rmSync(serverDir, { recursive: true, force: true });
    }
    if (fs.existsSync(bothDir)) {
        fs.rmSync(bothDir, { recursive: true, force: true });
    }

    fs.mkdirSync(clientDir, { recursive: true });
    fs.mkdirSync(serverDir, { recursive: true });
    fs.mkdirSync(bothDir, { recursive: true });
} else {
    clientDir = path.join(__dirname, "output", "client");
    serverDir = path.join(__dirname, "output", "server");

    // Clear and recreate directories
    if (fs.existsSync(clientDir)) {
        fs.rmSync(clientDir, { recursive: true, force: true });
    }
    if (fs.existsSync(serverDir)) {
        fs.rmSync(serverDir, { recursive: true, force: true });
    }

    fs.mkdirSync(clientDir, { recursive: true });
    fs.mkdirSync(serverDir, { recursive: true });
}

if (isPotato) {
    potatoDir = path.join(__dirname, "output", "potato");
    
    // Clear and recreate potato directory
    if (fs.existsSync(potatoDir)) {
        fs.rmSync(potatoDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(potatoDir, { recursive: true });
}

const Table = require("cli-table3");

const head = ["File", "Project", "Client", "Server"];
const colWidths = [40, 40, 8, 8];

if (isExclusive) {
    head.push("Req. Client", "Req. Server");
    colWidths.push(12, 12);
}

if (isPotato) {
    head.push("Potato");
    colWidths.push(8);
}

const table = new Table({
    head: head,
    colWidths: colWidths,
});

console.log(table.toString());

async function sort(modsDir) {
    const files = fs.readdirSync(modsDir);
    for (const file of files) {
        const filePath = path.join(modsDir, file);
        const stats = fs.statSync(filePath);
        if (!stats.isDirectory()) {
            const filename = path.basename(filePath);
            const fileBuffer = fs.readFileSync(filePath);
            const hash = crypto
                .createHash("sha1")
                .update(fileBuffer)
                .digest("hex");

            try {
                const versionData = await get(
                    `https://api.modrinth.com/v2/version_file/${hash}?algorithm=sha1`
                );
                if (versionData && versionData.project_id) {
                    const projectData = await get(
                        `https://api.modrinth.com/v2/project/${versionData.project_id}`
                    );

                    const isClient =
                        projectData.client_side === "required" ||
                        projectData.client_side === "optional";
                    const isServer =
                        projectData.server_side === "required" ||
                        projectData.server_side === "optional";

                    const clientMark = isClient ? "✅" : "";
                    const serverMark = isServer ? "✅" : "";

                    const row = [
                        filename,
                        projectData.title,
                        clientMark,
                        serverMark,
                    ];

                    if (isExclusive) {
                        row.push(
                            projectData.client_side === "required" ? "✅" : "",
                            projectData.server_side === "required" ? "✅" : ""
                        );
                    }

                    if (isPotato) {
                        row.push(
                            projectData.client_side === "required" &&
                                projectData.server_side === "required"
                                ? "✅"
                                : ""
                        );
                    }

                    table.push(row);

                    if (
                        isPotato &&
                        projectData.client_side === "required" &&
                        projectData.server_side === "required"
                    ) {
                        fs.copyFileSync(
                            filePath,
                            path.join(potatoDir, filename)
                        );
                    }

                    if (isExclusive) {
                        if (isClient && isServer) {
                            fs.copyFileSync(
                                filePath,
                                path.join(bothDir, filename)
                            );
                        } else if (isClient) {
                            fs.copyFileSync(
                                filePath,
                                path.join(clientDir, filename)
                            );
                        } else if (isServer) {
                            fs.copyFileSync(
                                filePath,
                                path.join(serverDir, filename)
                            );
                        }
                    } else {
                        if (isClient) {
                            fs.copyFileSync(
                                filePath,
                                path.join(clientDir, filename)
                            );
                        }
                        if (isServer) {
                            fs.copyFileSync(
                                filePath,
                                path.join(serverDir, filename)
                            );
                        }
                    }
                } else {
                    // Unknown mod - treat as required for both client and server
                    const row = [filename, "Unknown (Patched)", "✅", "✅"];
                    
                    if (isExclusive) {
                        row.push("✅", "✅"); // Required on both client and server
                    }
                    
                    if (isPotato) {
                        row.push("✅"); // Required for potato instances
                    }
                    
                    table.push(row);
                    
                    // Copy to potato folder if potato mode is enabled
                    if (isPotato) {
                        fs.copyFileSync(filePath, path.join(potatoDir, filename));
                    }
                    
                    // Copy to appropriate folders
                    if (isExclusive) {
                        // In exclusive mode, put in both folder since it's required everywhere
                        fs.copyFileSync(filePath, path.join(bothDir, filename));
                    } else {
                        // In normal mode, put in both client and server folders
                        fs.copyFileSync(filePath, path.join(clientDir, filename));
                        fs.copyFileSync(filePath, path.join(serverDir, filename));
                    }
                }
            } catch (error) {
                // API error - treat same as unknown mod
                const row = [filename, "Error (Patched)", "✅", "✅"];
                
                if (isExclusive) {
                    row.push("✅", "✅"); // Required on both client and server
                }
                
                if (isPotato) {
                    row.push("✅"); // Required for potato instances
                }
                
                table.push(row);
                
                // Copy to potato folder if potato mode is enabled
                if (isPotato) {
                    fs.copyFileSync(filePath, path.join(potatoDir, filename));
                }
                
                // Copy to appropriate folders
                if (isExclusive) {
                    // In exclusive mode, put in both folder since it's required everywhere
                    fs.copyFileSync(filePath, path.join(bothDir, filename));
                } else {
                    // In normal mode, put in both client and server folders
                    fs.copyFileSync(filePath, path.join(clientDir, filename));
                    fs.copyFileSync(filePath, path.join(serverDir, filename));
                }
            }
        } else {
            // It's a directory, skip
        }
        console.log("\x1B[2J\x1B[0;0H"); // Clear console
        console.log(table.toString());
    }
    return;
}

async function get(url) {
    const response = await fetch(url, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        },
    });
    if (!response.ok) {
        throw new Error(
            `API request failed with status ${response.status}: ${response.statusText}`
        );
    }
    return response.json();
}

sort(modsPath).then(() => {
    if (isBuild) {
        const output = fs.createWriteStream(
            path.join(__dirname, "output", "modpack.zip")
        );
        const archive = archiver("zip", {
            zlib: { level: 7 }, // Sets the compression level.
        });

        output.on("close", function () {
            console.log("Modpack size: "+convertBytes(archive.pointer()));
            console.log(
                "archiver has been finalized and the output file descriptor has closed."
            );
        });

        archive.on("error", function (err) {
            throw err;
        });

        archive.pipe(output);

        if (fs.existsSync(clientDir)) {
            archive.directory(clientDir, "client");
        }
        if (fs.existsSync(potatoDir)) {
            archive.directory(potatoDir, "potato");
        }

        archive.finalize();
    }
});
function convertBytes(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}
