#!/bin/bash

# Database setup script
echo "🗄️ Setting up database..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found"
    exit 1
fi

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client (psql) is not installed."
    echo "💡 Please install PostgreSQL or ensure psql is in your PATH"
    exit 1
fi

# Create database (you might need to adjust based on your PostgreSQL setup)
echo "Creating database $DB_NAME..."
sudo -u postgres createdb $DB_NAME 2>/dev/null || echo "Database might already exist or check permissions"

# Run database migrations
echo "Running database migrations..."
npm run db:migrate

# Seed initial data
echo "Seeding initial data..."
npm run db:seed

echo "✅ Database setup completed!"
