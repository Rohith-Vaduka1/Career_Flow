#!/bin/bash
echo "========================================================"
echo "       STARTING CAREER FLOW (AI CAREER PLATFORM)"
echo "========================================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js is not installed. Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "[1/3] Checking dependencies..."

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    (cd backend && npm install)
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    (cd frontend && npm install)
fi

echo ""
echo "[2/3] Starting Backend Server (Port 5000)..."
(cd backend && npm run dev) &
BACKEND_PID=$!

sleep 3

echo "[3/3] Starting Frontend Dev Server (Port 5173)..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

sleep 3

echo ""
echo "========================================================"
echo "  Career Flow is now running!"
echo "  Backend: http://localhost:5000"
echo "  Frontend: http://localhost:5173"
echo "========================================================"

# Try to open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
elif command -v open &> /dev/null; then
    open http://localhost:5173
fi

wait $BACKEND_PID $FRONTEND_PID
