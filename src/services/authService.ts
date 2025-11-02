import { getDB } from '../config/database';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
}

// Auth service functions
export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const db = getDB();
  return await db.get('SELECT * FROM users WHERE email = ?', email);
};

export const getUserById = async (id: number): Promise<User | undefined> => {
  const db = getDB();
  return await db.get('SELECT * FROM users WHERE id = ?', id);
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const db = getDB();
  const result = await db.run(
    'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    [user.email, user.password, user.name, user.role]
  );

  return {
    id: result.lastID!,
    ...user
  };
};

export const getAllUsers = async (): Promise<User[]> => {
  const db = getDB();
  return await db.all('SELECT id, email, name, role FROM users ORDER BY id');
};

export const updateUser = async (id: number, updates: Partial<Omit<User, 'id'>>): Promise<User | null> => {
  const db = getDB();
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

  if (fields.length === 0) return null;

  params.push(id);
  await db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

  const updatedUser = await getUserById(id);
  return updatedUser || null;
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const db = getDB();
  const result = await db.run('DELETE FROM users WHERE id = ?', id);
  return result.changes! > 0;
};
