import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user_model';
import RefreshToken from '../models/refresh_token_model';

const jwtSecret = process.env.JWT_SECRET || 'your_secret_key';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key';
const tokenExpiry = process.env.JWT_EXPIRY || '15m';
const refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'username, email, and password are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'invalid email format' });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(409).json({ message: 'username or email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    const accessToken = jwt.sign({ userId: user._id, username: user.username }, jwtSecret, {
      expiresIn: tokenExpiry
    });

    const refreshTokenString = jwt.sign({ userId: user._id }, refreshSecret, {
      expiresIn: refreshExpiry
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      userId: user._id,
      token: refreshTokenString,
      expiresAt
    });

    const userObj = user.toObject();
    const { password: pwd, ...userResponse } = userObj;

    res.status(201).json({
      user: userResponse,
      accessToken,
      refreshToken: refreshTokenString
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: 'invalid email or password' });
      return;
    }

    const accessToken = jwt.sign({ userId: user._id, username: user.username }, jwtSecret, {
      expiresIn: tokenExpiry
    });

    const refreshTokenString = jwt.sign({ userId: user._id }, refreshSecret, {
      expiresIn: refreshExpiry
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      userId: user._id,
      token: refreshTokenString,
      expiresAt
    });

    const userObj = user.toObject();
    const { password: pwd, ...userResponse } = userObj;

    res.json({
      user: userResponse,
      accessToken,
      refreshToken: refreshTokenString
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const refreshTokenEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'refresh token is required' });
      return;
    }

    const decoded = jwt.verify(refreshToken, refreshSecret) as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: 'user not found' });
      return;
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken, userId: user._id });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      res.status(401).json({ message: 'invalid or expired refresh token' });
      return;
    }

    const newAccessToken = jwt.sign({ userId: user._id, username: user.username }, jwtSecret, {
      expiresIn: tokenExpiry
    });

    res.json({ accessToken: newAccessToken });
  } catch (err: any) {
    res.status(401).json({ message: 'invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    res.json({ message: 'logged out' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
