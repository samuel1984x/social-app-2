# Social App REST API

## Overview

A REST API for a social media application built with Node.js, Express, TypeScript, and MongoDB. Includes user management, posts, comments, JWT authentication, and comprehensive testing.

## Features

- User registration and login with JWT authentication
- Full CRUD operations for posts and comments  
- Refresh token system with 7-day expiry
- Protected routes requiring authentication
- Swagger/OpenAPI interactive documentation
- Comprehensive Jest unit tests
- TypeScript for type safety

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=3000
DATABASE_URL=mongodb://127.0.0.1:27017/social_app
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Quick Start

### View API Documentation
```
http://localhost:3000/api-docs
```

### Test Endpoints
Open `request.rest` in VS Code with the REST Client extension and run the requests.

### Run Tests
```bash
npm test
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Users
- `POST /users` - Create user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user (protected)
- `DELETE /users/:id` - Delete user (protected)

### Posts
- `POST /post` - Create post (protected)
- `GET /post` - Get all posts
- `GET /post?userId={id}` - Get posts by user
- `GET /post/:id` - Get post by ID
- `PUT /post/:id` - Update post (protected)
- `DELETE /post/:id` - Delete post (protected)

### Comments
- `POST /comments` - Create comment (protected)
- `GET /comments` - Get all comments
- `GET /comments/:id` - Get comment by ID
- `GET /comments/post/:postId` - Get comments for post
- `PUT /comments/:id` - Update comment (protected)
- `DELETE /comments/:id` - Delete comment (protected)

## Project Structure

```
src/
├── app.ts
├── server.ts
├── middleware/
│   └── auth.ts
├── config/
│   └── swagger.ts
├── models/
│   ├── user_model.ts
│   ├── post_model.ts
│   ├── comment_model.ts
│   └── refresh_token_model.ts
├── controllers/
│   ├── auth_controller.ts
│   ├── user_controller.ts
│   ├── post_controller.ts
│   └── comment_controller.ts
├── routes/
│   ├── auth_routes.ts
│   ├── user_routes.ts
│   ├── post_routes.ts
│   └── comment_routes.ts
├── types/
│   └── index.ts
└── __tests__/
    ├── auth.test.ts
    ├── user.test.ts
    ├── post.test.ts
    └── comment.test.ts
```

## Authentication

To use protected endpoints, include the access token in the Authorization header:
```
Authorization: Bearer {accessToken}
```

Access tokens expire after 15 minutes. Use the refresh endpoint to get a new one.

## Scripts

- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm run build` - Build TypeScript
- `npm test` - Run tests
- `npm lint` - Run linter

## Technologies

- Node.js & Express
- TypeScript
- MongoDB & Mongoose
- JWT (jsonwebtoken)
- bcrypt
- Jest & Supertest
- Swagger/OpenAPI

## Notes

- MongoDB must be running locally
- Ensure all environment variables are set in `.env`
- Run `npm test` to verify everything works before submitting
