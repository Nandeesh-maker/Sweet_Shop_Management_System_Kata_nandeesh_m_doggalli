#!/bin/bash

# Test runner script for Sweet Shop Management System
echo "🧪 Running tests for Sweet Shop Management System..."

# Set test environment
export NODE_ENV=test

# Run backend tests
echo "🔙 Running backend tests..."
npm test

# Run frontend tests if frontend exists
if [ -d "src/frontend" ] || [ -d "../frontend" ]; then
    echo "🔜 Running frontend tests..."
    npm run test:frontend
fi

# Generate test coverage report
echo "📊 Generating test coverage report..."
npm run test:coverage

echo "✅ All tests completed!"
