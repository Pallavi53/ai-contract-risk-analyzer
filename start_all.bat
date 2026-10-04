@echo off
echo ==================================================
echo Starting AI Contract Risk Analyzer Application
echo ==================================================

cd /d "C:\Users\NEELI PALLAVI\.gemini\antigravity\scratch\AI-Contract-Risk-Analyzer"

echo [1/3] Starting AI FastAPI Service on Port 8000...
start "AI Service" cmd /k "cd ai-service && py -m uvicorn main:app --host 127.0.0.1 --port 8000"

timeout /t 3 >nul

echo [2/3] Starting Express Backend Service on Port 5000...
start "Express Backend" cmd /k "cd backend && node server.js"

timeout /t 3 >nul

echo [3/3] Starting React Frontend Service on Port 3000...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo ==================================================
echo All services launched!
echo Open your browser at: http://localhost:3000
echo Login Email: admin@contractanalyzer.com
echo Login Password: Admin@123
echo ==================================================
