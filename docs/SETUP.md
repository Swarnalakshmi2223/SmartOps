# SmartOps Setup

## Prerequisites

- Node.js 18 or newer.
- npm.
- MongoDB local instance or MongoDB Atlas connection string.
- Gmail SMTP credentials or another Nodemailer-supported mail service if email
  delivery is required.

## Backend setup

```powershell
cd D:\IRP_MERN_ICTAK\My_Project\SmartOps\Backend
npm install
npm run dev
```

The backend listens on `http://localhost:5000` by default. The root health
check is `GET http://localhost:5000/`.

For a normal start use:

```powershell
npm start
```

If port 5000 is already in use, stop the previous Node process before
starting another backend instance.

## Backend environment

Copy `Backend/.env.example` to `Backend/.env`, then replace the placeholder
values. Keep the real `.env` out of source control:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smartops
JWT_SECRET=replace-with-a-secret-at-least-32-characters-long
FRONTEND_ORIGIN=http://localhost:5173
MAIL_SERVICE=gmail
MAIL_USER=your-sender@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_FROM=your-sender@gmail.com
```

`MONGO_URI` may be replaced with the project's MongoDB Atlas URI. `MAIL_*`
settings are required only when email delivery is used. Gmail accounts
normally require an App Password rather than the normal account password.

Never commit real credentials, JWT secrets, MongoDB passwords, or mail
passwords.

## Database setup

Start MongoDB locally or create an Atlas database, then set `MONGO_URI`.
Mongoose creates collections as data is written. The application uses the
following collections/models:

`users`, `requests`, `tasks`, `notifications`, `feedback`, `departments`,
`categories`, and `auditlogs`.

The application does not require a migration command. Create an administrator
through the existing account setup or admin-management process, then use the
admin UI to create active departments, categories, and staff accounts.

## Email smoke test

From `Backend`:

```powershell
node testEmail.js
```

Update the receiving address in the local test script before running it. A
request-created email is sent to the authenticated request creator after the
request is saved successfully.

## Frontend setup

Copy `Frontend/.env.example` to `Frontend/.env` for local development. For a
deployed frontend, set the production URLs before building:

```env
VITE_API_URL=https://api.example.com/api
VITE_SOCKET_URL=https://api.example.com
```

```powershell
cd D:\IRP_MERN_ICTAK\My_Project\SmartOps\Frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`. The Axios client uses
`VITE_API_URL` from `Frontend/src/services/api.js`, with
`http://localhost:5000/api` as the development fallback. Socket.IO uses
`VITE_SOCKET_URL`, with `http://localhost:5000` as the development fallback.

To create a production build:

```powershell
npm run build
```

## First-use flow

1. Start MongoDB and the backend.
2. Start the frontend.
3. Register a public user at `/register`.
4. Log in at `/login`.
5. An administrator creates staff accounts and manages departments/categories.
6. A user creates a request.
7. An administrator assigns the request to staff.
8. Staff starts and resolves it; the user closes it and can submit feedback.
