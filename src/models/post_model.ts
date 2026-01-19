import { Schema, model, Types } from 'mongoose';
import { IPost } from '../types';

const postSchema = new Schema<IPost>(
  {
    message: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

export default model<IPost>('Post', postSchema);
