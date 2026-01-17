import { Document } from 'mongoose';

export interface IPost extends Document {
  message: string;
  sender: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IComment extends Document {
  postId: string;
  sender: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}
