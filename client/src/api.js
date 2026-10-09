/**
 * Centralised API client.
 * All authenticated requests automatically attach the Bearer token
 * stored in localStorage by the login flow.
 */

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('onecaintap_token') ?? null;
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function handle(res) {
  const data = await res.json().catch(() => ({ success: false, message: `HTTP ${res.status}` }));
  return data;
}

export const api = {
  // ── Auth (no token needed) ────────────────────────────────────────────────
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handle(res);
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handle(res);
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handle(res);
  },

  async verifyOtp(email, code) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    return handle(res);
  },

  async resetPassword(email, password) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handle(res);
  },

  // ── Certificates (public) ─────────────────────────────────────────────────
  async getCertificates() {
    const res = await fetch(`${API_BASE}/certificates`);
    return handle(res);
  },

  // ── Requests (authenticated) ──────────────────────────────────────────────
  async getRequests(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/requests${query ? `?${query}` : ''}`, {
      headers: authHeaders({ 'Content-Type': undefined }),
    });
    return handle(res);
  },

  async getRequestById(id) {
    const res = await fetch(`${API_BASE}/requests/${encodeURIComponent(id)}`, {
      headers: authHeaders({ 'Content-Type': undefined }),
    });
    return handle(res);
  },

  async createRequest(data) {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handle(res);
  },

  async updateRequestStatus(id, { status, admin_remarks, approved_by }) {
    const res = await fetch(`${API_BASE}/requests/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status, admin_remarks, approved_by }),
    });
    return handle(res);
  },

  // ── Upload (authenticated) ────────────────────────────────────────────────
  async uploadFile(file) {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return handle(res);
  },

  // ── Analytics (authenticated) ─────────────────────────────────────────────
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: authHeaders({ 'Content-Type': undefined }),
    });
    return handle(res);
  },

  // ── Notifications (authenticated) ─────────────────────────────────────────
  async getNotifications(userId) {
    const res = await fetch(`${API_BASE}/notifications?user_id=${encodeURIComponent(userId)}`, {
      headers: authHeaders({ 'Content-Type': undefined }),
    });
    return handle(res);
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': undefined }),
    });
    return handle(res);
  },

  // ── Transactions & audit (authenticated) ──────────────────────────────────
  async getTransactions() {
    const res = await fetch(`${API_BASE}/transactions`, {
      headers: authHeaders({ 'Content-Type': undefined }),
    });
    return handle(res);
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: authHeaders({ 'Content-Type': undefined }),
    });
    return handle(res);
  },

  // ── Public ────────────────────────────────────────────────────────────────
  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handle(res);
  },

  async verifyCertificate(hash) {
    const res = await fetch(`${API_BASE}/verify-certificate/${encodeURIComponent(hash)}`);
    return handle(res);
  },
};
