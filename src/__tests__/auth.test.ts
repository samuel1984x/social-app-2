import request from 'supertest';
import app from '../app';
import User from '../models/user_model';
import bcrypt from 'bcrypt';

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    // Connect to test database
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username, email, and password are required');
    });

    it('should fail with invalid email format', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('invalid email format');
    });

    it('should fail if email already exists', async () => {
      await User.create({
        username: 'existing',
        email: 'existing@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('username or email already exists');
    });

    it('should fail if username already exists', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'another@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('username or email already exists');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should fail with missing email or password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('email and password are required');
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('invalid email or password');
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('invalid email or password');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return new access token with valid refresh token', async () => {
      // First register and login to get refresh token
      const registerRes = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      const refreshToken = registerRes.body.refreshToken;

      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Token refreshed successfully');
      expect(res.body.accessToken).toBeDefined();
    });

    it('should fail without refresh token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('refresh token is required');
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('invalid refresh token');
    });
  });
});
