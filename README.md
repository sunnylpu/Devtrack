# DevTrack Pro

> AI-Powered Developer Productivity Platform — Task management, habit tracking, focus timer, GitHub integration, and AI assistance all in one sleek dark-mode dashboard.

![Node.js](https://img.shields.io/badge/Node.js-20-green)
![React](https://img.shields.io/badge/React-19-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7-brightgreen)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📋 **Task Board** | Kanban-style task management with drag-and-drop, subtasks, and priorities |
| 📝 **Notes** | Markdown editor with folder organization, search, and pinning |
| 🎯 **Focus Timer** | Pomodoro-powered deep work sessions with customizable durations |
| 🔥 **Habit Tracker** | Daily/weekly habits with streak tracking and completion rates |
| 🐙 **GitHub Integration** | OAuth-connected activity feed, contribution heatmap, and repo stats |
| 🤖 **AI Assistant** | OpenAI-powered task breakdown, suggestions, and weekly summaries |
| 📊 **Analytics Dashboard** | Productivity charts, completion trends, and streak tracking |
| 🔔 **Real-Time Notifications** | Socket.io powered live updates across all features |
| ⚙️ **Settings** | Profile management, Pomodoro configuration, and password changes |

---

## 🏗️ Architecture

```
devtrack-pro/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/       # DB connection, env validation
│   │   ├── controllers/  # Route handlers (auth, tasks, notes, habits, ai, github, analytics)
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── models/       # Mongoose schemas (User, Task, Note, Habit, Notification)
│   │   ├── routes/       # Express routers
│   │   ├── services/     # BullMQ queues, email service
│   │   └── utils/        # Logger, response helpers
│   ├── tests/            # Jest unit tests
│   ├── Dockerfile        # Production container
│   └── .env.example      # Environment template
│
├── frontend/             # React 19 + Vite + TailwindCSS v4
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   │   ├── ai/       # AISuggestionCard
│   │   │   ├── focus/    # TimerCircle
│   │   │   ├── github/   # GitHubWidgets (Heatmap, CommitList, etc.)
│   │   │   ├── layout/   # AppLayout (sidebar shell)
│   │   │   ├── notes/    # NoteCard
│   │   │   ├── tasks/    # TaskCard, TaskDetailModal, CreateTaskModal
│   │   │   └── ui/       # ErrorBoundary, PageLoader, ConfirmDialog, EmptyState, NotificationBell
│   │   ├── hooks/        # useSocket, useRealTimeBoard
│   │   ├── pages/        # Route-level pages (lazy-loaded)
│   │   ├── services/     # Axios API client, Socket.io client
│   │   ├── store/        # Zustand auth store
│   │   └── utils/        # Shared helpers
│   ├── Dockerfile        # Multi-stage production build
│   └── nginx.conf        # SPA routing config
│
├── nginx/                # Reverse proxy config
├── k8s/                  # Kubernetes manifests (Deployments, Services, Ingress, Secrets)
├── terraform/            # AWS IaC (VPC, EKS Cluster, ECR Repositories)
├── docker-compose.yml    # Full stack orchestration
├── .github/workflows/    # CI/CD pipelines (Local CI & AWS EKS Deployment)
└── API_DOCS.md           # REST API documentation
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 20
- **MongoDB** (local or Atlas)
- **Redis** (optional — for background jobs)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/devtrack-pro.git
cd devtrack-pro

# Backend
cd backend
cp .env.example .env    # ← Edit with your values
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env` with your settings:

```env
MONGO_URI=mongodb://localhost:27017/devtrack_pro
JWT_SECRET=your_random_secret_here
JWT_REFRESH_SECRET=another_random_secret
OPENAI_API_KEY=sk-...          # Optional: enables AI features
GITHUB_CLIENT_ID=...           # Optional: enables GitHub integration
GITHUB_CLIENT_SECRET=...
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173** and register a new account.

---

## 🐳 Docker Deployment

```bash
# Build and start all services
docker compose up -d --build

# Access the app at http://localhost
```

This starts: MongoDB, Redis, Backend API, Frontend (nginx), and Reverse Proxy.

---

## ☸️ Kubernetes Deployment

Deploy DevTrack Pro on any Kubernetes cluster (Minikube, Kind, k3s, or cloud K8s):

```bash
# Apply all Kubernetes manifests in order
kubectl apply -k k8s/

# Verify running pods and services
kubectl get pods -n devtrack
kubectl get svc -n devtrack

# Verify ingress routing
kubectl get ingress -n devtrack
```

### Manifest Structure:
- `k8s/namespace.yaml` — Dedicated `devtrack` namespace
- `k8s/configmap-secret.yaml` — Environment variables & sensitive credentials
- `k8s/mongodb.yaml` — MongoDB Stateful Deployment with PVC (10Gi)
- `k8s/redis.yaml` — Redis Cache Deployment with PVC (2Gi)
- `k8s/backend.yaml` — Backend API Deployment (2 replicas, health probes)
- `k8s/frontend.yaml` — Frontend SPA Deployment (2 replicas, health probes)
- `k8s/ingress.yaml` — Ingress controller routing `/api`, `/socket.io`, and `/`

---

## ☁️ AWS Cloud Deployment (Terraform + EKS + ECR)

Provision AWS infrastructure using Infrastructure as Code (IaC) and deploy to EKS:

### 1. Provision Infrastructure with Terraform

```bash
cd terraform

# Initialize providers
terraform init

# Plan infrastructure changes
terraform plan

# Apply infrastructure creation (VPC, EKS Cluster, ECR repos)
terraform apply
```

### 2. Configure Local `kubectl` for AWS EKS

```bash
aws eks update-kubeconfig --name devtrack-eks-cluster --region us-east-1
```

### 3. CI/CD Automated Deployment via GitHub Actions

Set the following repository secrets in GitHub (`Settings -> Secrets and variables -> Actions`):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Pushing to `main` branch automatically triggers `.github/workflows/deploy-aws-eks.yml` to:
1. Authenticate to AWS ECR
2. Build and tag Docker container images with Git SHA
3. Push images to Amazon ECR repositories (`devtrack-backend` & `devtrack-frontend`)
4. Apply Kubernetes manifests to EKS cluster and monitor rollout status.

---

## 🧪 Testing

### 1. Backend Jest Unit Tests

DevTrack Pro includes 12 comprehensive unit test suites covering all controllers, middleware, and utils (109+ tests):

```bash
cd backend
npm test              # Run all unit test suites
npm run test:watch    # Watch mode
```

**Unit Test Coverage:**
- `authController` — Register, Login, Refresh, Logout, GetMe, UpdateProfile, ChangePassword
- `taskController` — CRUD, Status transition, Subtasks, Kanban grouping, Reorder bulk write
- `habitController` — GetHabits, CreateHabit, CheckIn, UpdateHabit, DeleteHabit, GetStats
- `noteController` — CRUD, Search indexing, Folders, TogglePin
- `analyticsController` — Dashboard metrics aggregation, Productivity trends
- `aiController` — Task suggestions, AI breakdown, Weekly summaries, Productivity tips
- `githubController` — OAuth connect/callback, Activity feeds, Contribution heatmap, Public repos/commits
- `leetcodeController` — Public GraphQL profile, Calendar heatmap, Recent submissions, Connect/disconnect
- `notificationController` — Pagination, Read marking, Read all, Delete
- `authMiddleware` — Bearer headers, query token fallback, expired/invalid token handling, role authorization
- `errorHandler` — ValidationError, CastError, duplicate key (11000), JWT errors, 404 notFound
- `jwtUtil` — Token generation and signature verification for access and refresh tokens

### 2. Selenium End-to-End (E2E) Tests

The `e2e/` folder contains automated Selenium WebDriver tests implementing the **Page Object Model (POM)**:

```bash
cd e2e
npm install

# Run all E2E tests in headless Chrome
npm run test:e2e:headless

# Run all E2E tests with interactive Chrome window
npm run test:e2e

# Run individual specs
npm run test:auth      # Auth & registration flow
npm run test:dashboard # Dashboard & sidebar navigation
npm run test:tasks     # Kanban board task creation & updates
npm run test:habits    # Habit tracker & daily check-in
npm run test:notes     # Notes creation & search
npm run test:focus     # Pomodoro timer controls
```

---

## 📡 API Reference

Full API documentation is available in [API_DOCS.md](./API_DOCS.md).

**Quick overview:**

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Register, Login, Logout, Refresh, Profile |
| `/api/tasks` | CRUD, Kanban board, Subtasks, Reorder |
| `/api/notes` | CRUD, Search, Folders, Pin |
| `/api/habits` | CRUD, Check-in, Streak stats |
| `/api/analytics` | Dashboard overview, Productivity trends |
| `/api/ai` | Task suggestions, Breakdown, Weekly summary |
| `/api/github` | OAuth, Activity feed, Contribution heatmap |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, TailwindCSS v4, Zustand, React Query v5, Recharts |
| **Backend** | Node.js 20, Express 5, Mongoose 9, Socket.io 4 |
| **Database** | MongoDB 7 |
| **Cache/Queue** | Redis 7, BullMQ (optional) |
| **AI** | OpenAI GPT-4o-mini (falls back to smart mocks) |
| **CI/CD** | GitHub Actions |
| **Deploy** | Docker Compose, Nginx reverse proxy |

---

## 📁 Key Design Decisions

- **Code Splitting**: All feature pages are lazy-loaded via `React.lazy()` with manual Rollup chunks for vendor libraries
- **Error Boundaries**: Global `ErrorBoundary` wrapper catches render crashes gracefully
- **Rate Limiting**: Disabled in development; configurable in production via environment
- **AI Fallback**: All AI endpoints degrade to smart mock responses when no OpenAI key is set
- **Socket.io**: Auto-connects on login, reconnects on disconnect, used for real-time task updates and notifications
- **Auth Flow**: JWT access tokens (15min) + HTTP-Only refresh cookies (7d) with automatic rotation

---

## 📄 License

MIT © DevTrack Pro
