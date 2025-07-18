# HarvestConnect API Documentation

## User Authentication & Management API

### Base URL
```
http://localhost:5000/api
```

### Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Register User
**POST** `/users/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St, City",
  "phone_number": "1234567890",
  "password": "password123",
  "gender": "male",
  "role": "user"  // Optional: "user", "admin", "farmer" (default: "user")
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      // ... other user fields
    },
    "token": "jwt_token_here"
  }
}
```

### 2. Login User
**POST** `/users/login`

Authenticate a user and get a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
      // ... other user fields
    },
    "token": "jwt_token_here"
  }
}
```

### 3. Get User Profile
**GET** `/users/profile`

Get the current user's profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      // ... other user fields
    }
  }
}
```

### 4. Update User Profile
**PUT** `/users/profile`

Update the current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "address": "New Address",
  "phone_number": "0987654321",
  "gender": "female",
  "profilePicture": "image_url"
}
```

### 5. Change Password
**PUT** `/users/change-password`

Change the current user's password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

### 6. Update Specific User (Admin or Owner)
**PUT** `/users/:id`

Update a specific user's profile.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** Admin or the user themselves

**Request Body:** Same as update profile

### 7. Delete User (Admin or Owner)
**DELETE** `/users/:id`

Delete a specific user account.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** Admin or the user themselves

### 8. Get All Users (Admin Only)
**GET** `/users`

Get a paginated list of all users.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** Admin only

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Users per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      // Array of user objects
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "usersPerPage": 10
    }
  }
}
```

### 9. Get User by ID (Admin Only)
**GET** `/users/:id`

Get a specific user's information.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** Admin only

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Middleware

### Authentication Middleware
- `authenticateUser`: Verifies JWT token
- `authorizeAdmin`: Requires admin role
- `authorizeUser`: Requires user, farmer, or admin role
- `authorizeFarmer`: Requires farmer or admin role
- `authorizeOwnerOrAdmin`: Allows access to own data or admin access

## Environment Variables

Create a `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/harvestconnect
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```
