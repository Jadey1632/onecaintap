/* =============================================
   resident.js — Resident Flow Logic
============================================= */
const Resident = {

  _selectedCert: '',
  _deliveryMethod: 'pickup',
  _currentReqId: null,

  // ---- Load resident dashboard ----
  load() {
    const session = DB.getSession();
    if (!session) return;

    const nameEl = document.getElementById('resident-name');
    if (nameEl) nameEl.textContent = session.name;

    this._prefillForm(session);
    this.renderRecentRequests();
  },

  // ---- Pre-fill request form with user data ----
  _prefillForm(session) {
    const fn = document.getElementById('req-fullname');
    const addr = document.getElementById('req-addr');
    const dc = document.getElementById('req-delivery-contact');
    const da = document.getElementById('req-delivery-addr');
    if (fn) fn.value = session.name || '';
    if (addr) addr.value = session.address || '';
    if (dc) dc.value = session.contact || '';
    if (da) da.value = session.address || '';

    // Set min pickup date to tomorrow
    const pd = document.getElementById('req-pickup-date');
    if (pd) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      pd.min = tomorrow.toISOString().split('T')[0];
      pd.value = tomorrow.toISOString().split('T')[0];
    }
  },

  // ---- Select certificate type ----
  selectCert(type) {
    this._selectedCert = type;
    const titleEl = document.getElementById('req-form-title');
    if (titleEl) titleEl.textContent = type;
    const session = DB.getSession();
    if (session) this._prefillForm(session);
    App.navigate('screen-request-form');
  },

  // ---- Toggle delivery method ----
  selectDelivery(method) {
    this._deliveryMethod = method;
    const pickupBtn  = document.getElementById('opt-pickup');
    const deliveryBtn= document.getElementById('opt-delivery');
    const pickupDiv  = document.getElementById('pickup-details');
    const deliveryDiv= document.getElementById('delivery-details');

    if (method === 'pickup') {
      pickupBtn.classList.add('selected');
      deliveryBtn.classList.remove('selected');
      pickupDiv.style.display  = 'block';
      deliveryDiv.style.display= 'none';
    } else {
      deliveryBtn.classList.add('selected');
      pickupBtn.classList.remove('selected');
      deliveryDiv.style.display= 'block';
      pickupDiv.style.display  = 'none';
    }
  },

  // ---- Submit request ----
  submitRequest(e) {
    e.preventDefault();
    const session = DB.getSession();
    if (!session) { App.navigate('screen-signin'); return; }

    const purpose = document.getElementById('req-purpose').value;
    const otherPurpose = document.getElementById('req-purpose-other').value;

    const request = {
      id:           App.uid(),
      requestNum:   DB.nextRequestNum(),
      userId:       session.id,
      userName:     session.name,
      userEmail:    session.email,
      certType:     this._selectedCert,
      fullName:     document.getElementById('req-fullname').value.trim(),
      dob:          document.getElementById('req-dob').value,
      address:      document.getElementById('req-addr').value.trim(),
      purpose:      purpose === 'Other' ? otherPurpose : purpose,
      copies:       document.getElementById('req-copies').value,
      delivery:     this._deliveryMethod,
      pickupDate:   this._deliveryMethod === 'pickup' ? document.getElementById('req-pickup-date').value : null,
      pickupTime:   this._deliveryMethod === 'pickup' ? document.getElementById('req-pickup-time').value : null,
      deliveryAddr: this._deliveryMethod === 'delivery' ? document.getElementById('req-delivery-addr').value.trim() : null,
      deliveryContact: this._deliveryMethod === 'delivery' ? document.getElementById('req-delivery-contact').value.trim() : null,
      status:       'pending',
      remarks:      '',
      createdAt:    new Date().toISOString(),
      updatedAt:    new Date().toISOString(),
      timeline: [
        { step: 'Submitted', time: new Date().toISOString(), done: true }
      ]
    };

    DB.addRequest(request);

    // Update submission screen
    const numEl  = document.getElementById('submitted-reqnum');
    const certEl = document.getElementById('submitted-cert');
    if (numEl)  numEl.textContent  = request.requestNum;
    if (certEl) certEl.textContent = request.certType;

    // Reset form
    document.getElementById('form-request').reset();
    this.selectDelivery('pickup');

    App.navigate('screen-submitted');
    App.toast('Request submitted!', 'success');
    this.renderRecentRequests();
  },

  // ---- Render recent requests on dashboard ----
  renderRecentRequests() {
    const session = DB.getSession();
    if (!session) return;
    const container = document.getElementById('resident-recent-requests');
    if (!container) return;

    const requests = DB.getRequestsByUser(session.id).slice(0, 5);

    if (requests.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="es-icon">📭</div>
          <p>No requests yet.<br/>Start by requesting a certificate.</p>
          <button class="btn btn-primary btn-sm mt-8" onclick="App.navigate('screen-certificates')">Request Now</button>
        </div>`;
      return;
    }

    container.innerHTML = requests.map(r => `
      <div class="request-card" onclick="Resident.viewRequest('${r.id}')">
        <div class="req-icon">${App.certEmoji(r.certType)}</div>
        <div class="req-info">
          <div class="req-type">${r.certType}</div>
          <div class="req-date">${r.requestNum} · ${App.formatDate(r.createdAt)}</div>
        </div>
        ${App.statusBadge(r.status)}
      </div>`
    ).join('');
  },

  // ---- Show all requests (nav tab) ----
  showMyRequests() {
    const session = DB.getSession();
    if (!session) return;
    const trackList = document.getElementById('track-list');
    const requests = DB.getRequestsByUser(session.id);

    if (trackList) {
      if (requests.length === 0) {
        trackList.innerHTML = `
          <div class="empty-state">
            <div class="es-icon">🔍</div>
            <p>No requests found.</p>
          </div>`;
      } else {
        trackList.innerHTML = requests.map(r => `
          <div class="track-card" onclick="Resident.viewRequest('${r.id}')">
            <div class="track-num">${r.requestNum}</div>
            <div class="track-type">${r.certType}</div>
            <div class="track-status">${App.statusBadge(r.status)}</div>
            <div style="font-size:11px; color:var(--gray); margin-top:6px;">
              Submitted: ${App.formatDate(r.createdAt)}
              ${r.remarks ? `<br/>Remarks: ${r.remarks}` : ''}
            </div>
          </div>`
        ).join('');
      }
    }
    App.navigate('screen-track');
  },

  // ---- Nav tab handler ----
  navTab(tab, btn) {
    document.querySelectorAll('#screen-resident .nav-item').forEach(n => n.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (tab === 'requests' || tab === 'track') {
      this.showMyRequests();
    } else if (tab === 'home') {
      this.renderRecentRequests();
    }
  },

  // ---- View single request detail ----
  viewRequest(id) {
    this._currentReqId = id;
    const r = DB.getRequestById(id);
    if (!r) return;

    document.getElementById('detail-title').textContent = r.certType;
    document.getElementById('detail-reqnum').textContent = r.requestNum;

    const steps = this._buildTimeline(r);

    document.getElementById('detail-content').innerHTML = `
      <div class="info-row"><span class="ir-label">Request #</span><span class="ir-value">${r.requestNum}</span></div>
      <div class="info-row"><span class="ir-label">Type</span><span class="ir-value">${r.certType}</span></div>
      <div class="info-row"><span class="ir-label">Status</span><span class="ir-value">${App.statusBadge(r.status)}</span></div>
      <div class="info-row"><span class="ir-label">Submitted</span><span class="ir-value">${App.formatDateTime(r.createdAt)}</span></div>
      <div class="info-row"><span class="ir-label">Purpose</span><span class="ir-value">${r.purpose}</span></div>
      <div class="info-row"><span class="ir-label">Copies</span><span class="ir-value">${r.copies}</span></div>
      <div class="info-row"><span class="ir-label">Delivery</span><span class="ir-value">${r.delivery === 'pickup' ? '🏢 Pickup' : '🚚 Delivery'}</span></div>
      ${r.delivery === 'pickup' && r.pickupDate ? `<div class="info-row"><span class="ir-label">Pickup</span><span class="ir-value">${r.pickupDate} · ${r.pickupTime || ''}</span></div>` : ''}
      ${r.delivery === 'delivery' && r.deliveryAddr ? `<div class="info-row"><span class="ir-label">Deliver to</span><span class="ir-value">${r.deliveryAddr}</span></div>` : ''}
      ${r.remarks ? `<div class="info-row"><span class="ir-label">Remarks</span><span class="ir-value" style="color:#C0392B;">${r.remarks}</span></div>` : ''}

      <div class="divider"></div>
      <p class="section-title">Progress</p>
      <div class="progress-steps">${steps}</div>
    `;

    // Show download button if ready
    const actionsEl = document.getElementById('detail-actions');
    if (actionsEl) {
      actionsEl.innerHTML = r.status === 'ready'
        ? `<button class="btn btn-primary" onclick="Resident.downloadCert('${r.id}')">📥 Download Certificate</button>`
        : r.status === 'approved'
          ? `<button class="btn btn-secondary" onclick="Resident.downloadCert('${r.id}')">📄 View Certificate</button>`
          : '';
    }

    App.navigate('screen-req-detail');
  },

  // ---- Build progress timeline ----
  _buildTimeline(r) {
    const allSteps = [
      { key: 'submitted', label: 'Request Submitted', always: true },
      { key: 'reviewing', label: 'Under Review',      always: false },
      { key: 'approved',  label: 'Approved',          always: false },
      { key: 'rejected',  label: 'Rejected',          always: false },
      { key: 'ready',     label: 'Ready for Pickup / Delivery', always: false },
    ];

    const statusOrder = { pending: 1, reviewing: 2, approved: 3, rejected: 3, ready: 4 };
    const currentLevel = statusOrder[r.status] || 1;

    // Filter out rejected if not rejected, approved if rejected
    const steps = allSteps.filter(s => {
      if (s.key === 'rejected') return r.status === 'rejected';
      if (s.key === 'approved' && r.status === 'rejected') return false;
      if (s.key === 'ready' && r.status === 'rejected') return false;
      return true;
    });

    return steps.map((s, i) => {
      const stepLevel = statusOrder[s.key] || (i + 1);
      const isDone   = stepLevel < currentLevel || (s.key === r.status);
      const isActive = s.key === r.status || (s.key === 'submitted' && r.status === 'pending');
      const cls = isDone ? 'done' : isActive ? 'active' : '';
      const dot = isDone ? '✓' : isActive ? '●' : String(i + 1);
      const timeline = r.timeline ? r.timeline.find(t => t.step.toLowerCase().includes(s.key)) : null;
      const time = timeline ? App.formatDateTime(timeline.time) : (isDone ? App.formatDateTime(r.updatedAt) : '');
      return `
        <div class="progress-step ${cls}">
          <div class="step-dot">${dot}</div>
          <div class="step-info">
            <div class="step-label">${s.label}</div>
            ${time ? `<div class="step-time">${time}</div>` : ''}
          </div>
        </div>`;
    }).join('');
  },

  // ---- Download / View Certificate ----
  downloadCert(id) {
    const r = DB.getRequestById(id);
    if (!r) return;
    const session = DB.getSession();

    const win = window.open('', '_blank');
    const today = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <title>${r.certType} — ${r.requestNum}</title>
        <style>
          body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 20px; color: #000; }
          .header { text-align: center; border-bottom: 3px double #11139C; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { font-size: 14px; margin: 0; color: #11139C; }
          .header h2 { font-size: 12px; margin: 4px 0; color: #333; }
          .seal { width: 80px; height: 80px; border-radius: 50%; background: #EEF; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; color: #11139C; font-weight: bold; text-align: center; margin-bottom: 8px; border: 2px solid #11139C; }
          .cert-title { font-size: 22px; font-weight: bold; text-align: center; margin: 30px 0 10px; color: #11139C; text-transform: uppercase; letter-spacing: 2px; }
          .cert-num   { text-align: center; font-size: 13px; color: #666; margin-bottom: 30px; }
          .body-text  { font-size: 14px; line-height: 2; margin-bottom: 30px; text-align: justify; }
          .body-text strong { text-transform: uppercase; border-bottom: 1px solid #000; padding: 0 4px; }
          .footer     { margin-top: 60px; display: flex; justify-content: space-between; }
          .sig-block  { text-align: center; width: 220px; }
          .sig-line   { border-top: 1px solid #000; padding-top: 4px; font-size: 13px; font-weight: bold; }
          .sig-title  { font-size: 11px; color: #555; }
          .watermark  { text-align: center; font-size: 11px; color: #aaa; margin-top: 40px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="seal">CAINTA<br/>SEAL</div>
          <h1>Republic of the Philippines</h1>
          <h1>Province of Rizal</h1>
          <h2>MUNICIPALITY OF CAINTA</h2>
          <h2>Office of the Barangay</h2>
        </div>

        <div class="cert-title">${r.certType}</div>
        <div class="cert-num">Certificate No.: ${r.requestNum} &nbsp;|&nbsp; Date: ${today}</div>

        <div class="body-text">
          <p>TO WHOM IT MAY CONCERN:</p>
          <br/>
          <p>This is to certify that <strong>${r.fullName}</strong>, of legal age,
          residing at <strong>${r.address}</strong>, Cainta, Rizal, is a
          bonafide resident of this barangay.</p>
          <br/>
          <p>This certification is issued upon the request of the above-named person
          for the purpose of <strong>${r.purpose}</strong> and for whatever legal
          purpose it may serve.</p>
          <br/>
          <p>Issued this <strong>${today}</strong> at the Municipality of Cainta, Province of Rizal.</p>
        </div>

        <div class="footer">
          <div class="sig-block">
            <div class="sig-line">Barangay Captain</div>
            <div class="sig-title">Punong Barangay</div>
          </div>
          <div class="sig-block">
            <div class="sig-line">Barangay Secretary</div>
            <div class="sig-title">Barangay Secretary</div>
          </div>
        </div>

        <div class="watermark">
          <br/><br/>
          *** This is a computer-generated document. ***<br/>
          ONEcainTAP — Digital Barangay Service Management System
        </div>

        <br/>
        <div style="text-align:center;">
          <button onclick="window.print()" style="padding:10px 24px; background:#11139C; color:white; border:none; border-radius:8px; font-size:14px; cursor:pointer;">🖨️ Print Certificate</button>
        </div>
      </body>
      </html>`);
    win.document.close();
  },

  // ---- Announcements placeholder ----
  showAnnouncements() {
    App.toast('No new announcements at this time.');
  },

  // ---- Load track screen ----
  loadTrack() {
    this.showMyRequests();
  },

  // ---- Load profile screen ----
  loadProfile() {
    const session = DB.getSession();
    if (!session) return;
    const initial = session.name ? session.name.charAt(0).toUpperCase() : '?';
    document.getElementById('profile-avatar').textContent = initial;
    document.getElementById('profile-name-display').textContent = session.name;
    document.getElementById('profile-email-display').textContent = session.email;
    document.getElementById('pi-name').textContent = session.name;
    document.getElementById('pi-email').textContent = session.email;
    document.getElementById('pi-contact').textContent = session.contact || 'Not set';
    document.getElementById('pi-address').textContent = session.address || 'Not set';
  }
};
