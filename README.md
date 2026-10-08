# SmartOps

SmartOps is a MERN-based AI-assisted service request management system for
employees, support staff, and administrators.

## Final implementation

The application currently includes:

- JWT authentication, bcrypt password hashing, role-based authorization, and
  public user registration.
- User profiles, password changes, administrator user management, and
  administrator-created staff accounts.
- User request creation, editing, personal request history, comments,
  attachments, resolution evidence, status history, assignment, and the
  `Pending → Assigned → In Progress → Resolved → Closed` workflow.
- Staff request processing and task management.
- In-app notifications with authenticated Socket.IO updates.
- Feedback, reports, analytics, audit logs, departments, and categories.
- Deterministic rule-based AI for category prediction, department
  recommendation, priority prediction, duplicate detection, and administrator
  review.
- Request-created email notifications through Nodemailer after successful
  MongoDB persistence.

Operational Intelligence, machine-learning models, automatic assignment,
automatic duplicate merging, and public staff/admin registration are not part
of the final implementation.

## Technology

- Backend: Node.js, Express, Mongoose, MongoDB, Socket.IO, JWT, bcryptjs,
  Multer, Nodemailer, Helmet, CORS.
- Frontend: React, Vite, React Router, Axios, React Icons, Socket.IO client.

## Quick start

See [docs/SETUP.md](./docs/SETUP.md) for complete setup instructions.

For deployment, configure `Backend/.env` from `Backend/.env.example` and set
`VITE_API_URL` and `VITE_SOCKET_URL` in `Frontend/.env` before running the
frontend build. The backend currently stores uploaded files in its local
`Backend/uploads` directory, so production must provide persistent disk or
an approved object-storage strategy.

```powershell
cd D:\IRP_MERN_ICTAK\My_Project\SmartOps\Backend
npm install
npm run dev
```

In another terminal:

```powershell
cd D:\IRP_MERN_ICTAK\My_Project\SmartOps\Frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Documentation

- [Setup](./docs/SETUP.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Workflows](./docs/WORKFLOWS.md)
- [Viva guide](./docs/VIVA_GUIDE.md)
- [API endpoints](./docs/API_ENDPOINTS.md)

## Roles

| Role | Main responsibility |
| --- | --- |
| User | Create, track, comment on, close, and give feedback on personal requests. |
| Staff | Work on assigned requests and tasks. |
| Admin | Manage the platform, assign work, review AI suggestions, and inspect reports/audit data. |

## API and authentication

The backend base URL is `http://localhost:5000`. Protected endpoints require:

```text
Authorization: Bearer <JWT_TOKEN>
```

The frontend Axios client is configured in
`Frontend/src/services/api.js`.

## AI behavior

SmartOps uses transparent keyword and word-overlap rules. The AI provides
assistive suggestions only. An administrator remains responsible for final
classification and duplicate decisions; no request is automatically assigned,
closed, deleted, or merged.

## Email behavior

When a user creates a request, the backend saves it first, loads the creator's
email from MongoDB, and awaits Nodemailer delivery. Email errors are logged and
do not undo a successfully saved request. Configure the `MAIL_*` variables in
`Backend/.env`; see [docs/SETUP.md](./docs/SETUP.md).

## Validation commands

```powershell
# Backend syntax check
node --check Backend/src/server.js

# Frontend production build
cd Frontend
npm run build
```

## Security notes

- Never commit `.env` files or credentials.
- Public registration cannot create staff or admin accounts.
- Passwords are stored as bcrypt hashes and are not returned by user APIs.
- JWTs are required for protected REST and Socket.IO connections.
- Backend role middleware remains the source of authorization decisions.
