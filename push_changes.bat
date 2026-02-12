@echo off
echo ==========================================
echo      Warranty Pro - Push to GitHub
echo ==========================================
echo.
echo Using Portable Git to push changes...
echo.
portablegit\bin\git.exe push
echo.
if %errorlevel% neq 0 (
    echo [ERROR] Push failed. You might need to sign in.
) else (
    echo [SUCCESS] Changes pushed successfully!
)
echo.
pause
