const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory data store
let sweets = [
  { id: 1, name: 'Chocolate Bar', category: 'chocolate', price: 2.99, quantity: 50 },
  { id: 2, name: 'Gummy Bears', category: 'gummies', price: 1.99, quantity: 100 },
  { id: 3, name: 'Lollipop', category: 'candy', price: 0.99, quantity: 75 }
];

let users = [];

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Sweet Shop API is running!',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Sweet Shop Management System API',
    version: '1.0.0'
  });
});

// Get all sweets
app.get('/api/sweets', (req, res) => {
  res.json({
    message: 'Sweets retrieved successfully',
    data: sweets,
    count: sweets.length
  });
});

app.listen(PORT, () => {
  console.log('🏪 Sweet Shop Management System is running!');
  console.log('📊 Backend API: http://localhost:' + PORT);
});
