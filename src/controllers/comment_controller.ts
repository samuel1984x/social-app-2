import { Request, Response } from 'express';
import Comment from '../models/comment_model';
import { IComment } from '../types';

export const getAllComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export const getCommentsByPostId = async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await Comment.find({ postId: req.params.postId });
    res.json(comments);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export const getCommentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    res.json(comment);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export const createComment = async (req: Request, res: Response): Promise<void> => {
  const comment = new Comment({
    postId: req.body.postId,
    sender: req.body.sender,
    content: req.body.content,
  });

  try {
    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ message: error.message });
  }
};

export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedComment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    res.json(updatedComment);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ message: error.message });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);
    if (!deletedComment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};
