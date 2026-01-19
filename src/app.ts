import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import userRouter from './routes/user_routes';
import postRouter from './routes/post_routes';
import commentRouter from './routes/comment_routes';

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/rest_assignment';
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on('error', (error: Error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

// Routes
app.use('/users', userRouter);
app.use('/post', postRouter);
app.use('/comments', commentRouter);

export default app;
