@echo off

REM Check if PalServer.exe is already running
tasklist /FI "IMAGENAME eq PalServer.exe" 2>NUL | find /I /N "PalServer.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo PalServer is already running
    exit /B
)

REM Start PalServer.exe
echo Starting PalServer...

