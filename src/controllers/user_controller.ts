import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user_model';
import { IUser } from '../types';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName, bio, profileImage } = req.body;

    // Validation
    if (!username || !email || !password) {
      res.status(400).json({ message: 'username, email, and password are required' });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'invalid email format' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(409).json({ message: 'username or email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      bio,
      profileImage
    });

    // Return user without password
    const userObj = user.toObject();
    const { password: pwd, ...userResponse } = userObj;

    res.status(201).json(userResponse);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'invalid user id' });
    return;
  }

  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'user not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'invalid user id' });
    return;
  }

  try {
    const { username, email, firstName, lastName, bio, profileImage } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'user not found' });
      return;
    }

    // Check if new username/email already exists (excluding current user)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        res.status(409).json({ message: 'username already exists' });
        return;
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'invalid email format' });
        return;
      }
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        res.status(409).json({ message: 'email already exists' });
        return;
      }
      user.email = email;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    // Return user without password
    const userObj = user.toObject();
    const { password: pwd, ...userResponse } = userObj;

    res.json(userResponse);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'invalid user id' });
    return;
  }

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ message: 'user not found' });
      return;
    }
    res.json({ message: 'user deleted successfully', userId: id });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};
