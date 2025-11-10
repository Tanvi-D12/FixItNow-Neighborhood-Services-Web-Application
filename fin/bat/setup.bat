@echo off
echo Installing FixItNow Dependencies...
echo.

echo Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Frontend dependency installation failed!
    pause
    exit /b %errorlevel%
)

echo.
echo Installing Backend Dependencies...
cd ..\backend
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo Backend dependency installation failed!
    pause
    exit /b %errorlevel%
)

echo.
echo All dependencies installed successfully!
echo.
echo Next steps:
echo 1. Set up MySQL database named 'fixitnow_db'
echo 2. Update database credentials in backend/src/main/resources/application.properties
echo 3. Run start-dev.bat to start the application
echo.
pause