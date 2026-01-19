import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import Comment from '../models/comment_model';
import { IComment } from '../types';

export const getAllComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await Comment.find().populate('postId').populate('userId', '-password');
    res.json(comments);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

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
