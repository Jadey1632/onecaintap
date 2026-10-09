@echo off
title ONEcainTAP - Municipality of Cainta Barangay Service Management System
echo ======================================================================
echo    ONEcainTAP - Digital Barangay Service Management System
echo    Municipality of Cainta, Province of Rizal
echo ======================================================================
echo.

echo [1/2] Building React frontend...
cd client
call npm run build
cd ..

echo.
echo [2/2] Starting Backend Server (Port 5000)...
echo       - API endpoints available at http://localhost:5000/api
echo       - Full app available at http://localhost:5000
echo.
echo *** Open a SEPARATE terminal and run ngrok: ***
echo     .\ngrok.exe http 5000
echo     (from C:\Users\mamar\OneDrive\Desktop\ngrok-v3-stable-windows-amd64)
echo.
echo (If using XAMPP, ensure MySQL is started and onecaintap_db.sql is imported)
echo.
start "ONEcainTAP Server" cmd /k "cd server && npm start"

pause
