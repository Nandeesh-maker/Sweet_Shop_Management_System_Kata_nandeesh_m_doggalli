#!/bin/bash

# Start development servers
echo "🏪 Starting Sweet Shop Management System in development mode..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run setup.sh first."
    exit 1
fi

# Start backend server
echo "🔙 Starting backend server..."
npm run dev:backend &

# Wait a bit for backend to start
sleep 3

# Start frontend server (if frontend directory exists)
if [ -d "src/frontend" ] || [ -d "../frontend" ]; then
    echo "🔜 Starting frontend server..."
    npm run dev:frontend &
else
    echo "📱 Frontend directory not found. Backend only mode."
fi

echo "✅ Development servers starting..."
echo "📊 Backend API: http://localhost:3000"
echo "🎨 Frontend: http://localhost:3001 (if available)"
echo "🛑 Press Ctrl+C to stop all servers"
wait
