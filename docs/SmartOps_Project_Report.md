# SmartOps — AI-Assisted Service Request Management System

## Cover Page

**Project type:** MERN Stack Full Stack Project  
**Student:** Swarnalakshmi Perumal  
**Institution / College:** `[To be supplied]`  
**Course / Department:** `[To be supplied]`  
**Academic year:** `[To be supplied]`  
**Guide / Project supervisor:** `[To be supplied]`  
**Team members:** `[To be supplied; individual project if applicable]`

---

## Table of Contents

The editable DOCX contains a Word table-of-contents field based on the heading
styles in this source. Open the DOCX in Microsoft Word and choose **Update
Field → Update entire table** to calculate final page numbers after editing.

1. [Abstract](#abstract)
2. [1. Introduction](#1-introduction)
3. [2. Problem Statement](#2-problem-statement)
4. [3. User Stories](#3-user-stories)
5. [4. Flow Chart](#4-flow-chart)
6. [5. Technology Stack](#5-technology-stack)
7. [6. Project Structure](#6-project-structure)
8. [7. Development Environment](#7-development-environment)
9. [8. Conclusion](#8-conclusion)
10. [9. Appendix](#9-appendix)

## Abstract

SmartOps is a MERN-stack web application for managing internal service requests
from submission through resolution. It replaces fragmented communication with
a role-based workflow for employees, support staff, and administrators. An
employee can register, authenticate, create a request, attach a permitted file,
track status, view comments and evidence, and close a resolved request. An
administrator can manage users, staff, departments, categories, assignments,
reports, feedback, audit logs, and AI review decisions. Staff members work on
assigned requests and tasks, record progress, and submit resolution evidence.

The frontend is implemented with React and Vite. The backend uses Node.js,
Express, Mongoose, and MongoDB. JWT authentication, password hashing, active
account checks, role middleware, protected file routes, Helmet, CORS, and rate
limiting support the security model. Socket.IO provides authenticated real-time
notification updates, while Nodemailer can send confirmation email when SMTP is
configured. The AI assistance is intentionally explainable and deterministic:
keyword and word-overlap rules suggest category, department, priority, and
possible duplicates; an administrator reviews the suggestions. The system is
designed to improve traceability, ownership, communication, and operational
visibility without claiming measured performance improvements that were not
formally evaluated.

## 1. Introduction

### 1.1 SmartOps overview

SmartOps — AI-Assisted Service Request Management System is an internal service
request platform. It provides a single location for employees to report needs,
for support staff to complete assigned work, and for administrators to manage
the overall process. The application records request information, ownership,
status history, comments, attachments, notifications, and feedback in a
structured system.

### 1.2 Need for service request management

Requests handled through informal messages or separate email threads are easy to
lose and difficult to measure. A requester may not know whether a request has
been received, assigned, or resolved. Administrators may lack a complete view of
workload and staff availability, while staff may not have a consistent place to
record progress and evidence. SmartOps addresses these issues with controlled
access, a defined lifecycle, persistent records, and role-specific dashboards.

### 1.3 Objectives

- Provide secure registration and JWT-based login for supported users.
- Enforce role-specific access for employees, staff, and administrators.
- Support the lifecycle `Pending → Assigned → In Progress → Resolved → Closed`.
- Enable assignment, reassignment, tasks, comments, attachments, evidence, and
  feedback.
- Provide explainable AI suggestions without making unreviewed automatic
  decisions.
- Deliver persistent in-app notifications and authenticated real-time updates.
- Provide administrative reports, analytics, feedback, and audit-log views.

### 1.4 Scope

The verified scope includes public employee registration, login, profile and
password settings, request creation and tracking, administrator management,
staff work and task management, protected files, notifications, confirmation
email, AI suggestions and review, reporting, analytics, feedback, and audit
logs. Machine-learning model training, automatic workload redistribution,
automatic request merging, and the planned Operational Intelligence dashboard
are outside the verified final implementation.

### 1.5 Importance of full-stack development

SmartOps requires coordinated frontend, backend, and database behavior. The
React client presents role-specific workflows, the Express API validates input
and authorization, and MongoDB stores durable operational records. Full-stack
development makes it possible to preserve the same status and permission rules
across the user interface and the backend security boundary.

## 2. Problem Statement

In a manual service process, employees may submit requests through unrelated
channels, staff may receive incomplete information, and administrators may not
be able to determine ownership or progress. Status changes, comments, evidence,
and requester feedback can be lost. Preparing reports then requires collecting
data from multiple sources. These weaknesses reduce visibility and make it hard
to demonstrate what happened to a request.

SmartOps addresses the problem by capturing requests in MongoDB, applying
authentication and authorization, assigning work through an administrator,
recording status history, and making relevant information available through
role-specific pages. Notifications, comments, email confirmation, and protected
attachments support communication. Rule-based AI suggestions reduce repetitive
classification work while keeping the final review with an administrator.

The implemented system should be distinguished from future enhancements. The
current AI is deterministic assistance, not a trained machine-learning model.
Duplicate suggestions do not automatically merge or delete requests, and staff
assignment is performed by administrators rather than automatically by an AI
workload engine.

## 3. User Stories

### 3.1 Employee / user stories

#### US-01 — Secure access

- **As a** registered employee,
- **I want to** log in and maintain my profile or password,
- **So that** I can use the service securely.

**Description:** The employee uses login, logout, settings, and password
change functions. Public registration creates an employee/user account; it does
not allow the client to self-select staff or administrator privileges.

**Acceptance criteria:** Valid credentials issue a JWT; invalid, expired, or
inactive accounts are rejected; protected pages require authentication; password
changes use the authenticated account.

**Relevant module:** `Backend/src/controllers/authController.js`,
`Backend/src/middleware/authMiddleware.js`, `Frontend/src/pages/auth/`, and
`Frontend/src/context/AuthContext.jsx`.

#### US-02 — Create and track a request

- **As an** employee,
- **I want to** create a request with description, classification, location,
  and an optional attachment,
- **So that** support staff can understand and work on my need.

**Acceptance criteria:** Required fields are validated; permitted attachment
types and sizes are enforced; the request is saved; the employee can view its
status, history, comments, files, and notifications.

**Relevant module:** request controllers/routes, upload middleware, request
models, `CreateRequest.jsx`, `MyRequests.jsx`, and `RequestDetails.jsx`.

#### US-03 — Close and provide feedback

- **As a** request owner,
- **I want to** close a resolved request and submit feedback,
- **So that** the service outcome is recorded.

**Acceptance criteria:** Only the owner can close an eligible resolved request;
invalid transitions are rejected; feedback is associated with the request.

### 3.2 Staff stories

#### US-04 — Work on assigned requests

- **As a** staff member,
- **I want to** see requests assigned to me, start work, comment, and resolve
  them with an optional evidence file,
- **So that** the requester receives a traceable outcome.

**Acceptance criteria:** Staff can access assigned work and permitted files;
starting changes the request to `In Progress`; resolution requires the expected
request state and records a message, history, notification, and optional
evidence; staff cannot assign requests or close them.

#### US-05 — Complete assigned tasks

- **As a** staff member,
- **I want to** start and complete assigned tasks,
- **So that** task work is visible to the administrator.

**Relevant module:** task controller/routes and `StaffTasks.jsx`.

### 3.3 Administrator stories

#### US-06 — Assign and monitor work

- **As an** administrator,
- **I want to** view all requests and assign or reassign staff,
- **So that** work has clear ownership.

**Acceptance criteria:** Administrator-only routes allow assignment, preserve
status history, notify the relevant staff member, and retain request access
controls.

#### US-07 — Review AI assistance

- **As an** administrator,
- **I want to** review category, department, priority, and duplicate suggestions,
- **So that** assistive recommendations are checked before operational action.

**Acceptance criteria:** Invalid input is rejected; suggestions are explainable;
review decisions are stored; the review does not automatically merge or delete
requests.

#### US-08 — Manage operations and reports

- **As an** administrator,
- **I want to** manage users, staff, departments, categories, tasks, reports,
  analytics, feedback, audit logs, and notifications,
- **So that** the service process can be administered and reviewed.

## 4. Flow Chart

The editable Mermaid sources are stored in `docs/diagrams/`. They represent the
verified implementation rather than planned functionality.

### 4.1 Overall SmartOps workflow

See [overall-workflow.mmd](./diagrams/overall-workflow.mmd). The browser uses
React/Vite, REST requests reach Express controllers through security middleware,
and controllers persist data in MongoDB. Socket.IO, SMTP, and protected file
storage are supporting services.

### 4.2 Authentication and role-based access

See [authentication-rbac.mmd](./diagrams/authentication-rbac.mmd). JWT
authentication is combined with active-account checks, role middleware, and
resource ownership checks. Frontend route guards improve navigation, but the
backend remains the security source of truth.

### 4.3 Request lifecycle

See [request-lifecycle.mmd](./diagrams/request-lifecycle.mmd). The valid
transitions are `Pending → Assigned → In Progress → Resolved → Closed`.
Invalid transitions are rejected by the backend.

### 4.4 Assignment and resolution

See [assignment-resolution.mmd](./diagrams/assignment-resolution.mmd). An
administrator assigns the request, the staff member works on it, and the owner
closes a resolved request.

### 4.5 AI-assisted review

See [ai-review.mmd](./diagrams/ai-review.mmd). The current implementation uses
deterministic rules based on request text and metadata. It suggests values and
possible duplicates; an administrator confirms or rejects the review.

## 5. Technology Stack

| Area | Verified technology | Purpose |
| --- | --- | --- |
| Frontend | React 19, Vite | Component-based interface and development/build tooling. |
| Routing | React Router | Public, protected, and role-specific routes. |
| API client | Axios | REST requests and authorization headers. |
| UI icons | React Icons | Consistent interface icons. |
| Backend | Node.js, Express 5 | Runtime and REST API server. |
| Database | MongoDB, Mongoose | Persistent document data, schemas, validation, and queries. |
| Authentication | JWT, bcryptjs | Stateless sessions and password hashing. |
| Authorization | Express middleware and ownership checks | Role and resource access control. |
| Security | Helmet, CORS, express-rate-limit | Headers, origin control, and login/registration throttling. |
| AI assistance | Local deterministic rules | Explainable suggestions for category, department, priority, and duplicates. |
| Real time | Socket.IO and socket.io-client | Authenticated, scoped notification updates. |
| Uploads | Multer and protected filesystem routes | Multipart validation and controlled attachment/evidence access. |
| Email | Nodemailer with SMTP/TLS configuration | Request confirmation email when configured. |
| Testing | Vitest, Supertest, Testing Library, jsdom, mongodb-memory-server | Backend API/security tests and frontend component tests. |
| Development | npm, Nodemon, ESLint | Dependency management, development restart, and linting. |

## 6. Project Structure

### 6.1 Repository tree

```text
SmartOps/
├── Backend/
│   ├── src/
│   │   ├── ai/                 deterministic AI rules and service
│   │   ├── config/             database configuration
│   │   ├── controllers/        request handlers and validation
│   │   ├── middleware/         JWT, roles, and uploads
│   │   ├── models/             Mongoose schemas
│   │   ├── routes/              Express route declarations
│   │   ├── services/           email and notification services
│   │   ├── socket/             authenticated Socket.IO server
│   │   ├── utils/              audit logging and validation helpers
│   │   └── server.js           HTTP server and route mounting
│   ├── test/                   Vitest and Supertest tests
│   ├── uploads/                backend file storage at runtime
│   ├── package.json
│   └── vitest.config.js
├── Frontend/
│   ├── src/
│   │   ├── components/         shared navigation and UI components
│   │   ├── context/            authentication context
│   │   ├── hooks/              realtime refresh helpers
│   │   ├── layouts/            dashboard shell
│   │   ├── pages/              auth, user, staff, admin, shared pages
│   │   ├── routes/              frontend route guards
│   │   ├── services/           Axios and Socket.IO clients
│   │   ├── test/               Vitest and Testing Library tests
│   │   └── App.jsx             route tree
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── diagrams/
│   ├── Screenshots/
│   ├── API_ENDPOINTS.md
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   └── SmartOps_Project_Report.md
└── README.md
```

### 6.2 Backend modules and database models

The active models are `User`, `Request`, `Task`, `Notification`, `Feedback`,
`Department`, `Category`, `RequestComment`, and `AuditLog`. Controllers
coordinate input validation, authorization, model operations, notifications,
email, and audit records. Route modules declare endpoint paths and role access.

### 6.3 Frontend modules

`AuthContext.jsx` maintains login state and token behavior. `api.js` provides
the Axios client. `ProtectedRoute.jsx` and `DashboardLayout.jsx` enforce the
role-aware application shell. User pages cover request creation and tracking;
staff pages cover assigned requests and tasks; admin pages cover management,
operations, reports, analytics, AI review, feedback, and audit logs.

### 6.4 Request flow

1. A user interacts with a React page.
2. Axios sends a REST request with the JWT when authentication is required.
3. Express route middleware checks token validity, account activity, role, and
   ownership where applicable.
4. A controller validates data and calls Mongoose models and supporting
   services.
5. MongoDB becomes the source of truth for the result.
6. Notifications and Socket.IO events inform authorized users; the frontend can
   reload authoritative data through REST.

## 7. Development Environment

### 7.1 Requirements

- Windows development environment.
- Node.js 18 or later and npm.
- MongoDB local service or MongoDB Atlas database.
- A modern browser.
- SMTP credentials only if confirmation email is required.

### 7.2 Environment variables

Create a backend `.env` file using variable names from the verified setup
documentation. Do not commit real values.

```text
PORT=
MONGO_URI=
JWT_SECRET=
FRONTEND_ORIGIN=
MAIL_SERVICE=
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=
MAIL_SECURE=true
```

The frontend can use:

```text
VITE_API_URL=
VITE_SOCKET_URL=
```

`MAIL_SECURE=true` enables the explicit TLS transport configuration currently
used by the email service. Actual SMTP support depends on the selected provider
and valid environment configuration.

### 7.3 Installation and startup

From PowerShell at the repository root:

```powershell
cd Backend
npm install
npm run dev
```

In another terminal:

```powershell
cd Frontend
npm install
npm run dev
```

The backend also supports `npm start`. The frontend production build is created
with `npm run build` and can be previewed with `npm run preview`.

### 7.4 Testing locally

Backend:

```powershell
cd Backend
npm test
```

Frontend:

```powershell
cd Frontend
npm test
npm run lint
npm run build
```

The current repository contains Vitest tests. The measured coverage from the
available suites is recorded in Appendix F and the verification checklist.
Tests should use isolated test configuration and must not target production
data.

## 8. Conclusion

SmartOps demonstrates a complete MERN-stack approach to internal service request
management. It combines a React/Vite interface, an Express/Mongoose API,
MongoDB persistence, JWT authentication, role-based permissions, protected
attachments, notifications, email, audit records, reporting, and explainable
rule-based AI assistance. The defined lifecycle gives employees visibility,
staff members clear work ownership, and administrators operational control.

The project also demonstrates practical full-stack concerns: input validation,
resource authorization, asynchronous services, real-time updates, test
coverage, and frontend/backend separation. It should not be described as fully
production-ready without deployment-specific checks for durable file storage,
SMTP delivery, monitoring, backups, and a complete end-to-end test environment.
Future enhancements may include object storage, automatic workload balancing,
machine-learning assistance, richer analytics, and deployment observability.

## 9. Appendix

### A. Screenshots

The following screenshots were found in `docs/Screenshots/` and are included in
the editable report where supported:

| Screenshot | Evidence |
| --- | --- |
| Login | `login.png` |
| Employee dashboard | `employee-dashboard.png` |
| Staff dashboard | `staff-dashboard.png` |
| Admin dashboard | `admin-dashboard.png` |
| Create request | `create-request.png` |
| Request details | `request-details.png` |
| Notifications | `notifications.png` |
| Staff tasks | `tasks.png` |
| Reports and analytics | `reports-analytics.png` |
| AI review | `ai-review.png` |

Additional screenshots still needed for a complete visual appendix: employee
registration, settings/profile, admin user and staff management, departments,
categories, feedback, audit logs, attachment access, and request resolution
evidence. These are listed in `docs/Screenshots/SCREENSHOT_CHECKLIST.md`.

### B. Login credentials

No safe demo credentials were verified in the repository. Do not publish real
credentials. Configure disposable local demo accounts through the application or
database seed process and replace this table only with approved non-production
accounts.

| Role | Username/email | Password | Status |
| --- | --- | --- | --- |
| Admin | `[local demo account to be supplied]` | `[do not store here]` | Not verified |
| Staff | `[local demo account to be supplied]` | `[do not store here]` | Not verified |
| Employee/user | `[local demo account to be supplied]` | `[do not store here]` | Not verified |

### C. Hosted link

`[Deployment URL — to be added after deployment]`

### D. Repository link

Verified repository: [https://github.com/Swarnalakshmi2223/SmartOps](https://github.com/Swarnalakshmi2223/SmartOps)

### E. Recorded demonstration

`[Project Demonstration Video URL — to be added]`

### F. Additional technical details and testing results

#### Representative API groups

The complete endpoint inventory is maintained in `docs/API_ENDPOINTS.md`. The
active groups include `/api/auth`, `/api/requests`, `/api/tasks`,
`/api/notifications`, `/api/users`, `/api/departments`, `/api/categories`,
`/api/ai`, `/api/ai-review`, `/api/reports`, `/api/analytics`, `/api/feedback`,
`/api/comments`, and `/api/audit-logs`. Attachment and evidence routes are
authenticated and subject to resource access checks.

#### Verification evidence

At the time of report preparation, the available recorded checks were:

| Check | Result |
| --- | --- |
| Backend Vitest suite | 12 tests passed. |
| Backend coverage | 29.48% lines, 29.46% statements, 17.91% branches, 24.69% functions. |
| Frontend Vitest suite | 4 tests passed. |
| Frontend coverage | 40.10% lines, 39.78% statements, 29.85% branches, 37.93% functions. |
| Frontend production build | Passed; Vite reported an unresolved `/smartops-background.png` runtime reference and a chunk-size warning. |
| Backend syntax checks | Passed for changed backend JavaScript files. |
| Git whitespace check | `git diff --check` passed; CRLF warnings were reported by Git. |
| Frontend lint | Not clean: 21 errors and 5 warnings remain in the existing codebase. |
| Full external integrations | Not claimed; SMTP, live Socket.IO, and deployment verification were not run as part of this documentation task. |

#### Documentation verification note

The current checkout contains the source documentation and test files listed in
this report. The earlier `docs/REMEDIATION_TRACKER.md` and
`docs/REMEDIATION_SUMMARY.md` files are not present in the current checkout, so
their historical status records were not treated as source evidence. See
`docs/REPORT_VERIFICATION.md` for the complete verification checklist.
