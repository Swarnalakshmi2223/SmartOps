# SmartOps Workflows

## User workflow

1. Register a public employee account. Public registration always creates
   `role: "user"`; role input from the client is ignored.
2. Log in and access the user dashboard.
3. Update profile details or change the password in Settings.
4. Create a request with title, description, category, priority, department,
   location, and an optional attachment.
5. Optionally ask the rule-based AI for category, department, and priority
   suggestions before submitting.
6. View personal requests and open request details.
7. View status history, comments, attachments, resolution evidence, and
   notifications.
8. Add comments while the request is accessible.
9. After staff resolves the request, close it and submit feedback.

## Staff workflow

1. Log in using an administrator-created staff account.
2. View requests assigned to the logged-in staff member.
3. Open request details and access permitted attachments/evidence.
4. Add comments.
5. Start an assigned request, changing it to `In Progress`.
6. Resolve it with a resolution message and optional evidence.
7. View assigned tasks, start tasks, and complete tasks.
8. Receive in-app and Socket.IO notification updates.

Staff cannot assign requests, create staff accounts, or close requests.

## Administrator workflow

1. Log in with an administrator account.
2. Manage users and staff, including status changes and staff creation.
3. Manage active departments and categories.
4. View all requests, open request details, assign or reassign staff, and
   review status history/comments.
5. Review AI classification suggestions and confirm/reject duplicate
   suggestions. These decisions are assistive and do not merge or delete
   requests.
6. Create and manage staff tasks.
7. View reports, analytics, feedback, audit logs, and notifications.
8. Use Settings for administrator profile and password changes.

## Request status rules

```text
Pending → Assigned       Admin assigns staff
Assigned → In Progress   Assigned staff starts work
In Progress → Resolved   Assigned staff resolves work
Resolved → Closed        Request owner closes the request
```

Invalid transitions and unauthorized role actions are rejected by the backend.
