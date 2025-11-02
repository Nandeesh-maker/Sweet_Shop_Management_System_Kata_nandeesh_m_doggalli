#!/bin/bash

# Sweet Shop Management System Setup Script
echo "🚀 Setting up Sweet Shop Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment files
echo "🔧 Creating environment files..."
cp .env.example .env 2>/dev/null || echo ".env.example not found, creating basic .env"
cat > .env << EOL
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sweet_shop
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:3001
EOL

echo "✅ Setup completed successfully!"
echo "📝 Please update the .env file with your actual database credentials"
echo "🎯 Next steps:"
echo "   1. Update .env with your database settings"
echo "   2. Run: ./scripts/start-dev.sh"
