import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database connection
connectDB();

// Optimized middleware
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.json({ limit: '1mb' })); // Limit payload size

// Import routes
import authRoutes from './routes/authRoutes';
import sweetRoutes from './routes/sweetRoutes';
import inventoryRoutes from './routes/inventoryRoutes';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/user', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Sweet Shop API is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Sweet Shop API - Database Version',
    version: '3.0.0',
    status: 'Running with SQLite 🚀'
  });
});

// Start server only if this file is run directly (not imported) and not in test environment
if (require.main === module && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Sweet Shop API running FAST on http://localhost:${PORT}`);
    console.log(`⚡ Optimized for performance`);
    console.log(`👤 Admin: admin@sweetshop.com / admin123`);
  });
}

export default app;
