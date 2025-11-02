"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sweetController_1 = require("../controllers/sweetController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Purchase a sweet (requires authentication)
router.post('/:id/purchase', authMiddleware_1.authenticateToken, sweetController_1.purchaseSweetHandler);
// Restock a sweet (requires authentication and admin role)
router.post('/:id/restock', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, sweetController_1.restockSweetHandler);
exports.default = router;
