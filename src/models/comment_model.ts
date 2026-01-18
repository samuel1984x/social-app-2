import { Schema, model, Types } from 'mongoose';
import { IComment } from '../types';

const commentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Post',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IComment>('Comment', commentSchema);
