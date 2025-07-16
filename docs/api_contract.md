# Task Tracker API Contract


## Authentication

### POST /api/auth/signup
- **Description**: Creates a new user account and returns a JWT token.
- **Request**:
  - **Headers**: `Content-Type: application/json`
  - **Body**: `{ "email": "", "password": "" }`
- **Response**:
  - **201 Created**: `{ "message": "User created", "token": "jwt-token" }`
  - **400 Bad Request**: `{ "error": "Invalid email or password" }`
  - **409 Conflict**: `{ "error": "Email already exists" }`


### POST /api/auth/login
- **Description**: Authenticates a user and returns a JWT token.
- **Request**:
  - **Headers**: `Content-Type: application/json`
  - **Body**: `{ "email": "", "password": "" }`
- **Response**:
  - **200 OK**: `{ "token": "jwt-token" }`
  - **401 Unauthorized**: `{ "error": "Invalid credentials" }`


## Tasks

### POST /api/tasks
- **Description**: Creates a new task for the authenticated user.
- **Request**:
  - **Headers**: `Content-Type: application/json`, `Authorization: Bearer <jwt-token>`
  - **Body**: `{ "title": "Finish report", "description": "Write summary", "estimate": 2 }`
- **Response**:
  - **201 Created**: `{ "task": { "id": 1, "title": "Finish report", "description": "Write summary", "status": "To-do", "estimate": 2, "logged_time": 0, "user_id": 1 } }`
  - **400 Bad Request**: `{ "error": "Title is required" }`
  - **401 Unauthorized**: `{ "error": "Invalid or missing token" }`


### GET /api/tasks
- **Description**: Retrieves all tasks for the authenticated user.
- **Request**:
  - **Headers**: `Authorization: Bearer <jwt-token>`
- **Response**:
  - **200 OK**: `{ "tasks": [{ "id": 1, "title": "Finish report", "status": "To-do", "estimate": 2, "logged_time": 0 }, ...] }`
  - **401 Unauthorized**: `{ "error": "Invalid or missing token" }`


### PATCH /api/tasks/:id
- **Description**: Updates a task’s title, description, estimate, or status.
- **Request**:
  - **Headers**: `Content-Type: application/json`, `Authorization: Bearer <jwt-token>`
  - **Body**: `{ "title": "Updated report", "description": "Revised summary", "estimate": 3, "status": "In Progress" }` (fields optional)
- **Response**:
  - **200 OK**: `{ "task": { "id": 1, "title": "Updated report", "status": "In Progress", ... } }`
  - **400 Bad Request**: `{ "error": "Invalid input" }`
  - **401 Unauthorized**: `{ "error": "Invalid or missing token" }`
  - **404 Not Found**: `{ "error": "Task not found" }`


### DELETE /api/tasks/:id
- **Description**: Deletes a task for the authenticated user.
- **Request**:
  - **Headers**: `Authorization: Bearer <jwt-token>`
- **Response**:
  - **204 No Content**: (no body)
  - **401 Unauthorized**: `{ "error": "Invalid or missing token" }`
  - **404 Not Found**: `{ "error": "Task not found" }`


### POST /api/tasks/:id/time
- **Description**: Logs time spent on a task.
- **Request**:
  - **Headers**: `Content-Type: application/json`, `Authorization: Bearer <jwt-token>`
  - **Body**: `{ "logged_time": 1.5 }`
- **Response**:
  - **200 OK**: `{ "task": { "id": 1, "logged_time": 1.5, ... } }`
  - **400 Bad Request**: `{ "error": "Logged time must be positive" }`
  - **401 Unauthorized**: `{ "error": "Invalid or missing token" }`
  - **404 Not Found**: `{ "error": "Task not found" }`


## Stats

### GET /api/stats
- **Description**: Retrieves productivity stats for the authenticated user.
- **Request**:
  - **Headers**: `Authorization: Bearer <jwt-token>`
- **Response**:
  - **200 OK**: `{ "stats": { "tasks_completed_today": 2, "tasks_completed_week": 10, "average_tasks_per_week": 5, "streak_days": 4, "completion_rate_month": "12/20", "most_productive_day": "Wednesday" } }`
  - **401 Unauthorized**: `{ "error": "Invalid or missing token" }`
