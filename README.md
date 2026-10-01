# SmartOps

SmartOps is a MERN-stack request management system. It contains a React frontend, an Express REST API, and a MongoDB database accessed through Mongoose.

The main backend concepts are:

- User management and role-based access control
- User registration and JWT authentication
- Request creation, ownership, assignment, and status tracking
- Separate permissions for users, staff members, and administrators

## Project Structure

```text
SmartOps/
├── Backend/
│   └── src/
│       ├── config/        MongoDB connection
│       ├── controllers/   Authentication, user, and request logic
│       ├── middleware/    JWT authentication and role authorization
│       ├── models/        User and Request schemas
│       ├── routes/        Express API routes
│       └── server.js      API entry point
├── Frontend/
│   └── src/               React and Vite application
└── docs/                  Project documentation
```

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- React Icons

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens
- bcryptjs
- Multer
- CORS

## User Management

Users are stored in MongoDB with the following main information:

- Name
- Email address
- Hashed password
- Role
- Active or inactive account status
- Creation and update timestamps

The system supports three roles:

| Role    | Main responsibility                                           |
| ------- | ------------------------------------------------------------- |
| `user`  | Create and manage personal requests                           |
| `staff` | View requests assigned to them and update their progress      |
| `admin` | Manage users, view all requests, and assign requests to staff |

Administrators can list users, view an individual user, update user information, change roles, activate or deactivate accounts, and delete users.

## Authentication and Authorization

### Registration

Users register with a name, email, and password. The password is hashed with `bcryptjs` before it is stored. New accounts use the `user` role and are active by default.

### Login

Users log in with their email and password. The API checks the account status and compares the submitted password with the stored hash. A successful login returns a JSON Web Token containing the user ID and role.

The token expires after one hour. Protected requests must send it in the HTTP authorization header:

```http
Authorization: Bearer <token>
```

### Authorization Flow

1. The authentication middleware reads and verifies the JWT.
2. The decoded user ID and role are attached to the request.
3. The role middleware checks whether the current role is allowed for the route.
4. The controller performs the requested operation.

Unauthenticated requests receive `401 Unauthorized`. Authenticated users without the required role receive `403 Forbidden`.

## Request Management

Requests represent operational issues or service requests submitted by users.

Each request contains:

- Title
- Description
- Category
- Priority: `Low`, `Medium`, `High`, or `Critical`
- Status
- User who created the request
- Staff member assigned to the request, when applicable
- Optional attachment field
- Creation and update timestamps

### Request Workflow

1. A user creates a request with a title, description, and category.
2. The request starts with `Pending` status and `Medium` priority unless another priority is supplied.
3. An administrator views all requests and assigns a request to an active staff member.
4. Assignment changes the request status to `Assigned`.
5. The assigned staff member can update the request status.
6. The request owner can view and edit their own request and update its status.
7. Administrators can update any request status.

Users can only access their own requests. Staff members can only access requests assigned to them. Administrators can access all requests.

## API Overview

### Authentication Routes

Base path: `/api/auth`

- `POST /register` - Register a new user
- `POST /login` - Authenticate a user and return a JWT

### User Management Routes

Base path: `/api/users`

These routes require an authenticated administrator:

- `GET /` - List all users
- `GET /:id` - Get one user
- `PUT /:id` - Update user information
- `PUT /:id/role` - Change a user's role
- `PATCH /:id/status` - Activate or deactivate a user
- `DELETE /:id` - Delete a user

### Request Management Routes

Base path: `/api/requests`

- `POST /` - Create a request as a user
- `GET /my` - List the current user's requests
- `GET /:id` - View one request owned by the current user
- `PUT /:id` - Update a request owned by the current user
- `GET /assigned` - List requests assigned to the current staff member
- `PATCH /:id/status` - Update a request status according to the user's role
- `GET /` - List all requests as an administrator
- `PATCH /:id/assign` - Assign a request to a staff member as an administrator

The backend health endpoint is `GET /`.

## Environment Variables

Create `Backend/.env` with private local values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Never commit real database credentials, tokens, or secrets.

## Installation and Running

### Backend

```powershell
cd Backend
npm install
npm run dev
```

The API runs at `http://localhost:5000` by default. Use `npm start` to run it without Nodemon.

### Frontend

Open a second terminal:

```powershell
cd Frontend
npm install
npm run dev
```

Vite will display the local development URL in the terminal.

### Frontend Commands

- `npm run dev` - Start the Vite development server
- `npm run build` - Create a production build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build locally
