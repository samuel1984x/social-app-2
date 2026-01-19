import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import Post from '../models/post_model';
import { IPost } from '../types';

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
