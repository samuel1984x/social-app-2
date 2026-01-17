import { Schema, model } from 'mongoose';
import { IPost } from '../types';

const postSchema = new Schema<IPost>(
  {
    message: { type: String, required: true },
    sender: { type: String, required: true }
  },
  { timestamps: true }
);

export default model<IPost>('Post', postSchema);
