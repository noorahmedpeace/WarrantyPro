@echo off
echo Starting Warranty Manager...

echo Starting Backend...
start "Warranty Manager Backend" cmd /c "cd backend && npm run start:dev"

echo Starting Frontend...
start "Warranty Manager Frontend" cmd /c "cd frontend && npm run dev"

echo Done. Check the new windows.
