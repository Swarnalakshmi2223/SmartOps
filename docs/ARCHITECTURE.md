# SmartOps Architecture

SmartOps is a MERN service-request platform with three authenticated roles:

- **User**: creates and tracks personal service requests.
- **Staff**: works on requests assigned by an administrator and completes assigned tasks.
- **Admin**: manages users, staff, reference data, requests, reports, analytics, audit logs, and AI review.

## Runtime architecture

```text
React + Vite frontend (localhost:5173)
        |
        | Axios REST API + JWT Bearer token
        v
Express HTTP server (localhost:5000)
        |\
        | \ Socket.IO authenticated connections
        v   v
MongoDB   role-scoped realtime events
```

The backend creates an HTTP server so Express and Socket.IO share the same
port. MongoDB is accessed through Mongoose. The frontend stores the login
token and sends it in the `Authorization: Bearer <token>` header for
protected API calls.

For deployment, the backend origin is controlled by `FRONTEND_ORIGIN`, while
the frontend uses `VITE_API_URL` for REST calls and `VITE_SOCKET_URL` for
Socket.IO. These values must point to the deployed HTTPS origins; localhost
values are development fallbacks only.

## Backend structure

```text
Backend/
├── src/
│   ├── server.js                 Express, middleware, routes, Socket.IO startup
│   ├── config/db.js              MongoDB connection
│   ├── models/                   Mongoose schemas
│   ├── controllers/              Request handlers and validation
│   ├── routes/                   Mounted REST route modules
│   ├── middleware/               JWT, role, and upload middleware
│   ├── services/                 Email and in-app notification services
│   ├── ai/                       Deterministic rule-based AI
│   ├── socket/socketServer.js    Authenticated Socket.IO rooms/events
│   └── utils/auditLogger.js      Audit-log helper
└── testEmail.js                  Email connection/send smoke test
```

Only the route modules mounted in `src/server.js` are part of the running
API. The old development test-route module is not mounted.

## Frontend structure

```text
Frontend/src/
├── App.jsx                       Public and role-based routes
├── context/AuthContext.jsx       Login state and JWT persistence
├── services/api.js               Axios client and auth-expiry handling
├── routes/ProtectedRoute.jsx     Role-based route guard
├── layouts/DashboardLayout.jsx  Shared authenticated layout
├── components/                   Sidebar and navbar
└── pages/
    ├── auth/                     Login and registration
    ├── user/                     User dashboard and requests
    ├── staff/                    Staff dashboard, requests, and tasks
    ├── admin/                    Admin management pages and AI review
    ├── shared/                   Settings
    └── Notifications.jsx         Shared notifications page
```

## Data model

The active MongoDB collections are represented by these models:

- `User`: name, email, phone, department, bcrypt password hash, role, active status.
- `Request`: title, description, category, department, priority, status, creator,
  assignee, attachment, resolution, evidence, status history, comments, and
  stored rule-based AI analysis/duplicate suggestions.
- `Task`: admin-created staff tasks, assignment, status, and completion data.
- `Notification`: user notification, type, read state, and related request/task.
- `Feedback`: user feedback associated with a request.
- `Department` and `Category`: administrator-managed reference data.
- `AuditLog`: administrator-visible activity records.

## Request lifecycle

```text
Pending → Assigned → In Progress → Resolved → Closed
```

The administrator assigns requests. Assigned staff can start and resolve
them. The request owner closes a resolved request. Status history is stored
inside the request document.

## Authentication and authorization

`authMiddleware` validates the JWT, loads the active user, and sets
`req.user`. `roleMiddleware` applies role restrictions at route level. Login
tokens expire after one hour. The frontend clears expired tokens and returns
the user to `/login` after a 401 response.

## AI implementation

AI is deterministic and rule-based; no machine-learning model is used.

- Category, department, and priority suggestions are keyword matches.
- Duplicate detection compares meaningful words in the new request with
  existing request text and stores suggestions on the request.
- Users can request suggestions while creating a request.
- Administrators review stored classification suggestions and duplicate
  suggestions.
- AI never automatically assigns, closes, deletes, merges, or overrides a
  request.

## Email and notifications

Request creation saves the request first, then looks up the creator's email
from MongoDB and awaits `sendEmail()`. Email failure is logged without making
the already-created request fail. In-app notifications are stored in
MongoDB by `notificationService.js` and delivered to connected users through
Socket.IO events.

## Socket.IO

Socket connections authenticate with the same JWT used by REST APIs. Users
join `user:<id>` and `role:<role>` rooms. The backend emits request, task, and
notification events to the affected user and/or administrator room. Socket
events refresh relevant frontend lists; they do not replace REST persistence.

## File storage and production operations

Request attachments and resolution evidence are currently stored on the
backend filesystem under `Backend/uploads`. Files are limited by the upload
middleware to 5 MB and are served only through authenticated request routes.
This is suitable for local development or a server with persistent disk, but
a production deployment must mount durable storage or replace this strategy
with an approved object-storage integration before using multiple instances
or ephemeral containers.

The server currently writes operational and error messages to its process
console. Production should run it under a process manager and route stdout
and stderr to the hosting platform's log collection and alerting system.
The HTTP listener starts while MongoDB connection setup is in progress, so
deployment health checks should verify both the root endpoint and database
connectivity before accepting traffic.

## Explicitly not implemented

The following are not part of the final implementation and must not be
documented as available features:

- Operational Intelligence dashboard and its health/bottleneck/attention modules.
- Machine-learning AI.
- Automatic request assignment or workload redistribution.
- Automatic duplicate merge or deletion.
- Public staff/admin registration.
- Mounted `/api/test` endpoints.
