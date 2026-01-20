import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import userRouter from './routes/user_routes';
import postRouter from './routes/post_routes';
import commentRouter from './routes/comment_routes';
import authRouter from './routes/auth_routes';
import { swaggerSpec } from './config/swagger';

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

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/post', postRouter);
app.use('/comments', commentRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

export default app;
