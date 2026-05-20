import api from './api';

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const taskService = {
  getAll: (params = {}) => api.get('/tasks', { params }),
  getKanban: () => api.get('/tasks', { params: { board: 'kanban' } }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.put(`/tasks/${id}/status`, { status }),
  delete: (id) => api.delete(`/tasks/${id}`),
  addSubtask: (id, title) => api.post(`/tasks/${id}/subtasks`, { title }),
  updateSubtask: (id, subtaskId, completed) =>
    api.put(`/tasks/${id}/subtasks/${subtaskId}`, { completed }),
  reorder: (tasks) => api.put('/tasks/reorder', { tasks }),
};

// ─── Notes ────────────────────────────────────────────────────────────────────
export const noteService = {
  getAll: (params = {}) => api.get('/notes', { params }),
  getFolders: () => api.get('/notes/folders'),
  search: (q) => api.get('/notes/search', { params: { q } }),
  getOne: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  togglePin: (id) => api.put(`/notes/${id}/pin`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getProductivity: (days = 7) => api.get('/analytics/productivity', { params: { days } }),
};

// ─── GitHub ───────────────────────────────────────────────────────────────────
export const githubService = {
  getActivity: () => api.get('/github/activity'),
  getHeatmap: () => api.get('/github/heatmap'),
  connect: () => { window.location.href = '/api/github/connect'; },
  disconnect: () => api.delete('/github/disconnect'),
  getProfileByUsername: (username) => api.get(`/github/profile/${username}`),
  getReposByUsername: (username, page = 1) => api.get(`/github/repos/${username}`, { params: { page } }),
  getRecentByUsername: (username) => api.get(`/github/recent/${username}`),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiService = {
  getSuggestions: () => api.post('/ai/task-suggestions'),
  breakdownTask: (title, description) => api.post('/ai/task-breakdown', { title, description }),
  getWeeklySummary: () => api.get('/ai/weekly-summary'),
  getProductivityTips: () => api.get('/ai/productivity-tips'),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationService = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Habits ───────────────────────────────────────────────────────────────────
export const habitService = {
  getAll: () => api.get('/habits'),
  getStats: () => api.get('/habits/stats'),
  create: (data) => api.post('/habits', data),
  checkIn: (id, note) => api.put(`/habits/${id}/checkin`, { note }),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
};

// ─── LeetCode ─────────────────────────────────────────────────────────────────
export const leetcodeService = {
  connect: (username) => api.put('/leetcode/connect', { username }),
  disconnect: () => api.delete('/leetcode/disconnect'),
  getProfile: (username) => api.get(`/leetcode/profile/${username}`),
  getCalendar: (username) => api.get(`/leetcode/calendar/${username}`),
  getRecent: (username) => api.get(`/leetcode/recent/${username}`),
};

