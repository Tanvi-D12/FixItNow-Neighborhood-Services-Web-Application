@echo off
echo Setting up Maven PATH and starting FixItNow Backend...
echo.

REM Add Maven to PATH for this session
set PATH=%PATH%;C:\apache-maven\apache-maven-3.9.5\bin

echo Testing Maven installation...
mvn --version
echo.

echo Starting Spring Boot Backend with H2 database...
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=test"

pause