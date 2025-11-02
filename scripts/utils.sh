#!/bin/bash

# Utility functions for Sweet Shop Management System

# Function to check service health
check_health() {
    echo "🏥 Checking service health..."
    curl -f http://localhost:3000/api/health || echo "❌ Backend is not healthy"
    
    if [ -d "src/frontend" ] || [ -d "../frontend" ]; then
        curl -f http://localhost:3001 || echo "❌ Frontend is not healthy"
    fi
}

# Function to view logs
view_logs() {
    echo "📋 Showing recent logs..."
    if [ -f "logs/app.log" ]; then
        tail -f logs/app.log
    else
        echo "No log file found"
    fi
}

# Function to reset database
reset_db() {
    echo "🔄 Resetting database..."
    read -p "Are you sure? This will delete all data! (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run db:reset
        echo "✅ Database reset completed"
    else
        echo "❌ Database reset cancelled"
    fi
}
