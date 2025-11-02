import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import dotenv from 'dotenv';
// @ts-ignore
import * as bcrypt from 'bcryptjs';

dotenv.config();

let db: Database<sqlite3.Database, sqlite3.Statement>;

export const connectDB = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, '../../sweet_shop.db'),
      driver: sqlite3.Database,
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
      await db.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin@sweetshop.com', hashedPassword, 'Shop Admin', 'admin']
      );
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
        await db.run(
          'INSERT INTO sweets (name, category, price, quantity) VALUES (?, ?, ?, ?)',
          sweet
        );
      }
    }

    console.log('📊 Database initialized with sample data');
    return db;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
};

export default getDB;
