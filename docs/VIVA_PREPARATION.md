# SmartOps Viva Preparation Guide

Use this guide as speaking notes. The answers describe the current repository,
not features that are only planned.

## A. Project introduction

### 30-second introduction

“My project is SmartOps, an AI-assisted service request management system
built with MongoDB, Express, React, and Node.js. Employees create service
requests, administrators assign and monitor them, and staff members work on
the assigned requests and tasks. The system adds role-based security,
explainable rule-based AI suggestions, persistent notifications, Socket.IO
updates, email confirmation, attachments, reports, feedback, and audit logs.”

### One-minute explanation

“SmartOps manages the complete internal support-request lifecycle. An employee
registers and creates a request with details, priority, department, category,
and an optional file. The request is saved in MongoDB and administrators are
notified. An administrator assigns it to a staff member. Staff start and
resolve the work, and the employee closes the resolved request and can submit
feedback. React provides role-specific screens, Express provides protected
REST APIs, MongoDB stores the source of truth, and Socket.IO refreshes the UI
immediately. The AI is rule-based and assists with category, department,
priority, and duplicate suggestions; an administrator makes the final review
decision.”

### Three-minute explanation

“The application starts at the React/Vite frontend. Authentication is handled
through the existing AuthContext. A login request is sent to the Express
backend. The backend verifies the bcrypt password, checks that the account is
active, and returns a one-hour JWT. The frontend stores the token and uses it
for Axios requests and Socket.IO authentication.

There are three roles. Employees create and track their own requests. Admins
manage users, staff, departments, categories, requests, assignments, tasks,
reports, analytics, feedback, audit logs, and AI review. Staff can see assigned
requests, start and resolve them, and work on assigned tasks. Backend role and
ownership checks protect every operation.

When a request is created, the controller validates and saves it first. It
then creates idempotent notification records for active administrators and
emits a notification event to their authenticated user rooms. The creator's
email is loaded from MongoDB and Nodemailer attempts a confirmation email. If
SMTP fails, the request remains saved and the result does not falsely claim
that email was sent. The frontend refreshes from REST after Socket.IO events,
so MongoDB remains authoritative.

The lifecycle is Pending, Assigned, In Progress, Resolved, and Closed. AI
rules inspect request text and calculate suggestions. Duplicate detection uses
word overlap and stores reviewable candidates. Administrators can accept or
modify classification and confirm or reject duplicate suggestions, but the
system does not automatically merge or delete requests. Attachments and
resolution evidence are stored with metadata and served only through
authenticated access-controlled routes. Reports, analytics, feedback, and
audit logs provide management visibility.”

### Presentation script

1. Introduce SmartOps and the organizational support problem.
2. Explain the three roles and why each needs a different interface.
3. Show login and the role-based dashboard.
4. Demonstrate employee request creation and AI suggestions.
5. Show the saved request and administrator notification.
6. Assign the request to staff and explain the status transition.
7. Show staff progress, comments, resolution, and evidence.
8. Close the request as the employee and submit feedback.
9. Show reports, analytics, AI Review, notifications, and audit logs.
10. Explain MongoDB persistence, Socket.IO delivery, email handling, and
    security limitations.
11. Finish with future work such as durable object storage and automated tests.

## B. Problem and solution

### Problem

Manual service requests can be lost in email or chat, have unclear ownership,
and provide little visibility into status, workload, or resolution history.

### Solution

SmartOps stores each request and its history in MongoDB, applies role-aware
permissions, assigns work explicitly, provides real-time notification updates,
and gives administrators operational reports and audit evidence.

## C. Architecture explanation

| Component | Simple explanation |
| --- | --- |
| React | Builds reusable role-specific pages and forms. |
| Vite | Runs and bundles the frontend. |
| Node.js | Executes the backend JavaScript. |
| Express | Defines REST routes and middleware. |
| MongoDB | Stores users, requests, tasks, notifications, feedback, reference data, and logs. |
| Mongoose | Defines schemas and queries MongoDB. |
| JWT | Proves the identity of a logged-in user on protected requests. |
| bcryptjs | Hashes and verifies passwords. |
| Socket.IO | Delivers authenticated real-time events to user and role rooms. |
| Nodemailer | Sends request-confirmation email through SMTP. |
| Multer | Receives and restricts multipart file uploads. |
| AI rules | Provide transparent keyword and word-overlap suggestions. |

The frontend communicates with Express over Axios. Express controllers use
Mongoose models and services. Socket.IO is attached to the same HTTP server.
MongoDB is the persistent source of truth; a socket event only tells the
frontend to refresh or update its display.

## D. Module-by-module notes

| Module | Purpose | Files to mention | Demonstration sentence |
| --- | --- | --- | --- |
| Authentication | Register employees and log in users. | `authController.js`, `authRoutes.js`, `Login.jsx`, `Register.jsx` | “The backend creates only public employee accounts and returns a JWT after password verification.” |
| Authorization | Protect routes by role and ownership. | `authMiddleware.js`, `roleMiddleware.js`, `ProtectedRoute.jsx` | “The frontend improves navigation, but the backend performs the real authorization.” |
| User management | Manage employee and staff accounts. | `userController.js`, `AdminUsers.jsx`, `AdminStaff.jsx` | “An administrator can manage active accounts while protected rules preserve system safety.” |
| Departments/categories | Maintain request reference data. | `Department.js`, `Category.js`, management pages | “Active reference records are used in registration and request forms.” |
| Request creation | Capture service request details and files. | `requestController.js`, `CreateRequest.jsx` | “The request is persisted first, then notifications and email are attempted.” |
| Request lifecycle | Track work from pending to closed. | `Request.js`, `requestController.js`, `RequestDetails.jsx` | “Each transition is validated and recorded in status history.” |
| Staff work | Work on assigned requests. | `StaffRequests.jsx`, `StaffTasks.jsx`, `taskController.js` | “Staff can start and resolve only work assigned to them.” |
| Tasks | Track smaller staff work items. | `Task.js`, `AdminTasks.jsx`, `StaffTasks.jsx` | “A task has its own Pending, In Progress, and Completed lifecycle.” |
| Comments | Keep request discussion with the request. | `RequestComment.js`, request controller, details page | “Authorized users can comment without exposing the request to unrelated users.” |
| Attachments | Preserve request files and evidence. | `uploadMiddleware.js`, file controller functions, `RequestDetails.jsx` | “Files are served through an authenticated route rather than an unrestricted public folder.” |
| AI analysis | Suggest classification and priority. | `aiRules.js`, `aiService.js`, `CreateRequest.jsx` | “The AI is deterministic assistance and does not make irreversible decisions.” |
| AI review | Let admins review suggestions. | `aiReviewController.js`, `AdminAIReview.jsx` | “An administrator accepts or modifies the suggestion and can review duplicates.” |
| Notifications | Persist and deliver user alerts. | `Notification.js`, `notificationService.js`, `Notifications.jsx` | “MongoDB stores the notification and Socket.IO delivers an immediate event.” |
| Email | Confirm a newly saved request. | `emailService.js`, request controller | “SMTP acceptance is checked; failure never causes a false success message.” |
| Reports/analytics | Summarize operational activity. | report/analytics controllers and admin pages | “Administrators can examine workload, categories, statuses, and performance.” |
| Feedback | Capture employee satisfaction. | `Feedback.js`, `feedbackController.js`, request details | “The user can submit one rating and optional comment after resolution.” |
| Audit logs | Record administrative activity. | `AuditLog.js`, `auditLogger.js`, `AdminAuditLogs.jsx` | “Audit records provide traceability for administrator operations.” |

## E. Request and task workflow

### Difference between request and task

A request is the employee's service problem and follows the five-state
employee-facing lifecycle. A task is an administrator-created work item
assigned to staff and follows its own three-state lifecycle. A task can link to
a request, but completing a task and resolving a request are separate backend
operations.

### Demonstration workflow

1. Employee selects category, department, priority, location, title, and
   description.
2. Employee optionally requests AI suggestions and attaches a permitted file.
3. Backend saves the request and records `Pending` history.
4. Active administrators receive persistent and real-time notifications.
5. Administrator assigns staff, changing the request to `Assigned`.
6. Assigned staff starts it as `In Progress`.
7. Staff adds resolution text/evidence and changes it to `Resolved`.
8. Employee reviews details and closes the request.
9. Employee optionally submits feedback.

## F. AI explanation

The AI is not described as machine learning. It uses keyword matching and
word-overlap rules. The input is request text; the outputs are candidate
category, department, priority, and duplicate matches with scores. This is
useful because it makes the recommendation understandable and reviewable, but
it can miss context, synonyms, or domain-specific language. Administrators
remain responsible for final decisions.

## G. Viva questions and answers

### Project overview

1. **What is SmartOps?** — A role-based internal service request management
   system with AI-assisted classification.
2. **What problem does it solve?** — It replaces scattered request handling
   with a traceable workflow and clear ownership.
3. **Who are the users?** — Employees, support staff, and administrators.
4. **What is the main lifecycle?** — Pending, Assigned, In Progress, Resolved,
   and Closed.
5. **What is the most important design principle?** — Persist authoritative
   data in MongoDB and use real-time events only for timely UI updates.

### MERN and frontend

6. **Why React?** — It supports reusable components and role-specific views.
7. **Why Vite?** — It provides fast development and production bundling.
8. **What is React Router used for?** — Public, protected, and role-based URL
   navigation.
9. **What is AuthContext?** — Shared frontend authentication state, token
   persistence, login, logout, and expiry handling.
10. **Why Axios?** — It centralizes API calls and authorization headers.
11. **How are forms validated?** — The frontend performs immediate checks and
   the backend validates again.
12. **How does the UI handle a socket event?** — It refreshes authoritative
   REST data through the existing refresh hook.

### Node, Express, and API

13. **Why Express?** — It provides simple middleware and route composition.
14. **What is a controller?** — A request handler that validates input,
   applies business rules, and returns a response.
15. **What is middleware?** — Reusable processing before a controller, such as
   JWT or role checking.
16. **What is the API base URL in development?** — `http://localhost:5000/api`.
17. **Why use status codes?** — They communicate success, validation, auth,
   missing-resource, conflict, and server-error results consistently.
18. **How are unexpected errors handled?** — The backend logs details and
   returns a safe generic message.
19. **Why must static paths be declared before `/:id`?** — So paths such as
   `/assigned` are not interpreted as an identifier.

### MongoDB and Mongoose

20. **Why MongoDB?** — It naturally stores document-shaped requests,
   embedded status history, and flexible AI data.
21. **What does Mongoose provide?** — Schemas, validation, references, and
   query helpers.
22. **What is stored in a request?** — Details, ownership, assignment,
   status/history, comments, AI fields, file metadata, and resolution data.
23. **How is feedback related to a request?** — `Feedback.requestId` refers to
   a request and is unique.
24. **How are users related to requests?** — `createdBy` and `assignedTo` are
   User references.
25. **Why is `notificationKey` useful?** — It prevents duplicate automatic
   notifications when a lifecycle operation is retried.

### Authentication and security

26. **How does login work?** — The server finds the active user, verifies the
   bcrypt password, and signs a JWT.
27. **Why hash passwords?** — A hash avoids storing the original password.
28. **What is a JWT?** — A signed token containing identity claims for later
   authenticated requests.
29. **How is authorization enforced?** — JWT middleware loads the user and role
   middleware checks allowed roles; controllers also check ownership.
30. **Can public registration create an admin?** — No. Public registration
   always creates a normal `user`.
31. **How are files protected?** — File routes require authentication and
   confirm request ownership, assignment, or admin role.
32. **What does Helmet do?** — It adds common HTTP security headers.
33. **Why rate-limit authentication?** — To reduce repeated login/registration
   abuse.
34. **What secrets must not be committed?** — JWT secret, database URI
   credentials, SMTP password, and API keys.

### Requests, tasks, and notifications

35. **Who assigns requests?** — Administrators.
36. **Who starts and resolves requests?** — The assigned staff member.
37. **Who closes a resolved request?** — The request owner.
38. **Who creates staff tasks?** — Administrators.
39. **Who completes staff tasks?** — The assigned staff member.
40. **Why save a request before email?** — A confirmation email must never be
   allowed to decide whether the request exists.
41. **What happens when SMTP fails?** — The request remains saved and the UI
   reports that confirmation email could not be sent.
42. **Why use MongoDB for notifications?** — Offline users can see the record
   after reconnecting or refreshing.
43. **How does Socket.IO protect private notifications?** — The connection
   authenticates with JWT and each notification is emitted to the recipient's
   user room.
44. **What is the purpose of a notification link?** — It opens the related
   request or task from the notification list.

### AI, testing, and future work

45. **Is the AI machine learning?** — No, it is deterministic rule-based
   keyword and word-overlap assistance.
46. **Can AI automatically merge duplicates?** — No. Admins only confirm or
   reject suggestions; requests are not merged automatically.
47. **What tests are available?** — Repository checks include Node syntax and
   the frontend production build; no automated test suite is currently stored.
48. **How would you test authorization?** — Attempt each protected endpoint
   with missing, invalid, wrong-role, inactive, and unrelated-user accounts.
49. **What is the file-storage production limitation?** — Local filesystem
   storage needs durable storage or object storage in scalable deployments.
50. **What would you improve next?** — Automated tests, structured monitoring,
   durable object storage, and evaluated AI assistance.

## H. Live demonstration plan

1. Start MongoDB and the backend; confirm `GET /` health response.
2. Start the frontend and open `/login`.
3. Log in as an administrator and show the dashboard.
4. Log in as an employee in another session and create a request.
5. Show optional AI suggestions and an attachment if available.
6. Return to the administrator session and show the persistent notification.
7. Open the request, inspect the history, and assign staff.
8. Log in as staff and start the request.
9. Add a comment and resolve the request with evidence if configured.
10. Log in as the employee, review the resolved request, close it, and submit
    feedback.
11. Show the notification list, reports, analytics, feedback, and audit logs.
12. Open AI Review only when the request has stored AI review data.

Do not claim email delivery without checking a successful Nodemailer/SMTP
acceptance result. Do not demonstrate a feature that is not configured or
implemented in the current environment.

## I. Pre-viva troubleshooting checklist

- Confirm MongoDB is running and `MONGO_URI` is correct.
- Confirm `JWT_SECRET` is present and at least 32 characters.
- Confirm `FRONTEND_ORIGIN` matches the Vite origin.
- Confirm backend port 5000 is not already occupied.
- Confirm frontend API and Socket.IO URLs are correct.
- Create or verify an administrator, staff account, and employee account.
- Create active departments and categories before demonstrating forms.
- If email is demonstrated, configure SMTP without exposing credentials and
  verify the accepted send result.
- Check browser console and backend logs for failures.
- Verify notifications in MongoDB as well as the live UI.
- Verify an uploaded file is available through its protected route.
- Run `node --check Backend/src/server.js`.
- Run `cd Frontend; npm run build`.
- Never include passwords, JWT secrets, SMTP app passwords, or private URIs in
  screenshots, slides, documentation, or source control.
