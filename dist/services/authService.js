"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getAllUsers = exports.createUser = exports.getUserById = exports.getUserByEmail = void 0;
const database_1 = require("../config/database");
// Auth service functions
const getUserByEmail = async (email) => {
    const db = (0, database_1.getDB)();
    return await db.get('SELECT * FROM users WHERE email = ?', email);
};
exports.getUserByEmail = getUserByEmail;
const getUserById = async (id) => {
    const db = (0, database_1.getDB)();
    return await db.get('SELECT * FROM users WHERE id = ?', id);
};
exports.getUserById = getUserById;
const createUser = async (user) => {
    const db = (0, database_1.getDB)();
    const result = await db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', [user.email, user.password, user.name, user.role]);
    return {
        id: result.lastID,
        ...user
    };
};
exports.createUser = createUser;
const getAllUsers = async () => {
    const db = (0, database_1.getDB)();
    return await db.all('SELECT id, email, name, role FROM users ORDER BY id');
};
exports.getAllUsers = getAllUsers;
const updateUser = async (id, updates) => {
    const db = (0, database_1.getDB)();
    const fields = [];
    const params = [];
    if (updates.email !== undefined) {
        fields.push('email = ?');
        params.push(updates.email);
    }
    if (updates.password !== undefined) {
        fields.push('password = ?');
        params.push(updates.password);
    }
    if (updates.name !== undefined) {
        fields.push('name = ?');
        params.push(updates.name);
    }
    if (updates.role !== undefined) {
        fields.push('role = ?');
        params.push(updates.role);
    }
    if (fields.length === 0)
        return null;
    params.push(id);
    await db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    const updatedUser = await (0, exports.getUserById)(id);
    return updatedUser || null;
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    const db = (0, database_1.getDB)();
    const result = await db.run('DELETE FROM users WHERE id = ?', id);
    return result.changes > 0;
};
exports.deleteUser = deleteUser;
