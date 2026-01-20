import request from 'supertest';
import app from '../app';
import Comment from '../models/comment_model';
import Post from '../models/post_model';
import User from '../models/user_model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Comment Endpoints', () => {
  let userId: string;
  let postId: string;
  let commentId: string;
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

    const comment = await Comment.create({
      postId: post._id,
      userId: user._id,
      content: 'Test comment'
    });

    commentId = comment._id.toString();
  });

  afterAll(async () => {
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});
  });

  describe('POST /comments', () => {
    it('should create a new comment with authentication', async () => {
      const res = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          postId,
          userId,
          content: 'New comment content'
        });

      expect(res.status).toBe(201);
      expect(res.body.content).toBe('New comment content');
      expect(res.body.postId).toBeDefined();
      expect(res.body.userId).toBeDefined();
    });

    it('should fail without authentication token', async () => {
      const res = await request(app)
        .post('/comments')
        .send({
          postId,
          userId,
          content: 'New comment'
        });

      expect(res.status).toBe(401);
    });

    it('should fail without required fields', async () => {
      const res = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          postId
        });

      expect(res.status).toBe(400);
    });

    it('should fail with invalid postId', async () => {
      const res = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          postId: 'invalid-id',
          userId,
          content: 'Comment'
        });

      expect(res.status).toBe(400);
    });

    it('should fail with invalid userId', async () => {
      const res = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          postId,
          userId: 'invalid-id',
          content: 'Comment'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /comments', () => {
    it('should get all comments', async () => {
      const res = await request(app).get('/comments');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /comments/:id', () => {
    it('should get comment by ID', async () => {
      const res = await request(app).get(`/comments/${commentId}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(commentId);
      expect(res.body.content).toBe('Test comment');
    });

    it('should return 404 for non-existent comment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/comments/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/comments/invalid-id');

      expect(res.status).toBe(400);
    });
  });

  describe('GET /comments/post/:postId', () => {
    it('should get all comments for a specific post', async () => {
      const res = await request(app).get(`/comments/post/${postId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((comment: any) => {
        expect(comment.postId).toBe(postId);
      });
    });

    it('should return 400 for invalid postId', async () => {
      const res = await request(app).get('/comments/post/invalid-id');

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /comments/:id', () => {
    it('should update comment with authentication', async () => {
      const res = await request(app)
        .put(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'Updated comment content'
        });

      expect(res.status).toBe(200);
      expect(res.body.content).toBe('Updated comment content');
    });

    it('should fail without authentication token', async () => {
      const res = await request(app)
        .put(`/comments/${commentId}`)
        .send({
          content: 'Updated content'
        });

      expect(res.status).toBe(401);
    });

    it('should fail without required fields', async () => {
      const res = await request(app)
        .put(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /comments/:id', () => {
    it('should delete comment with authentication', async () => {
      const commentToDelete = await Comment.create({
        postId,
        userId,
        content: 'Comment to delete'
      });

      const deleteRes = await request(app)
        .delete(`/comments/${commentToDelete._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(deleteRes.status).toBe(200);

      const getRes = await request(app).get(`/comments/${commentToDelete._id}`);
      expect(getRes.status).toBe(404);
    });

    it('should fail without authentication token', async () => {
      const res = await request(app).delete(`/comments/${commentId}`);

      expect(res.status).toBe(401);
    });
  });
});
