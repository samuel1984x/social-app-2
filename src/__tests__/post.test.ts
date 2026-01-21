import request from 'supertest';
import app from '../app';
import Post from '../models/post_model';
import User from '../models/user_model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Post Endpoints', () => {
  let userId: string;
  let postId: string;
  let accessToken: string;

  beforeAll(async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10)
    });

    userId = user._id.toString();
    accessToken = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
      { expiresIn: '15m' }
    );

    const post = await Post.create({
      message: 'Test post',
      userId: user._id
    });

    postId = post._id.toString();
  });

  afterAll(async () => {
    await Post.deleteMany({});
    await User.deleteMany({});
  });

  describe('POST /post', () => {
    it('should create a new post with authentication', async () => {
      const res = await request(app)
        .post('/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          message: 'New post content',
          userId
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('New post content');
      expect(res.body.userId).toBeDefined();
    });

    it('should fail without authentication token', async () => {
      const res = await request(app)
        .post('/post')
        .send({
          message: 'New post',
          userId
        });

      expect(res.status).toBe(401);
    });

    it('should fail without required fields', async () => {
      const res = await request(app)
        .post('/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId
        });

      expect(res.status).toBe(400);
    });

    it('should fail with invalid userId', async () => {
      const res = await request(app)
        .post('/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          message: 'New post',
          userId: 'invalid-id'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /post', () => {
    it('should get all posts', async () => {
      const res = await request(app).get('/post');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should filter posts by userId', async () => {
      const res = await request(app).get(`/post?userId=${userId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((post: any) => {
        expect(post.userId._id).toBe(userId);
      });
    });
  });

  describe('GET /post/:id', () => {
    it('should get post by ID', async () => {
      const res = await request(app).get(`/post/${postId}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(postId);
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/post/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/post/invalid-id');

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /post/:id', () => {
    it('should update post with authentication', async () => {
      const res = await request(app)
        .put(`/post/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          message: 'Updated post content',
          userId
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Updated post content');
    });

    it('should fail without authentication token', async () => {
      const res = await request(app)
        .put(`/post/${postId}`)
        .send({
          message: 'Updated content',
          userId
        });

      expect(res.status).toBe(401);
    });

    it('should fail without required fields', async () => {
      const res = await request(app)
        .put(`/post/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId
        });

      expect(res.status).toBe(400);
    });

    it('should fail with invalid ID format', async () => {
      const res = await request(app)
        .put('/post/invalid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          message: 'Updated content',
          userId
        });

      expect(res.status).toBe(400);
    });

    it('should fail to update non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`/post/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          message: 'Updated content',
          userId
        });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /post/:id', () => {
    it('should delete post with authentication', async () => {
      const postToDelete = await Post.create({
        message: 'Post to delete',
        userId
      });

      const deleteRes = await request(app)
        .delete(`/post/${postToDelete._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(deleteRes.status).toBe(200);

      const getRes = await request(app).get(`/post/${postToDelete._id}`);
      expect(getRes.status).toBe(404);
    });

    it('should fail without authentication token', async () => {
      const res = await request(app).delete(`/post/${postId}`);

      expect(res.status).toBe(401);
    });

    it('should fail with invalid ID format', async () => {
      const res = await request(app)
        .delete('/post/invalid-id')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(400);
    });

    it('should fail to delete non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/post/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });
  });
});
