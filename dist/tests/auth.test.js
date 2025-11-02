"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
describe('Authentication', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'User registered successfully');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('email', 'test@example.com');
            expect(response.body.user).toHaveProperty('name', 'Test User');
            expect(response.body.user).toHaveProperty('role', 'user');
        });
        it('should return 400 if required fields are missing', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                email: 'test@example.com'
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Email, password, and name are required');
        });
        it('should return 400 if user already exists', async () => {
            // First register
            await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                email: 'duplicate@example.com',
                password: 'password123',
                name: 'Duplicate User'
            });
            // Try to register again
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                email: 'duplicate@example.com',
                password: 'password123',
                name: 'Duplicate User'
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'User already exists');
        });
    });
    describe('POST /api/auth/login', () => {
        beforeAll(async () => {
            // Register a user for login tests
            await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                email: 'login@example.com',
                password: 'password123',
                name: 'Login User'
            });
        });
        it('should login successfully with correct credentials', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'login@example.com',
                password: 'password123'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Login successful');
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', 'login@example.com');
            expect(response.body.user).toHaveProperty('role', 'user');
        });
        it('should return 400 if required fields are missing', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'login@example.com'
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Email and password are required');
        });
        it('should return 401 for invalid credentials', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'login@example.com',
                password: 'wrongpassword'
            });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid credentials');
        });
    });
    describe('GET /api/user/profile', () => {
        let token;
        beforeAll(async () => {
            // Register and login to get token
            await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                email: 'profile@example.com',
                password: 'password123',
                name: 'Profile User'
            });
            const loginResponse = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'profile@example.com',
                password: 'password123'
            });
            token = loginResponse.body.token;
        });
        it('should return user profile when authenticated', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('email', 'profile@example.com');
            expect(response.body.user).toHaveProperty('name', 'Profile User');
            expect(response.body.user).toHaveProperty('role', 'user');
            expect(response.body.user).toHaveProperty('memberSince');
        });
        it('should return 401 when no token provided', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/user/profile');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Authentication required');
        });
        it('should return 401 for invalid token', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/user/profile')
                .set('Authorization', 'Bearer invalid-token');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });
    });
});
