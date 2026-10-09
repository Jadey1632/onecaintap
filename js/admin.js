/* =============================================
   admin.js — Admin Flow Logic
============================================= */
const Admin = {

  _currentReqId: null,
  _pendingAction: null,
  _filterStatus: 'all',

  // ---- Load admin dashboard ----
  load() {
    this.renderStats();
    this.renderRequests('all');
  },

  // ---- Render stats ----
  renderStats() {
    const stats = DB.getStats();
    const p = document.getElementById('stat-pending');
    const a = document.getElementById('stat-approved');
    const t = document.getElementById('stat-total');
    if (p) p.textContent = stats.pending;
    if (a) a.textContent = stats.approved;
    if (t) t.textContent = stats.total;
  },

  // ---- Render request list ----
  renderRequests(filter) {
    this._filterStatus = filter;
    const container = document.getElementById('admin-req-list');
    if (!container) return;

    let requests = DB.getRequests();
    if (filter !== 'all') {
      requests = requests.filter(r => r.status === filter);
    }

    // Update filter button styles
    document.querySelectorAll('#screen-admin .btn-sm').forEach(btn => {
      btn.style.background = '#eee';
      btn.style.color = '#333';
    });
    const activeBtn = document.getElementById('filter-' + filter);
    if (activeBtn) {
      activeBtn.style.background = 'var(--blue)';
      activeBtn.style.color = 'white';
    }

    if (requests.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="es-icon">📭</div>
          <p>No ${filter === 'all' ? '' : filter} requests.</p>
        </div>`;
      return;
    }

    container.innerHTML = requests.map(r => `
      <div class="admin-req-card" onclick="Admin.reviewRequest('${r.id}')">
        <div class="arc-top">
          <div>
            <div class="arc-type">${r.certType}</div>
            <div class="arc-name">👤 ${r.userName}</div>
          </div>
          ${App.statusBadge(r.status)}
        </div>
        <div class="arc-date">
          📋 ${r.requestNum} &nbsp;·&nbsp; 📅 ${App.formatDate(r.createdAt)}
          &nbsp;·&nbsp; ${r.delivery === 'pickup' ? '🏢 Pickup' : '🚚 Delivery'}
        </div>
      </div>`
    ).join('');
  },

  // ---- Filter requests ----
  filterRequests(filter, btn) {
    this.renderRequests(filter);
  },

  // ---- Open review screen ----
  reviewRequest(id) {
    this._currentReqId = id;
    this._pendingAction = null;
    const r = DB.getRequestById(id);
    if (!r) return;

    document.getElementById('admin-review-reqnum').textContent = r.requestNum;

    document.getElementById('admin-review-content').innerHTML = `
      <div class="info-row"><span class="ir-label">Request #</span><span class="ir-value">${r.requestNum}</span></div>
      <div class="info-row"><span class="ir-label">Certificate</span><span class="ir-value">${r.certType}</span></div>
      <div class="info-row"><span class="ir-label">Status</span><span class="ir-value">${App.statusBadge(r.status)}</span></div>
      <div class="info-row"><span class="ir-label">Resident</span><span class="ir-value">${r.userName}</span></div>
      <div class="info-row"><span class="ir-label">Email</span><span class="ir-value">${r.userEmail}</span></div>
      <div class="info-row"><span class="ir-label">Full Name</span><span class="ir-value">${r.fullName}</span></div>
      <div class="info-row"><span class="ir-label">Address</span><span class="ir-value">${r.address}</span></div>
      <div class="info-row"><span class="ir-label">Date of Birth</span><span class="ir-value">${r.dob || 'N/A'}</span></div>
      <div class="info-row"><span class="ir-label">Purpose</span><span class="ir-value">${r.purpose}</span></div>
      <div class="info-row"><span class="ir-label">Copies</span><span class="ir-value">${r.copies}</span></div>
      <div class="info-row"><span class="ir-label">Delivery</span><span class="ir-value">${r.delivery === 'pickup' ? '🏢 Pickup' : '🚚 Delivery'}</span></div>
      ${r.delivery === 'pickup' && r.pickupDate ? `<div class="info-row"><span class="ir-label">Pickup Date</span><span class="ir-value">${r.pickupDate}</span></div>` : ''}
      ${r.delivery === 'pickup' && r.pickupTime ? `<div class="info-row"><span class="ir-label">Pickup Time</span><span class="ir-value">${r.pickupTime}</span></div>` : ''}
      ${r.delivery === 'delivery' ? `<div class="info-row"><span class="ir-label">Deliver To</span><span class="ir-value">${r.deliveryAddr}</span></div>` : ''}
      ${r.delivery === 'delivery' ? `<div class="info-row"><span class="ir-label">Contact</span><span class="ir-value">${r.deliveryContact}</span></div>` : ''}
      <div class="info-row"><span class="ir-label">Submitted</span><span class="ir-value">${App.formatDateTime(r.createdAt)}</span></div>
      ${r.remarks ? `<div class="info-row"><span class="ir-label">Remarks</span><span class="ir-value" style="color:#C0392B;">${r.remarks}</span></div>` : ''}
    `;

    // Show action buttons based on current status
    const actionsEl = document.getElementById('admin-review-actions');
    const remarksEl = document.getElementById('admin-remarks-group');

    if (r.status === 'pending' || r.status === 'reviewing') {
      actionsEl.innerHTML = `
        <button class="btn btn-success" onclick="Admin.initiateAction('approved')">✅ Approve</button>
        <button class="btn btn-danger"  onclick="Admin.initiateAction('rejected')">❌ Reject</button>
      `;
      if (remarksEl) remarksEl.style.display = 'none';
      document.getElementById('admin-remarks').value = '';
    } else if (r.status === 'approved') {
      actionsEl.innerHTML = `
        <button class="btn btn-primary" onclick="Admin.markReady('${r.id}')">📦 Mark as Ready</button>
        <button class="btn btn-secondary" onclick="Admin.generateCert('${r.id}')">🖨️ Generate Certificate</button>
      `;
      if (remarksEl) remarksEl.style.display = 'none';
    } else if (r.status === 'ready') {
      actionsEl.innerHTML = `
        <button class="btn btn-secondary" onclick="Admin.generateCert('${r.id}')">🖨️ Generate Certificate</button>
      `;
      if (remarksEl) remarksEl.style.display = 'none';
    } else if (r.status === 'rejected') {
      actionsEl.innerHTML = `
        <button class="btn btn-secondary" onclick="Admin.initiateAction('approved')">↩️ Re-approve</button>
      `;
      if (remarksEl) remarksEl.style.display = 'none';
    }

    App.navigate('screen-admin-review');
  },

  // ---- Initiate approve/reject (show remarks) ----
  initiateAction(action) {
    this._pendingAction = action;
    const remarksEl = document.getElementById('admin-remarks-group');
    if (!remarksEl) return;

    remarksEl.style.display = 'block';
    const confirmApprove = document.getElementById('confirm-approve-btn');
    const confirmReject  = document.getElementById('confirm-reject-btn');

    if (action === 'approved') {
      if (confirmApprove) confirmApprove.style.display = 'flex';
      if (confirmReject)  confirmReject.style.display  = 'none';
      document.getElementById('admin-remarks').placeholder = 'Add notes for approval (optional)…';
    } else {
      if (confirmApprove) confirmApprove.style.display = 'none';
      if (confirmReject)  confirmReject.style.display  = 'flex';
      document.getElementById('admin-remarks').placeholder = 'Reason for rejection (required)…';
    }
  },

  // ---- Confirm the action ----
  confirmAction(status) {
    const r = DB.getRequestById(this._currentReqId);
    if (!r) return;

    const remarks = document.getElementById('admin-remarks').value.trim();

    if (status === 'rejected' && !remarks) {
      App.toast('Please provide a reason for rejection.', 'error'); return;
    }

    const timeline = r.timeline || [{ step: 'Submitted', time: r.createdAt, done: true }];
    timeline.push({ step: status === 'approved' ? 'Approved' : 'Rejected', time: new Date().toISOString(), done: true });

    DB.updateRequest(this._currentReqId, { status, remarks, timeline });

    this.renderStats();
    this.renderRequests(this._filterStatus);

    const msg = status === 'approved' ? '✅ Request approved!' : '❌ Request rejected.';
    App.toast(msg, status === 'approved' ? 'success' : 'error');

    // Re-render the review screen
    this.reviewRequest(this._currentReqId);
  },

  // ---- Mark as Ready ----
  markReady(id) {
    const r = DB.getRequestById(id);
    if (!r) return;

    const timeline = r.timeline || [];
    timeline.push({ step: 'ready', time: new Date().toISOString(), done: true });

    DB.updateRequest(id, { status: 'ready', timeline });
    this.renderStats();
    this.renderRequests(this._filterStatus);
    App.toast('📦 Request marked as Ready!', 'success');
    this.reviewRequest(id);
  },

  // ---- Generate certificate ----
  generateCert(id) {
    const r = DB.getRequestById(id);
    if (!r) return;
    // Reuse resident's download function
    Resident.downloadCert(id);
  },

  // ---- Sign out (alias) ----
  signOut() {
    Auth.signOut();
  }
};
