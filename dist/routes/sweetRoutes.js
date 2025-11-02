"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sweetController_1 = require("../controllers/sweetController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Public routes
router.get('/', sweetController_1.getSweets);
router.get('/search', sweetController_1.searchSweetsHandler);
// Protected routes (require authentication)
router.post('/', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, sweetController_1.createSweet);
router.put('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, sweetController_1.updateSweetHandler);
router.delete('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, sweetController_1.deleteSweetHandler);
exports.default = router;
