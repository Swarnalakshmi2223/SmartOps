# SmartOps API Endpoints

Base URL:

```text
http://localhost:5000/api
```

Protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

Roles are `user`, `staff`, and `admin`. A public endpoint does not require a
token. All other endpoints use the role restrictions shown below.

## Authentication

| Method | Endpoint | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create a normal user account only. |
| POST | `/auth/login` | Public | Authenticate and return a one-hour JWT. |

Public registration ignores any submitted role and always creates an active
`user` account.

## Users and staff

| Method | Endpoint | Role | Purpose |
| --- | --- | --- | --- |
| GET | `/users` | Admin | List users. |
| GET | `/users/:id` | Admin | Get one user. |
| PUT | `/users/:id` | Admin | Update a user. |
| PUT | `/users/:id/role` | Admin | Change a user's role. |
| PATCH | `/users/:id/status` | Admin | Activate/deactivate a user. |
| DELETE | `/users/:id` | Admin | Delete a user. |
| GET | `/users/staff` | Admin | List staff accounts. |
| POST | `/users/staff` | Admin | Create an active staff account. |
| GET | `/users/staff/:id` | Admin | Get one staff account. |
| PUT | `/users/staff/:id` | Admin | Update staff details. |
| PATCH | `/users/staff/:id/status` | Admin | Activate/deactivate staff. |
| PUT | `/users/profile` | Authenticated user | Update the current user's profile. |
| PATCH | `/users/password` | Authenticated user | Change the current user's password. |

Staff creation is administrator-only. Passwords and password hashes are not
returned in user responses.

## Requests

| Method | Endpoint | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/requests` | User | Create a request, optionally with an attachment. |
| GET | `/requests/my` | User | List the current user's requests. |
| GET | `/requests/:id` | User, Staff, Admin | View a request when authorized. |
| PUT | `/requests/:id` | User | Update the user's own request. |
| POST | `/requests/:id/comments` | Authenticated | Add an authorized comment. |
| GET | `/requests/:id/comments` | Authenticated | View authorized comments. |
| GET | `/requests/:id/attachment` | User, Staff, Admin | Download an authorized request attachment. |
| GET | `/requests/:id/evidence` | User, Staff, Admin | Download authorized resolution evidence. |
| GET | `/requests/assigned` | Staff | List requests assigned to the current staff member. |
| GET | `/requests` | Admin | List all requests. |
| GET | `/requests/search` | Admin | Search/filter requests. |
| PATCH | `/requests/:id/assign` | Admin | Assign or reassign staff. |
| PATCH | `/requests/:id/status` | User, Staff, Admin | Change status when the role and transition are allowed. |
| PATCH | `/requests/:id/start` | Staff | Start an assigned request. |
| PATCH | `/requests/:id/resolve` | Staff | Resolve an assigned request with resolution/evidence. |
| PATCH | `/requests/:id/close` | User | Close the user's resolved request. |

Request creation accepts JSON or multipart form data. Supported attachment
types are JPG, JPEG, PNG, WEBP, PDF, DOC, and DOCX, up to 5 MB.

Valid lifecycle transitions are:

```text
Pending → Assigned → In Progress → Resolved → Closed
```

After a request is saved, the backend attempts to email the creator using the
creator's MongoDB email address.

### Request search query parameters

`GET /requests/search` accepts the filters implemented by the search
controller, including `search`, `status`, `priority`, `category`, `assignedTo`,
and `createdBy` when supplied.

Example:

```text
/api/requests/search?status=Pending&priority=High
```

## Tasks

| Method | Endpoint | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/tasks` | Admin | Create a staff task. |
| GET | `/tasks` | Admin | List all tasks. |
| GET | `/tasks/my` | Staff | List the current staff member's tasks. |
| GET | `/tasks/:id` | Staff, Admin | View a task. |
| PATCH | `/tasks/:id/start` | Staff | Start an assigned task. |
| PATCH | `/tasks/:id/complete` | Staff | Complete an assigned task. |

## Notifications

| Method | Endpoint | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/notifications` | Admin | Create an in-app notification. |
| GET | `/notifications` | Authenticated | List the current user's notifications. |
| GET | `/notifications/unread` | Authenticated | List unread notifications. |
| PATCH | `/notifications/read-all` | Authenticated | Mark all current notifications read. |
| PATCH | `/notifications/:id/read` | Authenticated | Mark one notification read. |
| DELETE | `/notifications/:id` | Authenticated | Delete one owned notification. |

## Feedback

| Method | Endpoint | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/feedback` | User | Submit feedback for a request. |
| GET | `/feedback/my` | User | List the current user's feedback. |
| GET | `/feedback/request/:requestId` | Admin | Get feedback for a request. |
| GET | `/feedback` | Admin | List all feedback. |
| PUT | `/feedback/:id` | User | Update owned feedback. |
| DELETE | `/feedback/:id` | User | Delete owned feedback. |

## Reports and analytics

| Method | Endpoint | Role | Purpose |
| --- | --- | --- | --- |
| GET | `/reports/requests` | Admin | Request report. |
| GET | `/reports/categories` | Admin | Category report. |
| GET | `/reports/staff-workload` | Admin | Existing staff workload report. |
| GET | `/reports/requests/date` | Admin | Date-filtered request report. |
| GET | `/analytics/dashboard` | Admin | Existing dashboard analytics. |
| GET | `/analytics/categories` | Admin | Existing category analytics. |
| GET | `/analytics/staff-performance` | Admin | Existing staff performance analytics. |

Example date report:

```text
/api/reports/requests/date?from=2026-10-01&to=2026-10-05
```

## Departments and categories

| Method | Endpoint | Role | Purpose |
| --- | --- | --- | --- |
| GET | `/departments/active` | Public | Load active departments for registration. |
| POST | `/departments` | Admin | Create a department. |
| GET | `/departments` | Admin | List departments. |
| GET | `/departments/:id` | Admin | Get one department. |
| PUT | `/departments/:id` | Admin | Update a department. |
| PATCH | `/departments/:id/status` | Admin | Activate/deactivate a department. |
| GET | `/categories/active` | User, Staff, Admin | Load active categories. |
| POST | `/categories` | Admin | Create a category. |
| GET | `/categories` | Admin | List categories. |
| GET | `/categories/:id` | Admin | Get one category. |
| PUT | `/categories/:id` | Admin | Update a category. |
| PATCH | `/categories/:id/status` | Admin | Activate/deactivate a category. |

## AI assistance

| Method | Endpoint | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/ai/analyze` | User | Return rule-based category, department, and priority suggestions. |
| POST | `/ai/duplicates` | User | Detect possible duplicates using word overlap. |
| POST | `/ai/analyze/:requestId` | User | Analyze and store AI results for a request. |
| PATCH | `/ai/review/:requestId` | Admin | Accept or modify stored AI classification. |
| GET | `/ai-review/:requestId` | Admin | View classification and duplicate review data. |
| PATCH | `/ai-review/:requestId` | Admin | Accept or modify classification. |
| PATCH | `/ai-review/:requestId/duplicate/:duplicateRequestId` | Admin | Confirm or reject one duplicate suggestion. |

The AI is rule-based and assistive. It does not automatically assign,
close, delete, merge, or override requests.

## Audit logs

| Method | Endpoint | Role | Purpose |
| --- | --- | --- | --- |
| GET | `/audit-logs` | Admin | List audit records. |

## Realtime Socket.IO events

Connect to `http://localhost:5000` with the JWT in the Socket.IO `auth`
payload or authorization header. The backend authenticates the connection and
joins user and role rooms.

Events emitted by the backend include:

- `request.created`
- `request.assigned`
- `request.started`
- `request.statusChanged`
- `request.resolved`
- `request.closed`
- `request.commentAdded`
- `task.assigned`
- `task.updated`
- `notification.created`

These events refresh UI data; MongoDB remains the source of truth.

## Error responses

Common responses include:

- `400` invalid input, transition, file, or identifier.
- `401` missing, invalid, or expired JWT.
- `403` authenticated user lacks the required role or ownership.
- `404` resource does not exist.
- `409` duplicate registration data.
- `429` too many login/registration attempts.
- `500` unexpected server error.

## Removed/not mounted APIs

There is no active `/api/test` API and no Operational Intelligence API. Those
features are intentionally not documented as available SmartOps endpoints.
