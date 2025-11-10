@echo off
echo Starting FixItNow Development Environment...
echo.

echo Starting Backend (Spring Boot)...
cd backend
start "FixItNow Backend" cmd /k "mvn spring-boot:run"

echo.
echo Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo Starting Frontend (React)...
cd ..\frontend
start "FixItNow Frontend" cmd /k "npm start"

echo.
echo FixItNow is starting up!
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Press any key to continue...
pause > nul