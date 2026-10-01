# SmartOps API Endpoints

## Base URL

http://localhost:5000

---

# MODULE 1 — AUTHENTICATION & AUTHORIZATION

## 1. Register User

Method:
POST

URL:
http://localhost:5000/api/auth/register

Authorization:
None

Body:
{
    "name": "Demo User",
    "email": "demouser@gmail.com",
    "password": "Password123"
}

---

## 2. Login

Method:
POST

URL:
http://localhost:5000/api/auth/login

Authorization:
None

Body:
{
    "email": "testuser@gmail.com",
    "password": "Password123"
}

---

## 3. Protected Test

Method:
GET

URL:
http://localhost:5000/api/test/protected

Authorization:
Bearer Token

Token:
USER_TOKEN

---

## 4. User Role Test

Method:
GET

URL:
http://localhost:5000/api/test/user

Authorization:
Bearer Token

Token:
USER_TOKEN

---

## 5. Staff Role Test

Method:
GET

URL:
http://localhost:5000/api/test/staff

Authorization:
Bearer Token

Token:
STAFF_TOKEN

---

## 6. Admin Role Test

Method:
GET

URL:
http://localhost:5000/api/test/admin

Authorization:
Bearer Token

Token:
ADMIN_TOKEN

---

# MODULE 2 — USER MANAGEMENT

## 1. Get All Users

Method:
GET

URL:
http://localhost:5000/api/users

Authorization:
Bearer ADMIN_TOKEN

---

## 2. Get User By ID

Method:
GET

URL:
http://localhost:5000/api/users/USER_ID

Authorization:
Bearer ADMIN_TOKEN

Example:

http://localhost:5000/api/users/6abbd0957480274cd5fe2d5e

---

## 3. Update User

Method:
PUT

URL:
http://localhost:5000/api/users/USER_ID

Authorization:
Bearer ADMIN_TOKEN

Body:
{
    "name": "Updated User",
    "email": "updateduser@gmail.com"
}

---

## 4. Deactivate User

Method:
PATCH

URL:
http://localhost:5000/api/users/USER_ID/status

Authorization:
Bearer ADMIN_TOKEN

Body:
{
    "isActive": false
}

---

## 5. Activate User

Method:
PATCH

URL:
http://localhost:5000/api/users/USER_ID/status

Authorization:
Bearer ADMIN_TOKEN

Body:
{
    "isActive": true
}

---

## 6. Delete User

Method:
DELETE

URL:
http://localhost:5000/api/users/USER_ID

Authorization:
Bearer ADMIN_TOKEN

---

# MODULE 3 — REQUEST MANAGEMENT

## 1. Create Request

Method:
POST

URL:
http://localhost:5000/api/requests

Authorization:
Bearer USER_TOKEN

Body:
{
    "title": "Unable to access company email",
    "description": "I am unable to login to my company email account.",
    "category": "IT Support",
    "priority": "High"
}

---

## 2. Get My Requests

Method:
GET

URL:
http://localhost:5000/api/requests/my

Authorization:
Bearer USER_TOKEN

---

## 3. Get Request By ID

Method:
GET

URL:
http://localhost:5000/api/requests/REQUEST_ID

Authorization:
Bearer USER_TOKEN

Example:

http://localhost:5000/api/requests/6abd2df66b3f408d79352366

---

## 4. Update Request

Method:
PUT

URL:
http://localhost:5000/api/requests/REQUEST_ID

Authorization:
Bearer USER_TOKEN

Body:
{
    "title": "Unable to access company email - Updated",
    "description": "I am still unable to login to my company email account.",
    "category": "IT Support",
    "priority": "High"
}

---

## 5. Get All Requests

Method:
GET

URL:
http://localhost:5000/api/requests

Authorization:
Bearer ADMIN_TOKEN

---

## 6. Assign Request To Staff

Method:
PATCH

URL:
http://localhost:5000/api/requests/REQUEST_ID/assign

Authorization:
Bearer ADMIN_TOKEN

Body:
{
    "staffId": "6abc00a7acf3b11329895dea"
}

Example:

http://localhost:5000/api/requests/6abd2df66b3f408d79352366/assign

---

## 7. Get Assigned Requests

Method:
GET

URL:
http://localhost:5000/api/requests/assigned

Authorization:
Bearer STAFF_TOKEN

---

# TEST ACCOUNTS

## User

Email:
testuser@gmail.com

Password:
Password123

Role:
user

---

## Staff

Email:
teststaff@gmail.com

Password:
Staff123

Role:
staff

Staff ID:
6abc00a7acf3b11329895dea

---

## Admin

Email:
testadmin@gmail.com

Password:
Admin123

Role:
admin

---

# REQUEST TEST DATA

Request ID:

6abd2df66b3f408d79352366

Staff ID:

6abc00a7acf3b11329895dea

---

# REQUEST STATUS

Pending
Assigned
In Progress
Resolved
Closed

---

# AUTHORIZATION FORMAT

For protected APIs:

Authorization:
Bearer YOUR_JWT_TOKEN

Example:

Authorization:
Bearer eyJhbGciOiJIUzI1NiIs...

---

# QUICK API LIST

## Authentication

POST    /api/auth/register
POST    /api/auth/login

## User Management

GET     /api/users
GET     /api/users/:id
PUT     /api/users/:id
PATCH   /api/users/:id/status
DELETE  /api/users/:id

## Request Management

POST    /api/requests
GET     /api/requests/my
GET     /api/requests/:id
PUT     /api/requests/:id
GET     /api/requests
PATCH   /api/requests/:id/assign
GET     /api/requests/assigned