# DevTrack Pro - API Documentation

## Base URL
All endpoints are relative to `http://localhost:5001/api` (in development).

## Authentication
Most endpoints (except login/register) require a valid JWT token sent in the `Authorization` header or automatically handled via HTTP-Only cookies.

`Authorization: Bearer <your_access_token>`

---

## 1. Auth Endpoints
Prefix: `/api/auth`

| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|--------------|
| `POST` | `/register` | Register a new user | `{ name, email, password }` |
| `POST` | `/login` | Authenticate user | `{ email, password }` |
| `POST` | `/logout` | Logout user (clears cookies) | None |
| `POST` | `/refresh` | Get a new access token using refresh cookie | None |
| `GET`  | `/me` | Get current user profile | None |
| `PUT`  | `/profile` | Update user profile | `{ name, avatar, preferences }` |
| `PUT`  | `/password` | Change user password | `{ currentPassword, newPassword }` |

---

## 2. Tasks Endpoints
Prefix: `/api/tasks`

| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|--------------|
| `GET`  | `/` | Get all tasks (paginated) | `?page=1&limit=20&status=todo` |
| `GET`  | `/kanban` | Get tasks grouped by status (board view) | None |
| `POST` | `/` | Create a new task | `{ title, description, status, priority, tags }` |
| `GET`  | `/:id` | Get task by ID | None |
| `PUT`  | `/:id` | Update task details | `{ title, description, status... }` |
| `DELETE`| `/:id` | Delete a task | None |
| `PUT`  | `/:id/status` | Update task status only | `{ status }` |
| `PUT`  | `/:id/subtasks` | Add or update subtask | `{ subtaskId, title, completed }` |

---

## 3. Notes Endpoints
Prefix: `/api/notes`

| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|--------------|
| `GET`  | `/` | Get all notes (paginated) | `?page=1&limit=20&folder=General` |
| `GET`  | `/search` | Search across notes | `?q=search_term` |
| `GET`  | `/folders` | Get list of distinct folders | None |
| `POST` | `/` | Create a new note | `{ title, content, folder, tags }` |
| `GET`  | `/:id` | Get note by ID | None |
| `PUT`  | `/:id` | Update note | `{ title, content, folder... }` |
| `DELETE`| `/:id` | Delete a note | None |
| `PUT`  | `/:id/pin` | Toggle pin status | None |

---

## 4. Habits Endpoints
Prefix: `/api/habits`

| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|--------------|
| `GET`  | `/` | Get all active habits | None |
| `GET`  | `/stats` | Get habit tracking statistics | None |
| `POST` | `/` | Create a new habit | `{ name, icon, color, frequency }` |
| `PUT`  | `/:id` | Update habit details | `{ name, description... }` |
| `PUT`  | `/:id/checkin`| Mark habit as completed for today | `{ note: "optional text" }` |
| `DELETE`| `/:id` | Delete a habit | None |

---

## 5. Analytics & AI Endpoints
Prefix: `/api/analytics` & `/api/ai`

| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|--------------|
| `GET`  | `/analytics/dashboard` | Get high-level stats & charts | None |
| `GET`  | `/analytics/productivity`| Get detailed productivity stats | None |
| `POST` | `/ai/task-breakdown` | AI: Breakdown large task | `{ title }` |
| `GET`  | `/ai/weekly-summary` | AI: Generate summary of week's work | None |
| `GET`  | `/ai/productivity-tips`| AI: Generate personalized tips | None |

---

## 6. GitHub Integration
Prefix: `/api/github`

| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|--------------|
| `GET`  | `/connect` | Redirect to GitHub OAuth | None |
| `GET`  | `/callback` | GitHub OAuth callback | `?code=XYZ&state=ABC` |
| `GET`  | `/activity` | Get user's repositories & recent commits| None |
| `GET`  | `/heatmap` | Get 1-year contribution heatmap data | None |

---

## Socket.io Events (Real-Time)

*   `task:created` - Emitted when a new task is added.
*   `task:updated` - Emitted when a task changes status or details.
*   `task:deleted` - Emitted when a task is removed.
*   `notification:new` - Emitted when a user receives a new system notification.
