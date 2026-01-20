import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import Comment from '../models/comment_model';
import { IComment } from '../types';

/**
 * @swagger
 * /comments:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get all comments
 *     description: Retrieve all comments from the database
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getAllComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await Comment.find().populate('postId').populate('userId', '-password');
    res.json(comments);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /comments/post/{postId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get comments by post ID
 *     description: Retrieve all comments for a specific post
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: MongoDB ObjectId
 *         description: Post ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request - invalid post ID format
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
export const getCommentsByPostId = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    res.status(400).json({ message: 'invalid post id' });
    return;
  }

  try {
    const comments = await Comment.find({ postId }).populate('userId', '-password');
    res.json(comments);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get comment by ID
 *     description: Retrieve a specific comment by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: MongoDB ObjectId
 *         description: Comment ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request - invalid comment ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comment not found
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
export const getCommentById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'invalid comment id' });
    return;
  }

  try {
    const comment = await Comment.findById(id).populate('postId').populate('userId', '-password');
    if (!comment) {
      res.status(404).json({ message: 'comment not found' });
      return;
    }
    res.json(comment);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /comments:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a new comment
 *     description: Create a new comment on a post (requires authentication)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentInput'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
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
export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId, userId, content } = req.body;

    // Validation
    if (!postId || !userId || !content) {
      res.status(400).json({ message: 'postId, userId, and content are required' });
      return;
    }

    if (!isValidObjectId(postId)) {
      res.status(400).json({ message: 'invalid post id' });
      return;
    }

    if (!isValidObjectId(userId)) {
      res.status(400).json({ message: 'invalid user id' });
      return;
    }

    const comment = await Comment.create({ postId, userId, content });
    const populatedComment = await Comment.findById(comment._id).populate('userId', '-password');
    res.status(201).json(populatedComment);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ message: error.message });
  }
};

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     tags:
 *       - Comments
 *     summary: Update comment
 *     description: Update an existing comment (requires authentication)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: MongoDB ObjectId
 *         description: Comment ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated comment text
 *             required:
 *               - content
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request - missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comment not found
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
export const updateComment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'invalid comment id' });
    return;
  }

  try {
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ message: 'content is required' });
      return;
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    ).populate('userId', '-password');

    if (!updatedComment) {
      res.status(404).json({ message: 'comment not found' });
      return;
    }
    res.json(updatedComment);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ message: error.message });
  }
};

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete comment
 *     description: Delete a comment by its ID (requires authentication)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: MongoDB ObjectId
 *         description: Comment ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: comment deleted successfully
 *                 commentId:
 *                   type: string
 *       400:
 *         description: Bad request - invalid comment ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comment not found
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
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'invalid comment id' });
    return;
  }

  try {
    const deletedComment = await Comment.findByIdAndDelete(id);
    if (!deletedComment) {
      res.status(404).json({ message: 'comment not found' });
      return;
    }
    res.json({ message: 'comment deleted successfully', commentId: id });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};
