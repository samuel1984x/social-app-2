import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import Post from '../models/post_model';
import { IPost } from '../types';

export const addPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, sender } = req.body;
    if (!message || !sender) {
      res.status(400).json({ message: 'message and sender are required' });
      return;
    }

    const post = await Post.create({ message, sender });
    res.status(201).json(post);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: { sender?: string } = {};
    if (req.query.sender) filter.sender = req.query.sender as string;

    const posts = await Post.find(filter);
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
    const post = await Post.findById(id);
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

  const { message, sender } = req.body;
  if (!message || !sender) {
    res.status(400).json({ message: 'message and sender are required' });
    return;
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: 'post not found' });
      return;
    }

    post.message = message;
    post.sender = sender;
    await post.save();

    res.json(post);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};
