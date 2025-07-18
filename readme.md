# Minecraft Mod Sorter

A Node.js tool that automatically sorts Minecraft mods based on their client/server compatibility using the Modrinth API. This tool helps organize modpack files by separating client-only, server-only, and universal mods into appropriate directories.

## Features

- 🔍 **Automatic mod detection** - Uses SHA1 hashes to identify mods via Modrinth API
- 📊 **Visual sorting table** - Displays mod compatibility in a clear table format
- 🗂️ **Multiple sorting modes** - Normal, exclusive, and potato PC optimization
- 📦 **Modpack export** - Creates ZIP archives of sorted mods
- 🖥️ **User-friendly interface** - Interactive batch script for easy usage

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher)
- Internet connection (for Modrinth API access)

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Method 1: Interactive Batch Script (Recommended for Windows)

Run the interactive batch script:
```bash
sort.bat
```

The script will prompt you for:
- **Path or profile name**: Enter either a full path to your mods folder or a Modrinth profile name
- **Pack mode**: Choose whether to use pack mode (sorts all types) or individual modes
- **Exclusive sorting**: Whether to sort mods exclusively (separate client/server) or inclusively
- **Potato PC mode**: Creates a folder with only essential mods for low-end systems
- **Export modpack**: Whether to create a ZIP file of the sorted mods

### Method 2: Direct Node.js Command

```bash
node sort.js -path=<path_or_profile> [options]
```

#### Command Line Options

- `-path=<path>` - **Required**. Path to mods folder or Modrinth profile name
- `-exclusive` - Sort mods exclusively (client-only, server-only, both)
- `-potato` - Create potato PC folder with essential mods only
- `-pack` - Enable pack mode (equivalent to `-exclusive -potato`)
- `-build` - Export sorted mods as a ZIP file

#### Examples

```bash
# Sort mods from a Modrinth profile
node sort.js -path=MyModpack

# Sort with full path and exclusive mode
node sort.js -path="C:\Users\Username\mods" -exclusive

# Pack mode with export
node sort.js -path=MyModpack -pack -build

# Potato PC optimization
node sort.js -path=MyModpack -potato -build
```

## Path Resolution

The tool supports two path formats:

1. **Full paths**: Complete file system paths (e.g., `C:\Users\Username\mods`)
2. **Profile names**: Modrinth profile names that automatically resolve to:
   ```
   C:\Users\Olive\AppData\Roaming\ModrinthApp\profiles\<profile_name>\mods
   ```

## Output Structure

### Normal Mode
```
output/
├── client/     # All client-compatible mods
└── server/     # All server-compatible mods
```

### Exclusive Mode (`-exclusive`)
```
output/
└── exclusive/
    ├── client/  # Client-only mods
    ├── server/  # Server-only mods
    └── both/    # Universal mods that are required both places.
```

### Potato Mode (`-potato`)
```
output/
└── potato/      # Essential mods only (required on both sides)
```

### Pack Mode (`-pack`)
Combines exclusive and potato modes, creating all output directories.

## Mod Compatibility Legend

The tool displays mod compatibility using the following indicators:

- ✅ **Client**: Mod works on client side and is reccomended
- ✅ **Server**: Mod works on server side and is reccomended
- ✅ **Req. Client**: Mod is required on only the client (exclusive mode)
- ✅ **Req. Server**: Mod is required on only the server (exclusive mode)
- ✅ **Potato**: Mod is essential and the pack cannot be used without.

## Troubleshooting

### Common Issues

1. **"No mods path specified"**
   - Ensure you're using the `-path` argument
   - Check that the path exists and contains mod files

2. **"API request failed"**
   - Check your internet connection
   - The Modrinth API might be temporarily unavailable

3. **"Unknown" mods in output**
   - Mod not found in Modrinth database
   - File might not be a valid mod file
   - Mod might be from a different platform (CurseForge, etc.)

### Error Handling

- Unknown mods are listed in the table but not sorted
- API errors are caught and displayed in the table
- Files that aren't mods (like config files) are skipped

## Output Files

When using the `-build` flag, the tool creates:
- `output/modpack.zip` - Contains all sorted mod directories

## Dependencies

- **archiver**: For creating ZIP archives
- **cli-table3**: For displaying formatted tables
- **crypto**: Built-in Node.js module for SHA1 hashing
- **fs/path**: Built-in Node.js modules for file operations

## Contributing

Feel free to submit issues or pull requests to improve this tool.

## License

ISC License

## Notes

- This tool is designed for any mod launcher for Minecraft mods available on Modrinth
- Mods from other platforms or custom ones may not be recognized
- Always backup your original mods folder before sorting (the script will not touch them but just in case)
- The tool creates copies of mods, it doesn't move the original files