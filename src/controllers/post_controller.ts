import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import Post from '../models/post_model';
import { IPost } from '../types';

/**
 * @swagger
 * /post:
 *   post:
 *     tags:
 *       - Posts
 *     summary: Create a new post
 *     description: Create a new post with a message (requires authentication)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostInput'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request - missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const addPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, userId } = req.body;
    if (!message || !userId) {
      res.status(400).json({ message: 'message and userId are required' });
      return;
    }

    if (!isValidObjectId(userId)) {
      res.status(400).json({ message: 'invalid userId' });
      return;
    }

    const post = await Post.create({ message, userId });
    const populatedPost = await Post.findById(post._id).populate('userId', '-password');
    res.status(201).json(populatedPost);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /post:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Get all posts
 *     description: Retrieve all posts with optional filtering by userId
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: MongoDB ObjectId
 *         description: Filter posts by user ID (optional)
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: { userId?: string } = {};
    if (req.query.userId) filter.userId = req.query.userId as string;

    const posts = await Post.find(filter).populate('userId', '-password');
    res.json(posts);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Get post by ID
 *     description: Retrieve a specific post by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: MongoDB ObjectId
 *         description: Post ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request - invalid post ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'invalid post id' });
    return;
  }

  try {
    const post = await Post.findById(id).populate('userId', '-password');
    if (!post) {
      res.status(404).json({ message: 'post not found' });
      return;
    }
    res.json(post);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     tags:
 *       - Posts
 *     summary: Update post
 *     description: Update an existing post (requires authentication)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: MongoDB ObjectId
 *         description: Post ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostInput'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request - missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'invalid post id' });
    return;
  }

  const { message, userId } = req.body;
  if (!message || !userId) {
    res.status(400).json({ message: 'message and userId are required' });
    return;
  }

  if (!isValidObjectId(userId)) {
    res.status(400).json({ message: 'invalid userId' });
    return;
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: 'post not found' });
      return;
    }

    post.message = message;
    post.userId = userId;
    await post.save();

    const updatedPost = await Post.findById(id).populate('userId', '-password');
    res.json(updatedPost);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     tags:
 *       - Posts
 *     summary: Delete post
 *     description: Delete a post by its ID (requires authentication)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: MongoDB ObjectId
 *         description: Post ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: post deleted successfully
 *                 postId:
 *                   type: string
 *       400:
 *         description: Bad request - invalid post ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'invalid post id' });
    return;
  }

  try {
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      res.status(404).json({ message: 'post not found' });
      return;
    }
    res.json({ message: 'post deleted successfully', postId: id });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};
