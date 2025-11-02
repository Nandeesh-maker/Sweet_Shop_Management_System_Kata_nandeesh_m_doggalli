#!/bin/bash

# Build script for production
echo "🏗️ Building Sweet Shop Management System for production..."

# Build backend
echo "🔙 Building backend..."
npm run build

# Build frontend if exists
if [ -d "src/frontend" ] || [ -d "../frontend" ]; then
    echo "🔜 Building frontend..."
    npm run build:frontend
fi

echo "✅ Build completed!"
echo "📦 Production files are ready in dist/ and build/ directories"
