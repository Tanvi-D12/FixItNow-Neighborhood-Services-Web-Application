@echo off
echo =====================================
echo   FixItNow - System Testing Script
echo =====================================
echo.

echo Testing Backend API Connection...
curl -X GET http://localhost:8080/api -w "%%{http_code}" -s -o nul > response.txt
set /p response_code=<response.txt
if "%response_code%"=="401" (
    echo ✅ Backend API is running and secured (HTTP 401 - Expected for protected endpoint)
) else if "%response_code%"=="200" (
    echo ✅ Backend API is running (HTTP 200)
) else (
    echo ❌ Backend API connection failed (HTTP %response_code%)
    goto :end
)

echo.
echo Testing Registration Endpoint...
curl -X POST http://localhost:8080/api/auth/signup ^
-H "Content-Type: application/json" ^
-d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"role\":\"customer\",\"location\":\"Test City\"}" ^
-w "%%{http_code}" -s > reg_response.txt

set /p reg_response=<reg_response.txt
echo Registration Response: %reg_response%

echo.
echo Testing Login Endpoint...
curl -X POST http://localhost:8080/api/auth/signin ^
-H "Content-Type: application/json" ^
-d "{\"email\":\"test@example.com\",\"password\":\"password123\"}" ^
-w "%%{http_code}" -s > login_response.txt

set /p login_response=<login_response.txt
echo Login Response: %login_response%

echo.
echo Testing Frontend Connection...
curl -X GET http://localhost:3000 -w "%%{http_code}" -s -o nul > frontend_response.txt
set /p frontend_code=<frontend_response.txt
if "%frontend_code%"=="200" (
    echo ✅ Frontend is running (HTTP 200)
) else (
    echo ❌ Frontend connection failed (HTTP %frontend_code%)
)

echo.
echo =====================================
echo   Testing Complete!
echo =====================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8080/api
echo H2 Console: http://localhost:8080/h2-console
echo.

:end
del response.txt reg_response.txt login_response.txt frontend_response.txt 2>nul
pause