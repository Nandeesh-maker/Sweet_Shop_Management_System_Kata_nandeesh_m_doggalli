import { getDB } from '../config/database';

export interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface Purchase {
  id: number;
  user_id: number;
  sweet_id: number;
  quantity: number;
  total_price: number;
  created_at: string;
}

// Sweet service functions
export const getAllSweets = async (): Promise<Sweet[]> => {
  const db = getDB();
  return await db.all('SELECT * FROM sweets ORDER BY id');
};

export const getSweetById = async (id: number): Promise<Sweet | undefined> => {
  const db = getDB();
  return await db.get('SELECT * FROM sweets WHERE id = ?', id);
};

export const searchSweets = async (filters: {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Sweet[]> => {
  const db = getDB();
  let query = 'SELECT * FROM sweets WHERE 1=1';
  const params: any[] = [];

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

export const addSweet = async (sweet: Omit<Sweet, 'id'>): Promise<Sweet> => {
  const db = getDB();
  const result = await db.run(
    'INSERT INTO sweets (name, category, price, quantity) VALUES (?, ?, ?, ?)',
    [sweet.name, sweet.category, sweet.price, sweet.quantity]
  );

  return {
    id: result.lastID!,
    ...sweet
  };
};

export const updateSweet = async (id: number, updates: Partial<Omit<Sweet, 'id'>>): Promise<Sweet | null> => {
  const db = getDB();
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

  if (fields.length === 0) return null;

  params.push(id);
  await db.run(`UPDATE sweets SET ${fields.join(', ')} WHERE id = ?`, params);

  const updatedSweet = await getSweetById(id);
  return updatedSweet || null;
};

export const deleteSweet = async (id: number): Promise<boolean> => {
  const db = getDB();
  const result = await db.run('DELETE FROM sweets WHERE id = ?', id);
  return result.changes! > 0;
};

export const purchaseSweet = async (sweetId: number, quantity: number, userId: number): Promise<{ sweet: Sweet; quantityPurchased: number; remainingQuantity: number }> => {
  const db = getDB();
  const sweet = await getSweetById(sweetId);
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
    await db.run(
      'INSERT INTO purchases (user_id, sweet_id, quantity, total_price) VALUES (?, ?, ?, ?)',
      [userId, sweetId, quantity, totalPrice]
    );

    // Commit transaction
    await db.run('COMMIT');

    const updatedSweet = await getSweetById(sweetId);
    return {
      sweet: updatedSweet!,
      quantityPurchased: quantity,
      remainingQuantity: updatedSweet!.quantity
    };
  } catch (error) {
    // Rollback on error
    await db.run('ROLLBACK');
    throw error;
  }
};

export const restockSweet = async (sweetId: number, quantity: number): Promise<{ sweet: Sweet; quantityAdded: number; newQuantity: number }> => {
  const db = getDB();
  const sweet = await getSweetById(sweetId);
  if (!sweet) {
    throw new Error('Sweet not found');
  }

  await db.run('UPDATE sweets SET quantity = quantity + ? WHERE id = ?', [quantity, sweetId]);

  const updatedSweet = await getSweetById(sweetId);
  return {
    sweet: updatedSweet!,
    quantityAdded: quantity,
    newQuantity: updatedSweet!.quantity
  };
};
