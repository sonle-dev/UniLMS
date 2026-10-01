@echo off
echo Starting UniLMS Spring Boot Backend...
cd /d "%~dp0backend"
java -cp "target/*;target/classes" com.unilms.UniLmsApplication
pause
