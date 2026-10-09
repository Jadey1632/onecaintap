/* =============================================
   db.js — localStorage Data Layer
   Simulates a database for the PWA
============================================= */
const DB = {

  // ---- Keys ----
  KEYS: {
    USERS:    'oct_users',
    SESSION:  'oct_session',
    REQUESTS: 'oct_requests',
    COUNTER:  'oct_counter',
  },

  // ---- Helpers ----
  _get(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  },
  _set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },

  // ---- INIT: seed default admin + demo resident ----
  init() {
    if (!this._get(this.KEYS.USERS)) {
      this._set(this.KEYS.USERS, [
        {
          id: 'admin-001',
          name: 'Barangay Admin',
          email: 'admin@cainta.gov.ph',
          password: 'admin123',
          role: 'admin',
          contact: '+63 917 000 0001',
          address: 'Barangay Hall, Cainta, Rizal',
          createdAt: new Date().toISOString()
        },
        {
          id: 'user-001',
          name: 'Juan Dela Cruz',
          email: 'juan@email.com',
          password: 'password123',
          role: 'resident',
          contact: '+63 920 456 7890',
          address: '10th St. Batumbakal, Cainta, Rizal',
          createdAt: new Date().toISOString()
        }
      ]);
    }
    if (!this._get(this.KEYS.COUNTER)) {
      this._set(this.KEYS.COUNTER, 1000);
    }
    if (!this._get(this.KEYS.REQUESTS)) {
      this._set(this.KEYS.REQUESTS, []);
    }
  },

  // ---- USERS ----
  getUsers() { return this._get(this.KEYS.USERS) || []; },

  getUserByEmail(email) {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  },

  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    this._set(this.KEYS.USERS, users);
  },

  updateUser(id, updates) {
    const users = this.getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
    this._set(this.KEYS.USERS, users);
  },

  // ---- SESSION ----
  getSession() { return this._get(this.KEYS.SESSION); },

  setSession(user) {
    this._set(this.KEYS.SESSION, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      contact: user.contact,
      address: user.address
    });
  },

  clearSession() { localStorage.removeItem(this.KEYS.SESSION); },

  // ---- REQUESTS ----
  getRequests() { return this._get(this.KEYS.REQUESTS) || []; },

  getRequestsByUser(userId) {
    return this.getRequests().filter(r => r.userId === userId);
  },

  getRequestById(id) {
    return this.getRequests().find(r => r.id === id);
  },

  addRequest(request) {
    const requests = this.getRequests();
    requests.unshift(request); // newest first
    this._set(this.KEYS.REQUESTS, requests);
    return request;
  },

  updateRequest(id, updates) {
    const requests = this.getRequests().map(r =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    );
    this._set(this.KEYS.REQUESTS, requests);
  },

  // ---- REQUEST NUMBER ----
  nextRequestNum() {
    const counter = (this._get(this.KEYS.COUNTER) || 1000) + 1;
    this._set(this.KEYS.COUNTER, counter);
    return `REQ-${String(counter).padStart(5, '0')}`;
  },

  // ---- STATS ----
  getStats() {
    const all = this.getRequests();
    return {
      total:    all.length,
      pending:  all.filter(r => r.status === 'pending').length,
      approved: all.filter(r => r.status === 'approved').length,
      rejected: all.filter(r => r.status === 'rejected').length,
      ready:    all.filter(r => r.status === 'ready').length,
    };
  }
};

// Initialise on load
DB.init();
