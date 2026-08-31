# DevTrack Pro - Selenium End-to-End (E2E) Test Suite

This directory contains automated End-to-End (E2E) tests for **DevTrack Pro** using **Selenium WebDriver** and the **Page Object Model (POM)** pattern.

---

## 🛠️ Architecture

```
e2e/
├── config/
│   └── driver.js        # WebDriver builder with headless / headful options & timeout configs
├── pages/               # Page Object Models encapsulating locators & actions
│   ├── BasePage.js      # Core helper actions (click, type, wait, screenshot, navigation)
│   ├── AuthPage.js      # Login and Register pages
│   ├── DashboardPage.js # Dashboard layout, stats, and sidebar navigation
│   ├── TasksPage.js     # Kanban board, task creation modal, move status forward
│   ├── HabitsPage.js    # Habit tracker creation, check-in, and streak progress
│   ├── NotesPage.js     # Notes manager and search
│   └── FocusPage.js     # Pomodoro focus timer controls
├── specs/               # E2E Test specifications
│   ├── 01_auth.spec.js
│   ├── 02_dashboard.spec.js
│   ├── 03_tasks.spec.js
│   ├── 04_habits.spec.js
│   ├── 05_notes.spec.js
│   └── 06_focus.spec.js
├── runner.js            # Standalone test runner with colored output and summary reporting
└── package.json         # Scripts and dependencies
```

---

## 📋 Prerequisites

- **Node.js** (v18+)
- **Google Chrome** installed (Selenium 4 automatically manages ChromeDriver binary)
- DevTrack frontend and backend running:
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:5001`

---

## 🚀 Running E2E Tests

### 1. Install dependencies
```bash
cd e2e
npm install
```

### 2. Run in Headless Mode (Recommended for CI/CD)
```bash
npm run test:e2e:headless
```

### 3. Run with Interactive Chrome Browser Window
```bash
npm run test:e2e
```

### 4. Run Individual Test Specs
```bash
npm run test:auth      # Run only Auth flow tests
npm run test:tasks     # Run only Kanban task tests
npm run test:habits    # Run only Habit tracker tests
npm run test:notes     # Run only Notes tests
npm run test:focus     # Run only Focus timer tests
```

---

## ⚙️ Environment Configuration

You can configure test behavior via environment variables:

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | `http://localhost:5173` | Frontend URL to test against |
| `HEADLESS` | `false` | Set to `true` to run Chrome in headless mode |
| `TEST_TIMEOUT` | `10000` | Timeout in milliseconds for explicit waits |
| `SPEC` | `""` | Filter test spec by name pattern |
