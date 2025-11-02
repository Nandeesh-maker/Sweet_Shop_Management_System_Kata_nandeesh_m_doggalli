import { Request, Response } from 'express';
import {
  getAllSweets,
  getSweetById,
  searchSweets,
  addSweet,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet
} from '../services/sweetService';

// Sweet controller functions
export const getSweets = async (req: Request, res: Response) => {
  try {
    const sweets = await getAllSweets();
    res.json({
      message: 'Sweets retrieved successfully',
      data: sweets,
      count: sweets.length
    });
  } catch (error) {
    console.error('Get sweets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchSweetsHandler = async (req: Request, res: Response) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    const filters: any = {};
    if (name) filters.name = (name as string).toLowerCase();
    if (category) filters.category = category as string;
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);

    const sweets = await searchSweets(filters);
    res.json({
      message: 'Search completed',
      data: sweets,
      count: sweets.length
    });
  } catch (error) {
    console.error('Search sweets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSweet = async (req: Request, res: Response) => {
  try {
    const { name, category, price, quantity } = req.body;

    if (!name || !category || !price || !quantity) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const newSweet = await addSweet({
      name,
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity)
    });

    res.status(201).json({
      message: 'Sweet added successfully',
      data: newSweet
    });
  } catch (error) {
    console.error('Create sweet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSweetHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedSweet = await updateSweet(parseInt(id), updates);
    if (!updatedSweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json({
      message: 'Sweet updated successfully',
      data: updatedSweet
    });
  } catch (error) {
    console.error('Update sweet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSweetHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await deleteSweet(parseInt(id));
    if (!deleted) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json({
      message: 'Sweet deleted successfully'
    });
  } catch (error) {
    console.error('Delete sweet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const purchaseSweetHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;
    const userId = req.userId!; // From auth middleware

    const result = await purchaseSweet(parseInt(id), parseInt(quantity), userId);

    res.json({
      message: 'Purchase successful',
      data: result
    });
  } catch (error) {
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

export const restockSweetHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity = 10 } = req.body;

    const result = await restockSweet(parseInt(id), parseInt(quantity));

    res.json({
      message: 'Restock successful',
      data: result
    });
  } catch (error) {
    console.error('Restock sweet error:', error);
    if (error instanceof Error && error.message === 'Sweet not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
