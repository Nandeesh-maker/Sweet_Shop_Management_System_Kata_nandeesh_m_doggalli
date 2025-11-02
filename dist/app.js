"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Initialize database connection
(0, database_1.connectDB)();
// Optimized middleware
app.use((0, cors_1.default)({ origin: 'http://localhost:3001', credentials: true }));
app.use(express_1.default.json({ limit: '1mb' })); // Limit payload size
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const sweetRoutes_1 = __importDefault(require("./routes/sweetRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
// Use routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/sweets', sweetRoutes_1.default);
app.use('/api/inventory', inventoryRoutes_1.default);
app.use('/api/user', authRoutes_1.default);
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
// Start server only if this file is run directly (not imported)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Sweet Shop API running FAST on http://localhost:${PORT}`);
        console.log(`⚡ Optimized for performance`);
        console.log(`👤 Admin: admin@sweetshop.com / admin123`);
    });
}
exports.default = app;
