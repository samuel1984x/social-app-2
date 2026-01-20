# Social App REST API - Swagger Documentation

## Overview

The Social App REST API now features comprehensive Swagger/OpenAPI 3.0.0 documentation available at `http://localhost:3000/api-docs/`

## API Structure

The API is organized into 5 main categories:

### 1. **Authentication** (`/auth`)

Handles user registration, login, token refresh, and logout.

| Method | Endpoint         | Description          | Auth Required |
| ------ | ---------------- | -------------------- | :-----------: |
| POST   | `/auth/register` | Register new user    |      No       |
| POST   | `/auth/login`    | User login           |      No       |
| POST   | `/auth/refresh`  | Refresh access token |      No       |
| POST   | `/auth/logout`   | User logout          |      Yes      |

**Token Details:**

- Access Token: Expires in 15 minutes
- Refresh Token: Expires in 7 days
- Authentication Method: Bearer JWT

### 2. **Users** (`/users`)

Manages user profiles and account operations.

| Method | Endpoint      | Description         | Auth Required |
| ------ | ------------- | ------------------- | :-----------: |
| POST   | `/users`      | Create user         |      No       |
| GET    | `/users`      | Get all users       |      No       |
| GET    | `/users/{id}` | Get user by ID      |      No       |
| PUT    | `/users/{id}` | Update user profile |      Yes      |
| DELETE | `/users/{id}` | Delete user         |      Yes      |

**User Fields:**

- username (3-30 characters, unique)
- email (unique, valid format)
- password (min 6 characters, hashed)
- firstName (optional)
- lastName (optional)
- bio (optional, max 500 characters)
- profileImage (optional)

### 3. **Posts** (`/post`)

Create, read, update, and delete user posts.

| Method | Endpoint     | Description                            | Auth Required |
| ------ | ------------ | -------------------------------------- | :-----------: |
| POST   | `/post`      | Create post                            |      Yes      |
| GET    | `/post`      | Get all posts (optional userId filter) |      No       |
| GET    | `/post/{id}` | Get post by ID                         |      No       |
| PUT    | `/post/{id}` | Update post                            |      Yes      |
| DELETE | `/post/{id}` | Delete post                            |      Yes      |

**Query Parameters:**

- `userId`: Optional filter to get posts by specific user

**Post Fields:**

- message (required)
- userId (required, references User)
- createdAt (auto-generated)
- updatedAt (auto-generated)

### 4. **Comments** (`/comments`)

Manage comments on posts.

| Method | Endpoint                  | Description             | Auth Required |
| ------ | ------------------------- | ----------------------- | :-----------: |
| GET    | `/comments`               | Get all comments        |      No       |
| GET    | `/comments/{id}`          | Get comment by ID       |      No       |
| GET    | `/comments/post/{postId}` | Get comments by post ID |      No       |
| POST   | `/comments`               | Create comment          |      Yes      |
| PUT    | `/comments/{id}`          | Update comment          |      Yes      |
| DELETE | `/comments/{id}`          | Delete comment          |      Yes      |

**Comment Fields:**

- postId (required, references Post)
- userId (required, references User)
- content (required)
- createdAt (auto-generated)
- updatedAt (auto-generated)

### 5. **Health** (`/health`)

Server health check endpoint.

| Method | Endpoint  | Description         |
| ------ | --------- | ------------------- |
| GET    | `/health` | Server health check |

## Data Schemas

### User Schema

```json
{
  "_id": "MongoDB ObjectId",
  "username": "string (3-30 chars, unique)",
  "email": "string (valid email, unique)",
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "bio": "string (optional, max 500 chars)",
  "profileImage": "string (optional, URL)",
  "createdAt": "ISO 8601 DateTime",
  "updatedAt": "ISO 8601 DateTime"
}
```

### Post Schema

```json
{
  "_id": "MongoDB ObjectId",
  "message": "string",
  "userId": "User object (populated)",
  "createdAt": "ISO 8601 DateTime",
  "updatedAt": "ISO 8601 DateTime"
}
```

### Comment Schema

```json
{
  "_id": "MongoDB ObjectId",
  "postId": "Post object (populated)",
  "userId": "User object (populated)",
  "content": "string",
  "createdAt": "ISO 8601 DateTime",
  "updatedAt": "ISO 8601 DateTime"
}
```

### Authentication Response

```json
{
  "message": "string",
  "user": "User object (without password)",
  "accessToken": "JWT token (15 min expiry)",
  "refreshToken": "JWT token (7 day expiry)"
}
```

## HTTP Status Codes

| Code | Meaning               | Used For                                                  |
| ---- | --------------------- | --------------------------------------------------------- |
| 200  | OK                    | Successful GET, PUT, DELETE, POST (refresh/logout)        |
| 201  | Created               | Successful POST (user/post/comment creation)              |
| 400  | Bad Request           | Missing/invalid fields, invalid IDs, invalid email format |
| 401  | Unauthorized          | Invalid credentials, expired token, invalid token         |
| 404  | Not Found             | User/post/comment doesn't exist                           |
| 409  | Conflict              | Duplicate username/email                                  |
| 500  | Internal Server Error | Server-side errors                                        |

## Authentication & Security

**Bearer Token Authentication:**

```
Authorization: Bearer <access_token>
```

**Protected Endpoints:**

- PUT `/users/{id}` - Update own profile
- DELETE `/users/{id}` - Delete own account
- POST `/post` - Create post
- PUT `/post/{id}` - Update own post
- DELETE `/post/{id}` - Delete own post
- POST `/comments` - Create comment
- PUT `/comments/{id}` - Update own comment
- DELETE `/comments/{id}` - Delete own comment
- POST `/auth/logout` - Logout

**Security Features:**

- Password hashing with bcrypt (10 salt rounds)
- Email validation with regex pattern
- Unique constraints on username and email
- JWT-based token authentication
- Refresh token storage in database with TTL

## Usage Examples

### Register User

```bash
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login User

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Post (Authenticated)

```bash
POST /post
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "message": "Hello, World!",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Get Posts by User

```bash
GET /post?userId=507f1f77bcf86cd799439011
```

### Create Comment (Authenticated)

```bash
POST /comments
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "postId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "content": "Great post!"
}
```

### Refresh Token

```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

## Implementation Details

### Configuration

- **Swagger Configuration File:** [src/config/swagger.ts](src/config/swagger.ts)
- **Reusable Schemas:** Defined in swagger.ts for User, Post, Comment, AuthResponse, and Error
- **JSDoc Comments:** Added to all controller functions for automatic API documentation

### File Locations

- Auth Controller: [src/controllers/auth_controller.ts](src/controllers/auth_controller.ts)
- User Controller: [src/controllers/user_controller.ts](src/controllers/user_controller.ts)
- Post Controller: [src/controllers/post_controller.ts](src/controllers/post_controller.ts)
- Comment Controller: [src/controllers/comment_controller.ts](src/controllers/comment_controller.ts)
- App Setup: [src/app.ts](src/app.ts)

### Swagger UI Features

- **Interactive Testing:** Test all endpoints directly from Swagger UI
- **Schema Visualization:** View complete data structure for each endpoint
- **Response Examples:** See example responses for all status codes
- **Authorization:** Built-in support for Bearer token testing
- **Try It Out:** Execute real requests to the API

## Accessing Swagger Documentation

**Local Development:**

```
http://localhost:3000/api-docs/
```

The Swagger UI provides:

- Complete endpoint documentation
- Request/response schemas
- Live API testing capability
- Parameter and body validation examples
- HTTP status code descriptions

## Key Features

✅ **16 Documented Endpoints** - All CRUD operations fully documented
✅ **5 Reusable Data Schemas** - User, Post, Comment, AuthResponse, Error
✅ **Complete HTTP Status Codes** - 200, 201, 400, 401, 404, 409, 500
✅ **Authentication Documentation** - Bearer JWT clearly specified
✅ **Request/Response Examples** - Realistic examples for all scenarios
✅ **Parameter Validation** - Field constraints and requirements visible
✅ **Interactive Testing** - Test endpoints directly from Swagger UI
✅ **Security Annotations** - Protected endpoints clearly marked

## Testing the API

Use the Swagger UI to test endpoints:

1. Navigate to `http://localhost:3000/api-docs/`
2. Click on any endpoint to expand it
3. Click "Try it out" button
4. Enter required parameters and request body
5. Click "Execute" to send the request
6. View the response status and body

For authenticated endpoints:

1. First, register or login to get an access token
2. Click the "Authorize" button at the top of Swagger UI
3. Enter: `Bearer <your_access_token>`
4. Click "Authorize" to apply to all subsequent requests
5. Now you can test protected endpoints

## Next Steps

- Use the Swagger UI for frontend development reference
- Share the API documentation URL with your team
- Use the interactive testing for rapid API validation
- Keep JSDoc comments updated as you modify endpoints
- Extend schemas and add new endpoints following the established pattern
