"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restockSweetHandler = exports.purchaseSweetHandler = exports.deleteSweetHandler = exports.updateSweetHandler = exports.createSweet = exports.searchSweetsHandler = exports.getSweets = void 0;
const sweetService_1 = require("../services/sweetService");
// Sweet controller functions
const getSweets = async (req, res) => {
    try {
        const sweets = await (0, sweetService_1.getAllSweets)();
        res.json({
            message: 'Sweets retrieved successfully',
            data: sweets,
            count: sweets.length
        });
    }
    catch (error) {
        console.error('Get sweets error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getSweets = getSweets;
const searchSweetsHandler = async (req, res) => {
    try {
        const { name, category, minPrice, maxPrice } = req.query;
        const filters = {};
        if (name)
            filters.name = name.toLowerCase();
        if (category)
            filters.category = category;
        if (minPrice)
            filters.minPrice = parseFloat(minPrice);
        if (maxPrice)
            filters.maxPrice = parseFloat(maxPrice);
        const sweets = await (0, sweetService_1.searchSweets)(filters);
        res.json({
            message: 'Search completed',
            data: sweets,
            count: sweets.length
        });
    }
    catch (error) {
        console.error('Search sweets error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.searchSweetsHandler = searchSweetsHandler;
const createSweet = async (req, res) => {
    try {
        const { name, category, price, quantity } = req.body;
        if (!name || !category || !price || !quantity) {
            return res.status(400).json({ error: 'All fields required' });
        }
        const newSweet = await (0, sweetService_1.addSweet)({
            name,
            category,
            price: parseFloat(price),
            quantity: parseInt(quantity)
        });
        res.status(201).json({
            message: 'Sweet added successfully',
            data: newSweet
        });
    }
    catch (error) {
        console.error('Create sweet error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createSweet = createSweet;
const updateSweetHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedSweet = await (0, sweetService_1.updateSweet)(parseInt(id), updates);
        if (!updatedSweet) {
            return res.status(404).json({ error: 'Sweet not found' });
        }
        res.json({
            message: 'Sweet updated successfully',
            data: updatedSweet
        });
    }
    catch (error) {
        console.error('Update sweet error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateSweetHandler = updateSweetHandler;
const deleteSweetHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await (0, sweetService_1.deleteSweet)(parseInt(id));
        if (!deleted) {
            return res.status(404).json({ error: 'Sweet not found' });
        }
        res.json({
            message: 'Sweet deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete sweet error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteSweetHandler = deleteSweetHandler;
const purchaseSweetHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity = 1 } = req.body;
        const userId = req.userId; // From auth middleware
        const result = await (0, sweetService_1.purchaseSweet)(parseInt(id), parseInt(quantity), userId);
        res.json({
            message: 'Purchase successful',
            data: result
        });
    }
    catch (error) {
        console.error('Purchase sweet error:', error);
        if (error instanceof Error) {
            if (error.message === 'Sweet not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Insufficient quantity available') {
                return res.status(400).json({ error: error.message });
            }
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.purchaseSweetHandler = purchaseSweetHandler;
const restockSweetHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity = 10 } = req.body;
        const result = await (0, sweetService_1.restockSweet)(parseInt(id), parseInt(quantity));
        res.json({
            message: 'Restock successful',
            data: result
        });
    }
    catch (error) {
        console.error('Restock sweet error:', error);
        if (error instanceof Error && error.message === 'Sweet not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.restockSweetHandler = restockSweetHandler;
