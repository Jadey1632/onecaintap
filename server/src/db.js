import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Seed data ─────────────────────────────────────────────────────────────────
// Passwords are intentionally weak demo values — in production these must be
// bcrypt hashes. The plaintext values are only kept here so the local JSON
// fallback store works without a hashing library dependency.
// IMPORTANT: change these before any real deployment.
const initialData = {
  users: [
    {
      id: 1,
      name: 'Hon. Maria Elena Nieto',
      email: 'admin@cainta.gov.ph',
      password: 'Admin@2026!',          // demo only — hash in production
      contact_number: '+63 917 888 1234',
      address: 'Cainta Municipal Hall, Cainta, Rizal',
      barangay: 'San Roque',
      role: 'admin',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Barangay Staff Officer',
      email: 'staff@cainta.gov.ph',
      password: 'Staff@2026!',          // demo only
      contact_number: '+63 918 555 4321',
      address: 'Barangay Hall, San Andres, Cainta, Rizal',
      barangay: 'San Andres',
      role: 'staff',
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Juan dela Cruz',
      email: 'juan.delacruz@gmail.com',
      password: 'Resident@2026!',       // demo only
      contact_number: '+63 920 456 6881',
      address: '10th St. Batumbakal, Cainta, Rizal',
      barangay: 'San Roque',
      role: 'resident',
      created_at: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'Maria Santos',
      email: 'maria.santos@gmail.com',
      password: 'Resident@2026!',       // demo only
      contact_number: '+63 928 111 2233',
      address: 'Block 5 Lot 12 Karangalan Village, Cainta, Rizal',
      barangay: 'Santo Domingo',
      role: 'resident',
      created_at: new Date().toISOString(),
    },
  ],
  certificates_catalog: [
    {
      id: 'barangay_clearance',
      name: 'Barangay Clearance',
      description: 'Official document certifying good moral character and residency. Required for employment, police clearance, and postal ID.',
      fee: 0.00,
      processing_time: '1-2 Business Days',
      requirements: '1 Valid Government-Issued ID, Proof of Residency (Utility Bill or Lease Agreement)',
      icon: 'ShieldCheck',
      is_active: 1,
    },
    {
      id: 'certificate_of_residency',
      name: 'Certificate of Residency',
      description: 'Proof of actual residence in Cainta for government transactions, court appearances, banks, and utility applications.',
      fee: 0.00,
      processing_time: '1 Business Day',
      requirements: '1 Valid ID with local address or Barangay Voter Certification',
      icon: 'Home',
      is_active: 1,
    },
    {
      id: 'certificate_of_indigency',
      name: 'Certificate of Indigency',
      description: 'Issued to low-income residents for medical assistance (DSWD/PCSO), legal aid, scholarships, or funeral assistance.',
      fee: 0.00,
      processing_time: 'Same Day / 24 Hours',
      requirements: 'Letter stating specific purpose, Certificate of Low Income',
      icon: 'HeartHandshake',
      is_active: 1,
    },
    {
      id: 'barangay_certification',
      name: 'Barangay Certification',
      description: 'General official certification for legal or business requirements, lost documents, or utility connections.',
      fee: 0.00,
      processing_time: '1-2 Business Days',
      requirements: '1 Valid ID, Supporting Documents depending on purpose',
      icon: 'FileCheck',
      is_active: 1,
    },
    {
      id: 'barangay_id',
      name: 'Barangay Resident ID Card',
      description: 'Official laminated photo ID recognized across Cainta establishments and local government transactions.',
      fee: 0.00,
      processing_time: '2-3 Business Days',
      requirements: '1 Valid Photo ID, Proof of 6-month minimum residency',
      icon: 'CreditCard',
      is_active: 1,
    },
    {
      id: 'business_clearance',
      name: 'Barangay Business Clearance',
      description: "Mandatory clearance to secure a Mayor's Business Permit for retail shops, sari-sari stores, and commercial offices.",
      fee: 0.00,
      processing_time: '2-3 Business Days',
      requirements: 'DTI or SEC Registration, Contract of Lease or Land Title, Previous Year Business Permit',
      icon: 'Briefcase',
      is_active: 1,
    },
    {
      id: 'first_time_jobseeker',
      name: 'First Time Jobseeker Certificate (RA 11261)',
      description: 'Issued to first-time job applicants exempting them from government document fees under RA 11261.',
      fee: 0.00,
      processing_time: '1 Business Day',
      requirements: 'Barangay Oath of Undertaking, Valid School ID or Birth Certificate',
      icon: 'GraduationCap',
      is_active: 1,
    },
  ],
  requests: [
    {
      id: 'REQ-2026-0001',
      user_id: 3,
      certificate_id: 'barangay_clearance',
      purpose: 'Local Employment Application',
      delivery_method: 'pickup',
      pickup_date: '2026-10-06',
      pickup_time: '09:00 AM - 11:00 AM',
      delivery_address: null,
      delivery_contact: null,
      delivery_fee: 0.00,
      total_amount: 0.00,
      payment_method: 'none',
      payment_status: 'free',
      payment_ref: null,
      id_document_url: null,
      proof_of_residency_url: null,
      status: 'approved',
      admin_remarks: 'Verified complete and clean record. Issued by Cainta LGU.',
      approved_by: 1,
      approved_at: new Date(Date.now() - 86400000).toISOString(),
      certificate_number: 'BC-CAIN-2026-0012',
      qr_code_hash: 'CAIN-BC-2026-JUAN-DELACRUZ-VERIFIED',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'REQ-2026-0002',
      user_id: 3,
      certificate_id: 'certificate_of_residency',
      purpose: 'Bank Account Opening',
      delivery_method: 'pickup',
      pickup_date: '2026-10-08',
      pickup_time: '01:00 PM - 03:00 PM',
      delivery_address: null,
      delivery_contact: null,
      delivery_fee: 0,
      total_amount: 0.00,
      payment_method: 'none',
      payment_status: 'free',
      payment_ref: null,
      id_document_url: null,
      proof_of_residency_url: null,
      status: 'pending',
      admin_remarks: null,
      approved_by: null,
      approved_at: null,
      certificate_number: null,
      qr_code_hash: null,
      created_at: new Date(Date.now() - 14400000).toISOString(),
      updated_at: new Date(Date.now() - 14400000).toISOString(),
    },
  ],
  transactions: [],
  notifications: [
    {
      id: 1,
      user_id: 3,
      title: 'Clearance Approved! 🎉',
      message: 'Your Barangay Clearance (REQ-2026-0001) has been approved. Your official e-certificate is ready for download.',
      type: 'success',
      is_read: 0,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 2,
      user_id: 3,
      title: 'Request Received',
      message: 'Your Certificate of Residency request (REQ-2026-0002) was submitted and is queued for verification.',
      type: 'info',
      is_read: 1,
      created_at: new Date(Date.now() - 14400000).toISOString(),
    },
  ],
  audit_logs: [
    {
      id: 1,
      user_id: 1,
      action: 'APPROVAL',
      details: 'Approved REQ-2026-0001 (Barangay Clearance)',
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
};

// ── Local JSON store helpers ───────────────────────────────────────────────────
const dataFilePath = path.join(__dirname, '..', 'data_store.json');

function loadLocalStore() {
  if (fs.existsSync(dataFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    } catch {
      console.warn('Could not parse local store — reinitialising defaults.');
    }
  }
  saveLocalStore(initialData);
  return initialData;
}

function saveLocalStore(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save data store:', e.message);
  }
}

// ── Connection state ───────────────────────────────────────────────────────────
let store = loadLocalStore();
let mysqlPool = null;
let useMySQL = false;

// ── Init ───────────────────────────────────────────────────────────────────────
export async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'onecaintap_db';

  try {
    // Test connection before creating the pool
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.end();

    mysqlPool = mysql.createPool({
      host, port, user, password, database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // Prevent long-running queries from hanging the process
      connectTimeout: 10000,
    });

    await mysqlPool.query('SELECT 1');
    useMySQL = true;
    console.log('✅ Connected to XAMPP MySQL (onecaintap_db)');
    await ensureMySQLTables(database);
  } catch (err) {
    console.log(`⚠️  MySQL not available (${err.message}) — using local JSON store.`);
    useMySQL = false;
  }
}

async function ensureMySQLTables(database) {
  if (!mysqlPool) return;
  const sqlPath = path.join(__dirname, '..', '..', 'database', 'onecaintap_db.sql');
  if (!fs.existsSync(sqlPath)) return;

  try {
    const [tables] = await mysqlPool.query("SHOW TABLES LIKE 'users'");
    if (tables.length > 0) return; // already seeded

    console.log('🌱 Seeding MySQL schema…');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const statements = sql
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    for (const stmt of statements) {
      await mysqlPool.query(stmt);
    }
    console.log('✨ MySQL schema seeded successfully.');
  } catch (e) {
    console.warn('Table creation note:', e.message);
  }
}

// ── Input guard helpers ────────────────────────────────────────────────────────
function safeStr(val, max = 500) {
  if (val === null || val === undefined) return null;
  return String(val).replace(/[<>"'`]/g, '').trim().slice(0, max);
}

function safeInt(val) {
  const n = Number(val);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ── DB interface ───────────────────────────────────────────────────────────────
export const db = {
  isMySQL() { return useMySQL; },

  // ── Users ──────────────────────────────────────────────────────────────────
  async findUserByEmail(email) {
    const safe = safeStr(email, 254)?.toLowerCase();
    if (!safe) return null;

    if (useMySQL && mysqlPool) {
      // Parameterised query — no injection risk
      const [rows] = await mysqlPool.query('SELECT * FROM users WHERE email = ?', [safe]);
      return rows[0] ?? null;
    }
    store = loadLocalStore();
    return store.users.find(u => u.email.toLowerCase() === safe) ?? null;
  },

  async findUserById(id) {
    const safeId = safeInt(id);
    if (!safeId) return null;

    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query('SELECT * FROM users WHERE id = ?', [safeId]);
      return rows[0] ?? null;
    }
    store = loadLocalStore();
    return store.users.find(u => u.id === safeId) ?? null;
  },

  async createUser({ name, email, password, contact_number, address, barangay = 'San Roque', role = 'resident' }) {
    const safeName    = safeStr(name, 100);
    const safeEmail   = safeStr(email, 254)?.toLowerCase();
    const safeContact = safeStr(contact_number, 20);
    const safeAddress = safeStr(address, 200);
    const safeBrgy    = safeStr(barangay, 50);

    if (!safeName || !safeEmail || !password) throw new Error('Required user fields missing.');

    if (useMySQL && mysqlPool) {
      const [result] = await mysqlPool.query(
        'INSERT INTO users (name, email, password, contact_number, address, barangay, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [safeName, safeEmail, password, safeContact, safeAddress, safeBrgy, role]
      );
      return this.findUserById(result.insertId);
    }

    store = loadLocalStore();
    const newUser = {
      id: store.users.length ? Math.max(...store.users.map(u => u.id)) + 1 : 1,
      name: safeName,
      email: safeEmail,
      password,
      contact_number: safeContact,
      address: safeAddress,
      barangay: safeBrgy,
      role,
      created_at: new Date().toISOString(),
    };
    store.users.push(newUser);
    saveLocalStore(store);
    return newUser;
  },

  async updateUserPassword(email, newPassword) {
    const safe = safeStr(email, 254)?.toLowerCase();
    if (!safe || !newPassword || newPassword.length > 128) return false;

    if (useMySQL && mysqlPool) {
      const [result] = await mysqlPool.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, safe]);
      return result.affectedRows > 0;
    }
    store = loadLocalStore();
    const user = store.users.find(u => u.email.toLowerCase() === safe);
    if (!user) return false;
    user.password = newPassword;
    saveLocalStore(store);
    return true;
  },

  async getAllUsers() {
    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query(
        'SELECT id, name, email, contact_number, address, barangay, role, created_at FROM users ORDER BY id DESC'
      );
      return rows;
    }
    store = loadLocalStore();
    // Never return passwords
    return store.users.map(({ password: _pw, ...u }) => u);
  },

  // ── Certificates ──────────────────────────────────────────────────────────
  async getCertificatesCatalog() {
    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query('SELECT * FROM certificates_catalog WHERE is_active = 1');
      return rows;
    }
    store = loadLocalStore();
    return (store.certificates_catalog ?? []).filter(c => c.is_active);
  },

  // ── Requests ──────────────────────────────────────────────────────────────
  async getAllRequests(filters = {}) {
    if (useMySQL && mysqlPool) {
      const conditions = [];
      const params = [];

      if (filters.user_id) {
        conditions.push('r.user_id = ?');
        params.push(safeInt(filters.user_id));
      }
      if (filters.status && filters.status !== 'all') {
        conditions.push('r.status = ?');
        params.push(safeStr(filters.status, 20));
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const query = `
        SELECT r.*,
               u.name  AS resident_name,
               u.email AS resident_email,
               u.contact_number AS resident_contact,
               u.address        AS resident_address,
               u.barangay       AS resident_barangay,
               c.name AS certificate_name,
               c.fee  AS cert_fee
        FROM requests r
        JOIN users u ON r.user_id = u.id
        JOIN certificates_catalog c ON r.certificate_id = c.id
        ${where}
        ORDER BY r.created_at DESC
      `;
      const [rows] = await mysqlPool.query(query, params);
      return rows;
    }

    store = loadLocalStore();
    let list = (store.requests ?? []).map(r => {
      const u = store.users.find(usr => usr.id === r.user_id) ?? {};
      const c = store.certificates_catalog.find(cat => cat.id === r.certificate_id) ?? {};
      return {
        ...r,
        resident_name:    u.name    ?? 'Unknown Resident',
        resident_email:   u.email   ?? '',
        resident_contact: u.contact_number ?? '',
        resident_address: u.address ?? '',
        resident_barangay: u.barangay ?? 'San Roque',
        certificate_name: c.name ?? r.certificate_id,
        cert_fee:         c.fee  ?? 0,
      };
    });

    if (filters.user_id) list = list.filter(r => r.user_id === safeInt(filters.user_id));
    if (filters.status && filters.status !== 'all') list = list.filter(r => r.status === filters.status);

    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getRequestById(id) {
    const safeId = safeStr(id, 50);
    if (!safeId) return null;
    const list = await this.getAllRequests();
    return list.find(r => r.id === safeId) ?? null;
  },

  async createRequest(data) {
    const newId   = `REQ-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const catalog = await this.getCertificatesCatalog();
    const cert    = catalog.find(c => c.id === data.certificate_id);

    const newReq = {
      id:                  newId,
      user_id:             safeInt(data.user_id),
      certificate_id:      safeStr(data.certificate_id, 80),
      purpose:             safeStr(data.purpose, 300),
      custom_fields:       data.custom_fields ? JSON.stringify(data.custom_fields) : null,
      delivery_method:     safeStr(data.delivery_method, 20) ?? 'pickup',
      pickup_date:         safeStr(data.pickup_date, 20)     ?? null,
      pickup_time:         safeStr(data.pickup_time, 50)     ?? null,
      delivery_address:    safeStr(data.delivery_address, 200) ?? null,
      delivery_contact:    safeStr(data.delivery_contact, 20)  ?? null,
      delivery_fee:        0,
      total_amount:        0,
      payment_method:      'none',
      payment_status:      'free',
      payment_ref:         null,
      id_document_url:     safeStr(data.id_document_url, 500) ?? null,
      proof_of_residency_url: null,
      status:              'pending',
      admin_remarks:       null,
      approved_by:         null,
      approved_at:         null,
      certificate_number:  null,
      qr_code_hash:        null,
      created_at:          new Date().toISOString(),
      updated_at:          new Date().toISOString(),
    };

    if (useMySQL && mysqlPool) {
      await mysqlPool.query(
        `INSERT INTO requests
         (id, user_id, certificate_id, purpose, custom_fields,
          delivery_method, pickup_date, pickup_time,
          delivery_address, delivery_contact,
          delivery_fee, total_amount, payment_method, payment_status, payment_ref,
          id_document_url, proof_of_residency_url, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          newReq.id, newReq.user_id, newReq.certificate_id, newReq.purpose, newReq.custom_fields,
          newReq.delivery_method, newReq.pickup_date, newReq.pickup_time,
          newReq.delivery_address, newReq.delivery_contact,
          0, 0, 'none', 'free', null,
          newReq.id_document_url, null, 'pending',
        ]
      );
    } else {
      store = loadLocalStore();
      store.requests.unshift(newReq);
      saveLocalStore(store);
    }

    await this.createNotification({
      user_id: newReq.user_id,
      title:   'Request Submitted 📋',
      message: `Your request (${newReq.id}) has been submitted and is queued for barangay verification.`,
      type:    'info',
    });

    return this.getRequestById(newReq.id);
  },

  async updateRequestStatus(id, { status, admin_remarks, approved_by }) {
    const safeId      = safeStr(id, 50);
    const safeStatus  = safeStr(status, 20);
    const safeRemarks = safeStr(admin_remarks, 500);
    const safeBy      = safeInt(approved_by);

    const certNum   = ['approved', 'ready'].includes(safeStatus)
      ? `BC-CAIN-2026-${String(Math.floor(1000 + Math.random() * 9000))}`
      : null;
    const qrHash    = certNum ? `CAIN-VERIFIED-${safeId}-${Date.now()}` : null;
    const approvedAt = certNum ? new Date().toISOString() : null;

    if (useMySQL && mysqlPool) {
      await mysqlPool.query(
        `UPDATE requests
         SET status = ?, admin_remarks = ?, approved_by = ?,
             certificate_number = COALESCE(?, certificate_number),
             qr_code_hash       = COALESCE(?, qr_code_hash),
             approved_at        = COALESCE(?, approved_at),
             updated_at         = NOW()
         WHERE id = ?`,
        [safeStatus, safeRemarks ?? null, safeBy ?? null, certNum, qrHash, approvedAt, safeId]
      );
    } else {
      store = loadLocalStore();
      const req = store.requests.find(r => r.id === safeId);
      if (req) {
        req.status = safeStatus;
        if (safeRemarks !== null) req.admin_remarks = safeRemarks;
        if (safeBy) req.approved_by = safeBy;
        if (certNum && !req.certificate_number) req.certificate_number = certNum;
        if (qrHash  && !req.qr_code_hash)       req.qr_code_hash = qrHash;
        if (approvedAt && !req.approved_at)      req.approved_at = approvedAt;
        req.updated_at = new Date().toISOString();
        saveLocalStore(store);
      }
    }

    const updated = await this.getRequestById(safeId);
    if (updated) {
      let title = 'Status Update';
      let message = `Your request (${safeId}) is now: ${safeStatus.toUpperCase()}.`;
      let type = 'info';

      if (['approved', 'ready'].includes(safeStatus)) {
        title   = 'Certificate Approved! 🎉';
        message = `Your ${updated.certificate_name} (${safeId}) has been approved and your e-certificate is ready.`;
        type    = 'success';
      } else if (safeStatus === 'rejected') {
        title   = 'Action Required ⚠️';
        message = `Your request (${safeId}) was rejected: "${safeRemarks || 'Requirements incomplete'}". Please resubmit.`;
        type    = 'warning';
      }

      await this.createNotification({ user_id: updated.user_id, title, message, type });
    }

    return updated;
  },

  // ── Transactions ───────────────────────────────────────────────────────────
  async getTransactions() {
    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query(`
        SELECT t.*, u.name AS resident_name, r.certificate_id
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        JOIN requests r ON t.request_id = r.id
        ORDER BY t.created_at DESC
      `);
      return rows;
    }
    store = loadLocalStore();
    return (store.transactions ?? []).map(t => {
      const u = store.users.find(usr => usr.id === t.user_id) ?? {};
      const r = store.requests.find(req => req.id === t.request_id) ?? {};
      return { ...t, resident_name: u.name ?? 'Unknown', certificate_id: r.certificate_id ?? '' };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async createTransaction({ request_id, user_id, amount, payment_method, payment_status, or_number }) {
    const id = `TXN-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    if (useMySQL && mysqlPool) {
      await mysqlPool.query(
        'INSERT INTO transactions (id, request_id, user_id, amount, payment_method, payment_status, or_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, safeStr(request_id, 50), safeInt(user_id), Number(amount) || 0,
         safeStr(payment_method, 30), safeStr(payment_status, 30), safeStr(or_number, 50)]
      );
    } else {
      store = loadLocalStore();
      store.transactions.unshift({
        id,
        request_id: safeStr(request_id, 50),
        user_id:    safeInt(user_id),
        amount:     Number(amount) || 0,
        payment_method:  safeStr(payment_method, 30),
        payment_status:  safeStr(payment_status, 30),
        or_number:       safeStr(or_number, 50),
        created_at: new Date().toISOString(),
      });
      saveLocalStore(store);
    }
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  async getNotifications(userId) {
    const safeId = safeInt(userId);
    if (!safeId) return [];

    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
        [safeId]
      );
      return rows;
    }
    store = loadLocalStore();
    return (store.notifications ?? [])
      .filter(n => n.user_id === safeId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50);
  },

  async markNotificationAsRead(id) {
    const safeId = safeInt(id);
    if (!safeId) return;

    if (useMySQL && mysqlPool) {
      await mysqlPool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [safeId]);
    } else {
      store = loadLocalStore();
      const n = store.notifications.find(item => item.id === safeId);
      if (n) { n.is_read = 1; saveLocalStore(store); }
    }
  },

  async createNotification({ user_id, title, message, type = 'info' }) {
    const safeId  = safeInt(user_id);
    const safeTitle   = safeStr(title, 200);
    const safeMessage = safeStr(message, 1000);
    const safeType    = safeStr(type, 20);
    if (!safeId || !safeTitle) return;

    if (useMySQL && mysqlPool) {
      await mysqlPool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [safeId, safeTitle, safeMessage, safeType]
      );
    } else {
      store = loadLocalStore();
      store.notifications.unshift({
        id: store.notifications.length
          ? Math.max(...store.notifications.map(n => n.id)) + 1 : 1,
        user_id:    safeId,
        title:      safeTitle,
        message:    safeMessage,
        type:       safeType,
        is_read:    0,
        created_at: new Date().toISOString(),
      });
      saveLocalStore(store);
    }
  },

  // ── Audit logs ─────────────────────────────────────────────────────────────
  async createAuditLog({ user_id, action, details, ip_address = '127.0.0.1' }) {
    const safeUserId  = safeInt(user_id);
    const safeAction  = safeStr(action,  50);
    const safeDetails = safeStr(details, 500);
    const safeIp      = safeStr(ip_address, 45);

    if (useMySQL && mysqlPool) {
      await mysqlPool.query(
        'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
        [safeUserId ?? null, safeAction, safeDetails, safeIp]
      );
    } else {
      store = loadLocalStore();
      store.audit_logs.unshift({
        id: store.audit_logs.length
          ? Math.max(...store.audit_logs.map(a => a.id)) + 1 : 1,
        user_id:    safeUserId ?? null,
        action:     safeAction,
        details:    safeDetails,
        ip_address: safeIp,
        created_at: new Date().toISOString(),
      });
      saveLocalStore(store);
    }
  },

  async getAuditLogs() {
    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query(`
        SELECT a.*, u.name AS user_name, u.role AS user_role
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 100
      `);
      return rows;
    }
    store = loadLocalStore();
    return (store.audit_logs ?? [])
      .map(a => {
        const u = store.users.find(usr => usr.id === a.user_id) ?? {};
        return { ...a, user_name: u.name ?? 'System', user_role: u.role ?? 'system' };
      })
      .slice(0, 100);
  },
};
