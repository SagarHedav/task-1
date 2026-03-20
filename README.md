# TaskFlow v2 — Authentication + PostgreSQL Task Manager

A full-stack task management application featuring **User Authentication (JWT)** and **PostgreSQL (NeonDB)** data persistence. Built with **Node.js + Express**, **React + Tailwind CSS v4**, and **Docker**.

---

## 🚀 Quick Start with Docker

```bash
# Clone and start all services
git clone <your-repo-url>
cd biduyat-task

docker-compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:5000        |

---

## 🖥️ Running Locally (without Docker)

### Backend
```bash
cd backend
npm install
npm run dev   # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # runs on http://localhost:5173
```

---

## 📡 API Endpoints

**Base URL:** `http://localhost:5000/api`

### 🔒 Authentication (Public)

#### `POST /api/auth/register`
Creates a new user account.
**Request Body:**
```json
{
  "username": "johndoe",
  "password": "mysecurepassword"
}
```
**Response `200`:** `{ "success": true, "token": "jwt_string", "user": { "id": 1, "username": "johndoe" } }`

#### `POST /api/auth/login`
Authenticates a user and returns a JWT token.
**Request Body:** Same as register.
**Response `200`:** `{ "success": true, "token": "jwt_string", "user": { "id": 1, "username": "johndoe" } }`

---

### 📝 Tasks (Protected)
> All task endpoints require an `Authorization: Bearer <token>` header.

| Field        | Type     | Description                         |
|-------------|----------|-------------------------------------|
| `id`         | integer  | Primary Key                         |
| `user_id`    | integer  | Foreign Key to `users`              |
| `title`      | string   | Task title (**required**)           |
| `description`| string   | Task details (optional)             |
| `status`     | string   | `"pending"` or `"completed"`        |
| `created_at` | ISO 8601 | Creation timestamp (auto-generated) |

---

### `GET /api/tasks`
Returns all tasks.

**Response `200`:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "uuid-here",
      "title": "My Task",
      "description": "Task details",
      "status": "pending",
      "created_at": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/tasks/:id`
Returns a single task by ID.

**Response `200`:** `{ "success": true, "data": { ...task } }`  
**Response `404`:** `{ "success": false, "error": "Task not found" }`

---

### `POST /api/tasks`
Creates a new task.

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending"
}
```

**Validation:** `title` is required and cannot be empty.

**Response `201`:** `{ "success": true, "data": { ...newTask } }`  
**Response `400`:** `{ "success": false, "error": "Title is required and cannot be empty." }`

---

### `PUT /api/tasks/:id`
Updates an existing task (partial updates supported).

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed"
}
```

**Response `200`:** `{ "success": true, "data": { ...updatedTask } }`  
**Response `404`:** `{ "success": false, "error": "Task not found" }`

---

### `PATCH /api/tasks/:id/toggle`
Toggles task status between `pending` ↔ `completed`.

**Response `200`:** `{ "success": true, "data": { ...task } }`

---

### `DELETE /api/tasks/:id`
Deletes a task by ID.

**Response `200`:** `{ "success": true, "message": "Task deleted successfully", "data": { ...task } }`  
**Response `404`:** `{ "success": false, "error": "Task not found" }`

---

### `GET /health`
Health check endpoint.

**Response:** `{ "status": "ok", "timestamp": "..." }`

---

## ✅ Validation Rules

| Field   | Rule                          |
|---------|-------------------------------|
| `title` | Required, cannot be empty     |
| `status`| Must be `pending` or `completed` (defaults to `pending`) |

---

## 🐳 Docker Architecture

```
docker-compose.yml
├── backend  (Node.js 18-alpine → port 5000)
└── frontend (Node.js build → Nginx → port 3000)
```

Nginx in the frontend container also proxies `/api/*` requests to the backend service, so the frontend and API share the same origin when accessed via Docker.

---

## 🗂️ Project Structure

```
biduyat-task/
├── backend/
│   ├── src/routes/tasks.js   # CRUD API routes
│   ├── server.js             # Express entry point
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/tasks.js       # Axios API client
│   │   ├── components/
│   │   │   ├── TaskCard.jsx
│   │   │   └── AddTaskModal.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

| Layer    | Technology             |
|----------|------------------------|
| Backend  | Node.js, Express       |
| Frontend | React, Vite, Tailwind  |
| Styling  | Tailwind CSS           |
| HTTP     | Axios                  |
| Server   | Nginx                  |
| Containers | Docker, docker-compose |
| VCS      | Git                    |
