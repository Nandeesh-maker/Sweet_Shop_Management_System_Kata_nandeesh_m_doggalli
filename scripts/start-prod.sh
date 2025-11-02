#!/bin/bash

# Start production server
echo "🏪 Starting Sweet Shop Management System in production mode..."

# Check if build exists
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found. Please run build.sh first."
    exit 1
fi

# Start the production server
npm start

echo "✅ Production server started on port $PORT"
