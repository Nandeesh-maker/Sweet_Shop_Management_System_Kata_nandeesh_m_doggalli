"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDB = exports.connectDB = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// @ts-ignore
const bcrypt = __importStar(require("bcryptjs"));
dotenv_1.default.config();
let db;
const connectDB = async () => {
    try {
        db = await (0, sqlite_1.open)({
            filename: path_1.default.join(__dirname, '../../sweet_shop.db'),
            driver: sqlite3_1.default.Database,
        });
        console.log('🗄️ SQLite database connected successfully');
        // Create tables if they don't exist
        await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      );

      CREATE TABLE IF NOT EXISTS sweets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        sweet_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total_price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (sweet_id) REFERENCES sweets (id)
      );
    `);
        // Seed initial data if tables are empty
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        if (userCount.count === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', ['admin@sweetshop.com', hashedPassword, 'Shop Admin', 'admin']);
        }
        const sweetCount = await db.get('SELECT COUNT(*) as count FROM sweets');
        if (sweetCount.count === 0) {
            const initialSweets = [
                ['Chocolate Bar', 'chocolate', 2.99, 50],
                ['Gummy Bears', 'gummies', 1.99, 100],
                ['Lollipop', 'candy', 0.99, 75],
                ['Caramel Candy', 'caramel', 1.50, 30],
                ['Marshmallow', 'soft', 0.75, 40]
            ];
            for (const sweet of initialSweets) {
                await db.run('INSERT INTO sweets (name, category, price, quantity) VALUES (?, ?, ?, ?)', sweet);
            }
        }
        console.log('📊 Database initialized with sample data');
        return db;
    }
    catch (error) {
        console.error('❌ Database connection error:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const getDB = () => {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB() first.');
    }
    return db;
};
exports.getDB = getDB;
exports.default = exports.getDB;
