#!/bin/bash

echo "🌊 Starting Seas the Day locally..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first:"
    echo "   brew install node"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.11 first:"
    echo "   brew install python@3.11"
    exit 1
fi

echo "✅ Prerequisites found"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd web
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd api
pip3 install -r requirements.txt
cd ..

echo "🚀 Starting services..."

# Start backend in background
echo "🔧 Starting API server on http://localhost:8000"
cd api
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
API_PID=$!
cd ..

# Wait a moment for API to start
sleep 3

# Start frontend
echo "🌐 Starting web server on http://localhost:3000"
cd web
npm run dev &
WEB_PID=$!
cd ..

echo ""
echo "🎉 Seas the Day is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Health: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for user to stop
wait

