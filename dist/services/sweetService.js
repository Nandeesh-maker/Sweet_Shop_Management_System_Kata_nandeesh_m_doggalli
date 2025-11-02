"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restockSweet = exports.purchaseSweet = exports.deleteSweet = exports.updateSweet = exports.addSweet = exports.searchSweets = exports.getSweetById = exports.getAllSweets = void 0;
const database_1 = require("../config/database");
// Sweet service functions
const getAllSweets = async () => {
    const db = (0, database_1.getDB)();
    return await db.all('SELECT * FROM sweets ORDER BY id');
};
exports.getAllSweets = getAllSweets;
const getSweetById = async (id) => {
    const db = (0, database_1.getDB)();
    return await db.get('SELECT * FROM sweets WHERE id = ?', id);
};
exports.getSweetById = getSweetById;
const searchSweets = async (filters) => {
    const db = (0, database_1.getDB)();
    let query = 'SELECT * FROM sweets WHERE 1=1';
    const params = [];
    if (filters.name) {
        query += ' AND name LIKE ?';
        params.push(`%${filters.name}%`);
    }
    if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
    }
    if (filters.minPrice !== undefined) {
        query += ' AND price >= ?';
        params.push(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
        query += ' AND price <= ?';
        params.push(filters.maxPrice);
    }
    query += ' ORDER BY id';
    return await db.all(query, params);
};
exports.searchSweets = searchSweets;
const addSweet = async (sweet) => {
    const db = (0, database_1.getDB)();
    const result = await db.run('INSERT INTO sweets (name, category, price, quantity) VALUES (?, ?, ?, ?)', [sweet.name, sweet.category, sweet.price, sweet.quantity]);
    return {
        id: result.lastID,
        ...sweet
    };
};
exports.addSweet = addSweet;
const updateSweet = async (id, updates) => {
    const db = (0, database_1.getDB)();
    const fields = [];
    const params = [];
    if (updates.name !== undefined) {
        fields.push('name = ?');
        params.push(updates.name);
    }
    if (updates.category !== undefined) {
        fields.push('category = ?');
        params.push(updates.category);
    }
    if (updates.price !== undefined) {
        fields.push('price = ?');
        params.push(updates.price);
    }
    if (updates.quantity !== undefined) {
        fields.push('quantity = ?');
        params.push(updates.quantity);
    }
    if (fields.length === 0)
        return null;
    params.push(id);
    await db.run(`UPDATE sweets SET ${fields.join(', ')} WHERE id = ?`, params);
    const updatedSweet = await (0, exports.getSweetById)(id);
    return updatedSweet || null;
};
exports.updateSweet = updateSweet;
const deleteSweet = async (id) => {
    const db = (0, database_1.getDB)();
    const result = await db.run('DELETE FROM sweets WHERE id = ?', id);
    return result.changes > 0;
};
exports.deleteSweet = deleteSweet;
const purchaseSweet = async (sweetId, quantity, userId) => {
    const db = (0, database_1.getDB)();
    const sweet = await (0, exports.getSweetById)(sweetId);
    if (!sweet) {
        throw new Error('Sweet not found');
    }
    if (sweet.quantity < quantity) {
        throw new Error('Insufficient quantity available');
    }
    // Start transaction
    await db.run('BEGIN TRANSACTION');
    try {
        // Update sweet quantity
        await db.run('UPDATE sweets SET quantity = quantity - ? WHERE id = ?', [quantity, sweetId]);
        // Record purchase
        const totalPrice = sweet.price * quantity;
        await db.run('INSERT INTO purchases (user_id, sweet_id, quantity, total_price) VALUES (?, ?, ?, ?)', [userId, sweetId, quantity, totalPrice]);
        // Commit transaction
        await db.run('COMMIT');
        const updatedSweet = await (0, exports.getSweetById)(sweetId);
        return {
            sweet: updatedSweet,
            quantityPurchased: quantity,
            remainingQuantity: updatedSweet.quantity
        };
    }
    catch (error) {
        // Rollback on error
        await db.run('ROLLBACK');
        throw error;
    }
};
exports.purchaseSweet = purchaseSweet;
const restockSweet = async (sweetId, quantity) => {
    const db = (0, database_1.getDB)();
    const sweet = await (0, exports.getSweetById)(sweetId);
    if (!sweet) {
        throw new Error('Sweet not found');
    }
    await db.run('UPDATE sweets SET quantity = quantity + ? WHERE id = ?', [quantity, sweetId]);
    const updatedSweet = await (0, exports.getSweetById)(sweetId);
    return {
        sweet: updatedSweet,
        quantityAdded: quantity,
        newQuantity: updatedSweet.quantity
    };
};
exports.restockSweet = restockSweet;
