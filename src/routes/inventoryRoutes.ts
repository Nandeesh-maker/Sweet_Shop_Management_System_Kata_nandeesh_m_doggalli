import express from 'express';
import { purchaseSweetHandler, restockSweetHandler } from '../controllers/sweetController';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// Purchase a sweet (requires authentication)
router.post('/:id/purchase', authenticateToken, purchaseSweetHandler);

// Restock a sweet (requires authentication and admin role)
router.post('/:id/restock', authenticateToken, requireAdmin, restockSweetHandler);

export default router;
