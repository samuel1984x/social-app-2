import request from 'supertest';
import app from '../app';
import User from '../models/user_model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('User Endpoints', () => {
  let userId: string;
  let accessToken: string;

  beforeAll(async () => {
    // Create a test user
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Test',
      lastName: 'User'
    });

    userId = user._id.toString();
    accessToken = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
      { expiresIn: '15m' }
    );
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User'
        });

      expect(res.status).toBe(201);
      expect(res.body.username).toBe('newuser');
      expect(res.body.email).toBe('newuser@example.com');
      expect(res.body.password).toBeUndefined();
    });

    it('should fail without required fields', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          email: 'test@example.com'
        });

      expect(res.status).toBe(400);
    });

    it('should fail if username already exists', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          username: 'testuser',
          email: 'another@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(409);
    });

    it('should fail if email already exists', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          username: 'newuser2',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /users', () => {
    it('should get all users', async () => {
      const res = await request(app).get('/users');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should not include passwords in user objects', async () => {
      const res = await request(app).get('/users');

      expect(res.status).toBe(200);
      res.body.forEach((user: any) => {
        expect(user.password).toBeUndefined();
      });
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by ID', async () => {
      const res = await request(app).get(`/users/${userId}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(userId);
      expect(res.body.username).toBe('testuser');
      expect(res.body.password).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/users/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/users/invalid-id');

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user profile with authentication', async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          bio: 'Updated bio'
        });

      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe('Updated');
      expect(res.body.lastName).toBe('Name');
      expect(res.body.bio).toBe('Updated bio');
    });

    it('should fail without authentication token', async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .send({
          firstName: 'Updated'
        });

      expect(res.status).toBe(401);
    });

    it('should fail to update with invalid email format', async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'invalid-email'
        });

      expect(res.status).toBe(400);
    });

    it('should fail to update with duplicate email', async () => {
      const anotherUser = await User.create({
        username: 'anotheruser',
        email: 'another@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'another@example.com'
        });

      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user with authentication', async () => {
      const userToDelete = await User.create({
        username: 'todelete',
        email: 'delete@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const deleteRes = await request(app)
        .delete(`/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(deleteRes.status).toBe(200);

      const getRes = await request(app).get(`/users/${userToDelete._id}`);
      expect(getRes.status).toBe(404);
    });

    it('should fail without authentication token', async () => {
      const res = await request(app).delete(`/users/${userId}`);

      expect(res.status).toBe(401);
    });
  });
});
