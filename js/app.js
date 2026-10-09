/* =============================================
   app.js — Core Router & Utilities
============================================= */
const App = {

  _history: [],

  // ---- Navigate to a screen ----
  navigate(screenId) {
    const current = document.querySelector('.screen.active');
    if (current && current.id !== screenId) {
      this._history.push(current.id);
    }
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const next = document.getElementById(screenId);
    if (next) {
      next.classList.add('active');
      next.scrollTop = 0;
    }
  },

  // ---- Go back ----
  goBack() {
    if (this._history.length > 0) {
      const prev = this._history.pop();
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      const screen = document.getElementById(prev);
      if (screen) screen.classList.add('active');
    } else {
      const session = DB.getSession();
      if (session) {
        this.navigate(session.role === 'admin' ? 'screen-admin' : 'screen-resident');
      } else {
        this.navigate('screen-signin');
      }
    }
  },

  // ---- Toast ----
  toast(msg, type = '', duration = 2800) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast show ${type}`;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), duration);
  },

  // ---- Format date ----
  formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  },

  formatDateTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString('en-PH', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  // ---- Status badge HTML ----
  statusBadge(status) {
    const map = {
      pending:  ['status-pending',  '⏳ Pending'],
      approved: ['status-approved', '✅ Approved'],
      rejected: ['status-rejected', '❌ Rejected'],
      ready:    ['status-ready',    '📦 Ready'],
    };
    const [cls, label] = map[status] || ['status-pending', status];
    return `<span class="req-status ${cls}">${label}</span>`;
  },

  // ---- Cert emoji ----
  certEmoji(type) {
    const map = {
      'Barangay Clearance':      '📋',
      'Certificate of Residency':'🏠',
      'Barangay Indigency':      '📜',
      'Certificate of Indigency':'📑',
      'Business Clearance':      '🏪',
    };
    return map[type] || '📄';
  },

  // ---- Generate unique ID ----
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  },

  // ---- Init app on load ----
  init() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    // Set today's date on resident dashboard
    const dateEl = document.getElementById('resident-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-PH', {
        weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
      });
    }

    // Check existing session
    const session = DB.getSession();
    if (session) {
      if (session.role === 'admin') {
        Admin.load();
        this.navigate('screen-admin');
      } else {
        Resident.load();
        this.navigate('screen-resident');
      }
    } else {
      this.navigate('screen-splash');
    }

    // Purpose other field toggle
    const purposeEl = document.getElementById('req-purpose');
    if (purposeEl) {
      purposeEl.addEventListener('change', function () {
        const og = document.getElementById('purpose-other-group');
        if (og) og.style.display = this.value === 'Other' ? 'flex' : 'none';
      });
    }
  },

  // Override navigate to trigger screen-specific loaders
  _origNavigate: null,
};

// Patch navigate to trigger loaders on specific screens
(function() {
  const _nav = App.navigate.bind(App);
  App.navigate = function(screenId) {
    _nav(screenId);
    if (screenId === 'screen-profile')   Resident.loadProfile();
    if (screenId === 'screen-track')     Resident.showMyRequests();
    if (screenId === 'screen-resident')  Resident.renderRecentRequests();
    if (screenId === 'screen-admin')     Admin.load();
  };
})();


window.addEventListener('DOMContentLoaded', () => App.init());
