// ================================================================
// Zyrix FinSuite — API Service Layer
// Backend: https://finsuite-backend-production.up.railway.app
// ================================================================

const BASE_URL = "http://localhost:3000";

// ──────────────────────────────────────────────
// Core fetch wrapper with auth + error handling
// ──────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("zyrix_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 — clear token and redirect to login
  if (response.status === 401) {
    localStorage.removeItem("zyrix_token");
    localStorage.removeItem("zyrix_user");
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Error ${response.status}`);
  }

  return data;
}

// ──────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    apiFetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (payload) =>
    apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiFetch("/api/auth/logout", { method: "POST" }),

  me: () => apiFetch("/api/auth/me"),

  refreshToken: () =>
    apiFetch("/api/auth/refresh", { method: "POST" }),
};

// ──────────────────────────────────────────────
// CUSTOMER DASHBOARD
// ──────────────────────────────────────────────
export const customerAPI = {
  // Portfolio / overview
  getPortfolio: () => apiFetch("/api/customer/portfolio"),
  getBalance: () => apiFetch("/api/customer/balance"),
  getStats: () => apiFetch("/api/customer/stats"),

  // Transactions
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/customer/transactions${qs ? `?${qs}` : ""}`);
  },
  getTransaction: (id) => apiFetch(`/api/customer/transactions/${id}`),

  // Investments
  getInvestments: () => apiFetch("/api/customer/investments"),
  getInvestment: (id) => apiFetch(`/api/customer/investments/${id}`),

  // Accounts
  getAccounts: () => apiFetch("/api/customer/accounts"),
  getAccount: (id) => apiFetch(`/api/customer/accounts/${id}`),

  // Notifications
  getNotifications: () => apiFetch("/api/customer/notifications"),
  markNotificationRead: (id) =>
    apiFetch(`/api/customer/notifications/${id}/read`, { method: "PATCH" }),

  // Profile
  getProfile: () => apiFetch("/api/customer/profile"),
  updateProfile: (data) =>
    apiFetch("/api/customer/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ──────────────────────────────────────────────
// ADMIN PANEL
// ──────────────────────────────────────────────
export const adminAPI = {
  // Dashboard stats
  getDashboardStats: () => apiFetch("/api/admin/stats"),
  getRevenueChart: (period = "monthly") =>
    apiFetch(`/api/admin/revenue?period=${period}`),

  // Users management
  getUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/admin/users${qs ? `?${qs}` : ""}`);
  },
  getUser: (id) => apiFetch(`/api/admin/users/${id}`),
  createUser: (data) =>
    apiFetch("/api/admin/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id, data) =>
    apiFetch(`/api/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteUser: (id) =>
    apiFetch(`/api/admin/users/${id}`, { method: "DELETE" }),
  toggleUserStatus: (id, active) =>
    apiFetch(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    }),

  // Transactions management
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/admin/transactions${qs ? `?${qs}` : ""}`);
  },
  getTransaction: (id) => apiFetch(`/api/admin/transactions/${id}`),
  updateTransactionStatus: (id, status) =>
    apiFetch(`/api/admin/transactions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Reports
  getReport: (type, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/admin/reports/${type}${qs ? `?${qs}` : ""}`);
  },
  exportReport: (type, format = "csv") =>
    apiFetch(`/api/admin/reports/${type}/export?format=${format}`),

  // Settings
  getSettings: () => apiFetch("/api/admin/settings"),
  updateSettings: (data) =>
    apiFetch("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Logs
  getAuditLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/admin/logs${qs ? `?${qs}` : ""}`);
  },
};

// ──────────────────────────────────────────────
// Token Helpers
// ──────────────────────────────────────────────
export const tokenUtils = {
  set: (token) => localStorage.setItem("zyrix_token", token),
  get: () => localStorage.getItem("zyrix_token"),
  clear: () => {
    localStorage.removeItem("zyrix_token");
    localStorage.removeItem("zyrix_user");
  },
  isValid: () => {
    const token = localStorage.getItem("zyrix_token");
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};

export default apiFetch;