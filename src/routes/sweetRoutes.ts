import express from 'express';
import {
  getSweets,
  searchSweetsHandler,
  createSweet,
  updateSweetHandler,
  deleteSweetHandler
} from '../controllers/sweetController';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getSweets);
router.get('/search', searchSweetsHandler);

// Protected routes (require authentication)
router.post('/', authenticateToken, requireAdmin, createSweet);
router.put('/:id', authenticateToken, requireAdmin, updateSweetHandler);
router.delete('/:id', authenticateToken, requireAdmin, deleteSweetHandler);

export default router;
