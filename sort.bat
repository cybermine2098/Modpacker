@echo off
setlocal

set "userInput="
set /p "userInput=Enter a path or profile name: "
if not defined userInput (
    echo No path or profile name entered. Exiting.
    goto :eof
)

:getPackMode
set "packInput="
set /p "packInput=Use pack mode (sorts all types)? (Y/N): "
if /I not "%packInput%"=="Y" if /I not "%packInput%"=="N" (
    echo Invalid input. Please enter Y or N.
    goto :getPackMode
)

set "packFlag="
set "exclusiveFlag="
set "potatoFlag="
set "buildFlag="

if /I "%packInput%"=="Y" (
    set "packFlag=-pack"
) else (
    :getExclusiveMode
    set "exclusiveInput="
    set /p "exclusiveInput=Sort exclusively? (Y/N): "
    if /I not "%exclusiveInput%"=="Y" if /I not "%exclusiveInput%"=="N" (
        echo Invalid input. Please enter Y or N.
        goto :getExclusiveMode
    )
    if /I "%exclusiveInput%"=="Y" (
        set "exclusiveFlag=-exclusive"
    )

    :getPotatoMode
    set "potatoInput="
    set /p "potatoInput=Sort for potato PCs? (Y/N): "
    if /I not "%potatoInput%"=="Y" if /I not "%potatoInput%"=="N" (
        echo Invalid input. Please enter Y or N.
        goto :getPotatoMode
    )
    if /I "%potatoInput%"=="Y" (
        set "potatoFlag=-potato"
    )
)

:getBuildMode
set "buildInput="
set /p "buildInput=Should the modpack be exported? (Y/N): "
if /I not "%buildInput%"=="Y" if /I not "%buildInput%"=="N" (
    echo Invalid input. Please enter Y or N.
    goto :getBuildMode
)
if /I "%buildInput%"=="Y" (
    set "buildFlag=-build"
)

:run_script
echo Sorting files for "%userInput%"

node sort.js -path=%userInput% %packFlag% %exclusiveFlag% %potatoFlag% %buildFlag%

if %errorlevel% neq 0 (
    echo An error occurred while sorting files.
) else (
    echo Files sorted successfully.
)

echo Done!
pause
endlocal