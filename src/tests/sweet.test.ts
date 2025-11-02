import request from 'supertest';
import app from '../app';

describe('Sweet Management', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    // Register admin user
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'admin123',
        name: 'Admin User'
      });

    // Login as admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'admin123'
      });
    adminToken = adminLogin.body.token;

    // Register regular user
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@test.com',
        password: 'user123',
        name: 'Regular User'
      });

    // Login as user
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'user123'
      });
    userToken = userLogin.body.token;
  });

  describe('GET /api/sweets', () => {
    it('should return all sweets', async () => {
      const response = await request(app)
        .get('/api/sweets');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Sweets retrieved successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/sweets/search', () => {
    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=Chocolate');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Search completed');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      // Should find Chocolate Bar
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name.toLowerCase()).toContain('chocolate');
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=chocolate');

      expect(response.status).toBe(200);
      expect(response.body.data.every((sweet: any) => sweet.category === 'chocolate')).toBe(true);
    });

    it('should filter by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=1&maxPrice=3');

      expect(response.status).toBe(200);
      expect(response.body.data.every((sweet: any) => sweet.price >= 1 && sweet.price <= 3)).toBe(true);
    });
  });

  describe('POST /api/sweets', () => {
    it('should allow admin to add new sweet', async () => {
      const newSweet = {
        name: 'Test Candy',
        category: 'candy',
        price: 1.50,
        quantity: 20
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newSweet);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Sweet added successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject(newSweet);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Candy',
          category: 'candy',
          price: 2.00,
          quantity: 10
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Admin access required');
    });

    it('should return 401 for unauthenticated users', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send({
          name: 'Unauthorized Candy',
          category: 'candy',
          price: 2.00,
          quantity: 10
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Incomplete Candy'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'All fields are required');
    });
  });

  describe('POST /api/inventory/:id/purchase', () => {
    it('should allow authenticated user to purchase sweets', async () => {
      const response = await request(app)
        .post('/api/inventory/1/purchase')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Purchase successful');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('sweet');
      expect(response.body.data).toHaveProperty('quantityPurchased', 1);
      expect(response.body.data).toHaveProperty('remainingQuantity');
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .post('/api/inventory/999/purchase')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Sweet not found');
    });

    it('should return 400 for insufficient quantity', async () => {
      const response = await request(app)
        .post('/api/inventory/1/purchase')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1000 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Insufficient quantity available');
    });

    it('should return 401 for unauthenticated users', async () => {
      const response = await request(app)
        .post('/api/inventory/1/purchase')
        .send({ quantity: 1 });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication required');
    });
  });

  describe('POST /api/inventory/:id/restock', () => {
    it('should allow admin to restock sweets', async () => {
      const response = await request(app)
        .post('/api/inventory/1/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Restock successful');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('sweet');
      expect(response.body.data).toHaveProperty('quantityAdded', 5);
      expect(response.body.data).toHaveProperty('newQuantity');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/inventory/1/restock')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Admin access required');
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .post('/api/inventory/999/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Sweet not found');
    });
  });
});
