# SmartOps

## AI-Assisted Smart Operations and Service Request Management System

SmartOps is a MERN-based service request management system designed to
help organizations manage employee service requests, staff assignments,
and administrative operations.

The project is being developed module by module. The current
implementation focuses on the backend foundation, authentication and
authorization, user management, and the core request management
workflow.

------------------------------------------------------------------------

## Project Status

### Completed / Working

-   Authentication and Authorization
-   User Registration
-   User Login
-   Password Hashing using bcrypt
-   JWT Authentication
-   Role-Based Authorization
-   User Management
-   View All Users
-   View Individual User
-   Update User
-   Activate / Deactivate User
-   Delete User
-   Request Management
-   Create Request
-   View My Requests
-   View Request by ID
-   Update Request
-   Admin View All Requests
-   Admin Assign Request to Staff
-   Staff View Assigned Requests
-   Postman API testing
-   MongoDB data verification

### Currently In Progress

-   Staff request processing
-   Request status workflow refinement
-   Staff resolution workflow

### Planned Modules

-   Task Management
-   Notifications
-   Feedback
-   Search and Filtering
-   Reports
-   Analytics / Dashboard
-   Audit Logs
-   AI-assisted Request Classification
-   AI-based Priority Prediction
-   AI-based Department Recommendation
-   Duplicate Request Detection
-   Frontend Integration
-   Unit / Integration Testing
-   Deployment

------------------------------------------------------------------------

# 1. Project Overview

SmartOps is intended to provide a centralized platform for handling
organizational service requests.

The system supports three main roles:

1.  **User / Employee**
2.  **Staff / Support Team**
3.  **Administrator**

The current backend implementation uses role-based access control so
that different users can access different APIs according to their role.

------------------------------------------------------------------------

# 2. Current System Flow

``` text
                         SMARTOPS
                            |
              +-------------+-------------+
              |             |             |
             User          Staff         Admin
              |             |             |
              |             |             |
        Create Request      |       Manage Users
              |             |       View Requests
              |             |       Assign Requests
              |             |             |
              +-------------+-------------+
                            |
                       Request Flow
                            |
                      MongoDB Database
```

Current request lifecycle:

``` text
User creates request
        |
        v
Status: Pending
        |
        v
Admin views request
        |
        v
Admin assigns Staff
        |
        v
Status: Assigned
        |
        v
Staff views assigned request
        |
        v
Staff processing / resolution
```

------------------------------------------------------------------------

# 3. Technology Stack

## Backend

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   JWT
-   bcryptjs
-   CORS
-   dotenv
-   Multer
-   Nodemon

## Development / Testing

-   Postman
-   MongoDB / MongoDB Atlas
-   Visual Studio Code

## Planned Frontend

-   React
-   Vite
-   Axios
-   React Router

------------------------------------------------------------------------

# 4. Backend Project Structure

``` text
SmartOps/
│
├── Backend/
│   │
│   ├── .env
│   ├── package.json
│   │
│   └── src/
│       │
│       ├── server.js
│       │
│       ├── config/
│       │   └── db.js
│       │
│       ├── models/
│       │   ├── User.js
│       │   └── Request.js
│       │
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── userController.js
│       │   └── requestController.js
│       │
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── testRoutes.js
│       │   ├── userRoutes.js
│       │   └── requestRoutes.js
│       │
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   └── roleMiddleware.js
│       │
│       ├── services/
│       │
│       └── utils/
│
├── Frontend/
│
└── README.md
```

------------------------------------------------------------------------

# 5. Database

The project currently uses MongoDB.

Database:

``` text
smartops
```

Main collections currently used:

``` text
users
requests
```

------------------------------------------------------------------------

# 6. User Model

The current User model contains:

``` text
name
email
password
role
isActive
createdAt
updatedAt
```

Roles:

``` text
user
staff
admin
```

Example:

``` json
{
    "name": "Test Staff",
    "email": "teststaff@gmail.com",
    "role": "staff",
    "isActive": true
}
```

Passwords are stored as bcrypt hashes rather than plain-text passwords.

------------------------------------------------------------------------

# 7. Request Model

The current Request model contains:

``` text
title
description
category
priority
status
createdBy
assignedTo
attachment
createdAt
updatedAt
```

Current request statuses used in the project:

``` text
Pending
Assigned
In Progress
Resolved
Closed
```

Request relationship:

``` text
User
  |
  | createdBy
  v
Request
  |
  | assignedTo
  v
Staff
```

------------------------------------------------------------------------

# 8. Module 1 - Authentication and Authorization

## 8.1 User Registration

Endpoint:

``` http
POST /api/auth/register
```

Full URL:

``` text
http://localhost:5000/api/auth/register
```

Example request:

``` json
{
    "name": "Demo User",
    "email": "demouser@gmail.com",
    "password": "Password123"
}
```

The registration process:

``` text
Registration Request
        |
        v
Validate Input
        |
        v
Check Existing Email
        |
        v
Hash Password using bcrypt
        |
        v
Save User to MongoDB
```

------------------------------------------------------------------------

## 8.2 User Login

Endpoint:

``` http
POST /api/auth/login
```

Full URL:

``` text
http://localhost:5000/api/auth/login
```

Example:

``` json
{
    "email": "testuser@gmail.com",
    "password": "Password123"
}
```

After successful login, the backend generates a JWT token.

Flow:

``` text
Email + Password
       |
       v
Verify Credentials
       |
       v
Check Account Status
       |
       v
Generate JWT
       |
       v
Return Token
```

------------------------------------------------------------------------

## 8.3 JWT Authentication

Protected APIs require:

``` text
Authorization: Bearer <JWT_TOKEN>
```

The authentication middleware:

1.  Reads the Authorization header.
2.  Extracts the JWT.
3.  Verifies the JWT using the JWT secret.
4.  Stores the decoded user information in `req.user`.
5.  Allows the request to continue.

If the token is missing or invalid, the request is rejected.

------------------------------------------------------------------------

## 8.4 Role-Based Authorization

The project supports:

``` text
User
Staff
Admin
```

The role middleware checks whether the user's role is allowed to access
the requested API.

Example:

``` text
Admin API
    |
    +---- Admin token -> Allowed
    |
    +---- User token  -> 403 Forbidden
```

Authentication answers:

``` text
"Who are you?"
```

Authorization answers:

``` text
"What are you allowed to do?"
```

------------------------------------------------------------------------

# 9. Module 2 - User Management

User Management allows the administrator to manage registered accounts.

## Current operations

``` text
View all users
View one user
Update user
Activate user
Deactivate user
Delete user
```

------------------------------------------------------------------------

## 9.1 Get All Users

``` http
GET /api/users
```

Full URL:

``` text
http://localhost:5000/api/users
```

Role:

``` text
Admin
```

------------------------------------------------------------------------

## 9.2 Get One User

``` http
GET /api/users/:id
```

Example:

``` text
http://localhost:5000/api/users/USER_ID
```

Role:

``` text
Admin
```

------------------------------------------------------------------------

## 9.3 Update User

``` http
PUT /api/users/:id
```

Example body:

``` json
{
    "name": "Updated User",
    "email": "updateduser@gmail.com"
}
```

Role:

``` text
Admin
```

------------------------------------------------------------------------

## 9.4 Activate / Deactivate User

``` http
PATCH /api/users/:id/status
```

Deactivate:

``` json
{
    "isActive": false
}
```

Activate:

``` json
{
    "isActive": true
}
```

When an account is deactivated, the user cannot log in even with the
correct password.

------------------------------------------------------------------------

## 9.5 Delete User

``` http
DELETE /api/users/:id
```

Role:

``` text
Admin
```

------------------------------------------------------------------------

# 10. Module 3 - Request Management

The current Request Management module provides the basic request
lifecycle.

## Current operations

``` text
Create Request
View My Requests
View Request by ID
Update Request
Admin View All Requests
Admin Assign Request
Staff View Assigned Requests
```

------------------------------------------------------------------------

## 10.1 Create Request

``` http
POST /api/requests
```

Full URL:

``` text
http://localhost:5000/api/requests
```

Role:

``` text
User
```

Example body:

``` json
{
    "title": "Unable to access company email",
    "description": "I am unable to login to my company email account.",
    "category": "IT Support",
    "priority": "High"
}
```

When created:

``` text
status = Pending
createdBy = Logged-in User ID
assignedTo = null
```

------------------------------------------------------------------------

## 10.2 View My Requests

``` http
GET /api/requests/my
```

Full URL:

``` text
http://localhost:5000/api/requests/my
```

Role:

``` text
User
```

The API returns requests where:

``` text
createdBy == logged-in user ID
```

------------------------------------------------------------------------

## 10.3 View Request by ID

``` http
GET /api/requests/:id
```

Example:

``` text
http://localhost:5000/api/requests/REQUEST_ID
```

The backend verifies that the request belongs to the logged-in user
before returning it.

------------------------------------------------------------------------

## 10.4 Update Request

``` http
PUT /api/requests/:id
```

Example:

``` json
{
    "title": "Unable to access company email - Updated",
    "description": "I am still unable to login to my company email account.",
    "category": "IT Support",
    "priority": "High"
}
```

The backend checks that the logged-in user owns the request before
updating it.

------------------------------------------------------------------------

## 10.5 Admin View All Requests

``` http
GET /api/requests
```

Full URL:

``` text
http://localhost:5000/api/requests
```

Role:

``` text
Admin
```

The response includes request information and populated user information
where configured.

------------------------------------------------------------------------

## 10.6 Admin Assign Request to Staff

``` http
PATCH /api/requests/:id/assign
```

Example:

``` text
http://localhost:5000/api/requests/6abd2df66b3f408d79352366/assign
```

Role:

``` text
Admin
```

Example body:

``` json
{
    "staffId": "6abc00a7acf3b11329895dea"
}
```

The backend checks:

1.  Request exists.
2.  Staff user exists.
3.  Selected user has the `staff` role.
4.  Staff account is active.
5.  Request is assigned to that staff member.

After successful assignment:

``` text
assignedTo = Staff ID
status = Assigned
```

------------------------------------------------------------------------

## 10.7 Staff View Assigned Requests

``` http
GET /api/requests/assigned
```

Full URL:

``` text
http://localhost:5000/api/requests/assigned
```

Role:

``` text
Staff
```

The backend finds requests where:

``` text
assignedTo == logged-in staff ID
```

This ensures staff members see their assigned requests.

------------------------------------------------------------------------

# 11. Complete Request Workflow

``` text
USER
 |
 | POST /api/requests
 v
Request Created
 |
 | status = Pending
 v
ADMIN
 |
 | GET /api/requests
 v
Admin Reviews Request
 |
 | PATCH /api/requests/:id/assign
 v
Staff Assigned
 |
 | status = Assigned
 v
STAFF
 |
 | GET /api/requests/assigned
 v
Staff Receives Assigned Request
 |
 v
Processing / Resolution
```

------------------------------------------------------------------------

# 12. Current Test Accounts

For development and Postman testing:

  Role    Email                   Password
  ------- ----------------------- ---------------
  User    `testuser@gmail.com`    `Password123`
  Staff   `teststaff@gmail.com`   `Staff123`
  Admin   `testadmin@gmail.com`   `Admin123`

These are development/test credentials only and should not be used in
production.

------------------------------------------------------------------------

# 13. Postman API Summary

## Authentication

  Method   Endpoint               Role
  -------- ---------------------- --------
  POST     `/api/auth/register`   Public
  POST     `/api/auth/login`      Public

## User Management

  Method   Endpoint                  Role
  -------- ------------------------- -------
  GET      `/api/users`              Admin
  GET      `/api/users/:id`          Admin
  PUT      `/api/users/:id`          Admin
  PATCH    `/api/users/:id/status`   Admin
  DELETE   `/api/users/:id`          Admin

## Request Management

  Method   Endpoint                     Role
  -------- ---------------------------- -------
  POST     `/api/requests`              User
  GET      `/api/requests/my`           User
  GET      `/api/requests/:id`          User
  PUT      `/api/requests/:id`          User
  GET      `/api/requests`              Admin
  PATCH    `/api/requests/:id/assign`   Admin
  GET      `/api/requests/assigned`     Staff

Base URL:

``` text
http://localhost:5000
```

------------------------------------------------------------------------

# 14. API Security Flow

Every protected request follows this basic process:

``` text
Client / Postman
       |
       v
Express Route
       |
       v
authMiddleware
       |
       |-- Invalid / Missing JWT --> 401
       |
       v
roleMiddleware
       |
       |-- Wrong Role -----------> 403
       |
       v
Controller
       |
       v
MongoDB
       |
       v
Response
```

------------------------------------------------------------------------

# 15. Error Handling Currently Tested

The backend handles common cases including:

-   Missing required registration/request fields
-   Duplicate email registration
-   Invalid login credentials
-   Deactivated account login
-   Missing JWT
-   Invalid JWT
-   Unauthorized role access
-   Request not found
-   User not found
-   Invalid staff assignment
-   Inactive staff assignment
-   User trying to access another user's request

------------------------------------------------------------------------

# 16. Testing Approach

Postman is currently being used to test the backend APIs.

Testing includes:

``` text
Positive Tests
    |
    +-- Successful registration
    +-- Successful login
    +-- Successful request creation
    +-- Successful user management
    +-- Successful request assignment

Negative Tests
    |
    +-- Duplicate email
    +-- Wrong password
    +-- Missing JWT
    +-- Invalid JWT
    +-- Wrong role
    +-- Unauthorized request access
    +-- Invalid request/user
```

MongoDB is also used to verify that API operations correctly update the
stored documents.

------------------------------------------------------------------------

# 17. Environment Variables

Backend `.env`:

``` env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smartops
JWT_SECRET=your_secret_key
```

Do not commit the real `.env` file to GitHub.

Use `.env.example` for sharing the required environment variable names.

------------------------------------------------------------------------

# 18. How to Run the Backend

Navigate to:

``` text
D:\IRP_MERN_ICTAK\My_Project\SmartOps\Backend
```

Install dependencies:

``` bash
npm install
```

Run in development mode:

``` bash
npm run dev
```

Or run normally:

``` bash
npm start
```

The server runs on:

``` text
http://localhost:5000
```

Health check:

``` text
http://localhost:5000/
```

Expected response:

``` json
{
    "message": "SmartOps Backend is running"
}
```

------------------------------------------------------------------------

# 19. Current Development Progress

  Module                         Status
  ------------------------------ -----------------------
  Project Setup                  Completed
  Database Connection            Completed
  Authentication                 Completed
  Authorization                  Completed
  User Management                Completed
  Request Creation               Completed
  Request Viewing                Completed
  Request Updating               Completed
  Admin Request Viewing          Completed
  Admin Request Assignment       Completed
  Staff Assigned Requests        Completed
  Staff Resolution Workflow      In Progress
  Task Management                Planned
  Notifications                  Planned
  Feedback                       Planned
  Search & Filtering             Planned
  Reports                        Planned
  Analytics                      Planned
  Audit Logs                     Planned
  AI Classification              Planned
  AI Priority Prediction         Planned
  AI Department Recommendation   Planned
  Duplicate Detection            Planned
  Frontend                       Planned / In Progress
  Testing                        Ongoing
  Deployment                     Planned

------------------------------------------------------------------------

# 20. Future AI Features

The planned SmartOps AI layer will assist with:

### Request Classification

Automatically identify the type/category of a service request.

### Priority Prediction

Suggest request priority based on request information.

### Department Recommendation

Suggest the appropriate department or support team.

### Duplicate Request Detection

Identify requests that may be duplicates of existing requests.

The AI layer is intended to provide suggestions that can be reviewed by
authorized users rather than automatically making every final decision.

------------------------------------------------------------------------

# 21. Future Development Roadmap

``` text
Phase 1
Project Setup
       ↓
Phase 2
Authentication & Authorization
       ↓
Phase 3
User Management
       ↓
Phase 4
Request Management
       ↓
Phase 5
Staff Resolution
       ↓
Phase 6
Task Management
       ↓
Phase 7
Notifications
       ↓
Phase 8
Feedback
       ↓
Phase 9
Search & Filtering
       ↓
Phase 10
Reports & Analytics
       ↓
Phase 11
Audit Logs
       ↓
Phase 12
AI Features
       ↓
Phase 13
Frontend Integration
       ↓
Phase 14
Testing
       ↓
Phase 15
Deployment
```

------------------------------------------------------------------------

# 22. Project Objective

The overall objective of SmartOps is to provide a centralized service
request management platform where employees can submit requests,
administrators can manage and assign requests, staff can handle assigned
requests, and AI can later assist with classification, prioritization,
department recommendation and duplicate detection.

------------------------------------------------------------------------

## Author

**Swarnalakshmi Perumal**

B.E. Computer Science and Engineering

SmartOps Project



Postman cheat sheet
| #  | Method | URL                     | Token          |
| -- | ------ | ----------------------- | -------------- |
| 1  | POST   | `/api/auth/register`    | None           |
| 2  | POST   | `/api/auth/login`       | None           |
| 3  | GET    | `/api/test/protected`   | User           |
| 4  | GET    | `/api/test/user`        | User           |
| 5  | GET    | `/api/test/staff`       | Staff          |
| 6  | GET    | `/api/test/admin`       | Admin          |
| 7  | GET    | `/api/test/admin`       | User → **403** |
| 8  | GET    | `/api/users`            | Admin          |
| 9  | GET    | `/api/users/:id`        | Admin          |
| 10 | PUT    | `/api/users/:id`        | Admin          |
| 11 | PATCH  | `/api/users/:id/status` | Admin          |
| 12 | POST   | `/api/auth/login`       | None           |
| 13 | PATCH  | `/api/users/:id/status` | Admin          |
| 14 | POST   | `/api/auth/login`       | None           |
| 15 | DELETE | `/api/users/:id`        | Admin          |


Request Management API Cheat Sheet

| # | Method  | URL                        | Role  | Purpose                |
| - | ------- | -------------------------- | ----- | ---------------------- |
| 1 | `POST`  | `/api/requests`            | User  | Create request         |
| 2 | `GET`   | `/api/requests/my`         | User  | View own requests      |
| 3 | `GET`   | `/api/requests/:id`        | User  | View request details   |
| 4 | `PUT`   | `/api/requests/:id`        | User  | Update request         |
| 5 | `GET`   | `/api/requests`            | Admin | View all requests      |
| 6 | `PATCH` | `/api/requests/:id/assign` | Admin | Assign to staff        |
| 7 | `GET`   | `/api/requests/assigned`   | Staff | View assigned requests |
