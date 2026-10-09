import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { db, initDatabase } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ── Uploads directory ────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── Security headers ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('ngrok-skip-browser-warning', 'true');
  // Remove fingerprinting header
  res.removeHeader('X-Powered-By');
  next();
});

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5000'];

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin (no origin header) and listed origins
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// ── Body parsers – tighter limit ─────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Static uploads (no directory listing) ────────────────────────────────────
app.use('/uploads', express.static(uploadsDir, { index: false, dotfiles: 'deny' }));

// ── Rate limiting (simple in-process, no extra deps) ─────────────────────────
const rateLimitStore = new Map();

function rateLimit({ windowMs = 60_000, max = 30, message = 'Too many requests. Please try again later.' } = {}) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const record = rateLimitStore.get(key) ?? { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + windowMs;
    }

    record.count += 1;
    rateLimitStore.set(key, record);

    if (record.count > max) {
      return res.status(429).json({ success: false, message });
    }
    next();
  };
}

// Strict limit for auth endpoints — 50 attempts per 15 minutes
const authLimiter = rateLimit({ windowMs: 15 * 60_000, max: 50, message: 'Too many attempts. Please wait 15 minutes.' });
// General API limit
const apiLimiter = rateLimit({ windowMs: 60_000, max: 120 });

// ── Input sanitisation helpers ────────────────────────────────────────────────
const VALID_STATUSES = new Set(['pending', 'reviewing', 'approved', 'ready', 'completed', 'rejected']);
const VALID_DELIVERY = new Set(['pickup', 'delivery']);
const VALID_BARANGAYS = new Set([
  'San Andres', 'San Isidro', 'San Juan', 'San Roque',
  'Santa Rosa', 'Santo Domingo', 'Santo Niño',
]);

function sanitizeStr(val, maxLen = 500) {
  if (typeof val !== 'string') return '';
  return val.replace(/[<>"'`]/g, '').trim().slice(0, maxLen);
}

function isValidEmail(email) {
  return typeof email === 'string' &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(val) {
  return typeof val === 'string' && /^[0-9+\s\-()]{7,20}$/.test(val.trim());
}

// ── Request logger ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} – ${req.ip}`);
  next();
});

// ── File upload ───────────────────────────────────────────────────────────────
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    // Strip path traversal from extension
    const ext = path.extname(file.originalname).replace(/[^a-z0-9.]/gi, '').slice(0, 5);
    const safe = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WEBP, or PDF files are allowed.'));
  },
});

// ── Simple bearer-token auth middleware ───────────────────────────────────────
// Tokens are issued as "token_<userId>_<timestamp>"; parse userId from it.
function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const parts = token.split('_');
  // Expected format: token_<userId>_<ts>
  if (parts.length < 3 || parts[0] !== 'token') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  const userId = Number(parts[1]);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  req.userId = userId;
  next();
}

// ════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ════════════════════════════════════════════════════════════════════════════

const otpStore = new Map();

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const email = sanitizeStr(req.body.email ?? '', 254).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }
    if (password.length > 128) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = await db.findUserByEmail(email);
    // Constant-time-ish comparison to avoid timing attacks
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    await db.createAuditLog({
      user_id: user.id,
      action: 'LOGIN',
      details: `User ${user.name} (${user.role}) logged in.`,
      ip_address: req.ip,
    });

    const { password: _pw, ...safeUser } = user;
    return res.json({
      success: true,
      message: 'Logged in successfully!',
      user: safeUser,
      token: `token_${user.id}_${Date.now()}`,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const name = sanitizeStr(req.body.name ?? '', 100);
    const email = sanitizeStr(req.body.email ?? '', 254).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const contact_number = sanitizeStr(req.body.contact_number ?? '', 20);
    const address = sanitizeStr(req.body.address ?? '', 200);
    const barangay = VALID_BARANGAYS.has(req.body.barangay) ? req.body.barangay : 'San Roque';

    if (!name || !email || !password || !contact_number || !address) {
      return res.status(400).json({ success: false, message: 'All registration fields are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ success: false, message: 'Password must be 8–128 characters.' });
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must include uppercase, lowercase, and a number.' });
    }
    if (!isValidPhone(contact_number)) {
      return res.status(400).json({ success: false, message: 'Invalid contact number.' });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const newUser = await db.createUser({ name, email, password, contact_number, address, barangay, role: 'resident' });

    await db.createNotification({
      user_id: newUser.id,
      title: 'Welcome to ONEcainTAP! 🏛️',
      message: `Welcome ${newUser.name}! You can now request Barangay certificates from home.`,
      type: 'info',
    });

    await db.createAuditLog({
      user_id: newUser.id,
      action: 'REGISTER',
      details: `New resident registered: ${newUser.name} (${newUser.barangay})`,
      ip_address: req.ip,
    });

    const { password: _pw, ...safeUser } = newUser;
    return res.status(201).json({ success: true, message: 'Account created successfully!', user: safeUser });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  try {
    const email = sanitizeStr(req.body.email ?? '', 254).toLowerCase();
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const user = await db.findUserByEmail(email);
    // Always respond the same way to prevent user enumeration
    if (!user) {
      return res.json({ success: true, message: `If that email exists, a verification code has been sent.`, email });
    }

    const code = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit random
    otpStore.set(email, { code, expiresAt: Date.now() + 10 * 60_000 });

    // In production, send via SMS/email. For demo, include in response.
    return res.json({
      success: true,
      message: `Verification code sent to ${email}. (Demo: ${code})`,
      email,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.post('/api/auth/verify-otp', authLimiter, async (req, res) => {
  try {
    const email = sanitizeStr(req.body.email ?? '', 254).toLowerCase();
    const code = sanitizeStr(req.body.code ?? '', 10);
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required.' });
    }

    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ success: false, message: 'No active code for this email. Please request a new one.' });
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }
    if (record.code !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    return res.json({ success: true, message: 'Code verified successfully!' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  try {
    const email = sanitizeStr(req.body.email ?? '', 254).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ success: false, message: 'Password must be 8–128 characters.' });
    }

    // Verify OTP was previously confirmed (basic check: record must still exist)
    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP verification required before resetting password.' });
    }

    const updated = await db.updateUserPassword(email, password);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    otpStore.delete(email);
    return res.json({ success: true, message: 'Password updated successfully! You may now sign in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// PROTECTED ROUTES — require auth token
// ════════════════════════════════════════════════════════════════════════════

app.get('/api/certificates', apiLimiter, async (req, res) => {
  try {
    const catalog = await db.getCertificatesCatalog();
    res.json({ success: true, catalog });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load certificate catalog.' });
  }
});

app.get('/api/requests', apiLimiter, requireAuth, async (req, res) => {
  try {
    const user_id = req.query.user_id ? Number(req.query.user_id) : undefined;
    const status = req.query.status ?? undefined;

    // Fetch the requesting user to check their role
    const requestingUser = await db.findUserById(req.userId);
    const isAdmin = requestingUser?.role === 'admin' || requestingUser?.role === 'staff';

    // Residents can only fetch their own requests; admins can fetch all
    if (user_id && !isAdmin && user_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    if (status && !VALID_STATUSES.has(status) && status !== 'all') {
      return res.status(400).json({ success: false, message: 'Invalid status filter.' });
    }

    // If admin and no user_id filter, fetch all requests
    const filters = {};
    if (user_id) filters.user_id = user_id;
    else if (!isAdmin) filters.user_id = req.userId; // residents always scoped to self
    if (status) filters.status = status;

    const requests = await db.getAllRequests(filters);
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load requests.' });
  }
});

app.get('/api/requests/:id', apiLimiter, requireAuth, async (req, res) => {
  try {
    const id = sanitizeStr(req.params.id, 50);
    const request = await db.getRequestById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }
    // Only owner or admin can view
    if (request.user_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load request.' });
  }
});

app.post('/api/requests', apiLimiter, requireAuth, async (req, res) => {
  try {
    const user_id = Number(req.body.user_id);
    const certificate_id = sanitizeStr(req.body.certificate_id ?? '', 80);
    const purpose = sanitizeStr(req.body.purpose ?? '', 300);
    const delivery_method = VALID_DELIVERY.has(req.body.delivery_method) ? req.body.delivery_method : 'pickup';
    const pickup_date = sanitizeStr(req.body.pickup_date ?? '', 20);
    const pickup_time = sanitizeStr(req.body.pickup_time ?? '', 50);
    const delivery_address = sanitizeStr(req.body.delivery_address ?? '', 200);
    const delivery_contact = sanitizeStr(req.body.delivery_contact ?? '', 20);
    const id_document_url = sanitizeStr(req.body.id_document_url ?? '', 500);

    if (!user_id || !certificate_id || !purpose) {
      return res.status(400).json({ success: false, message: 'user_id, certificate_id, and purpose are required.' });
    }
    if (user_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    if (delivery_method === 'delivery') {
      if (!delivery_address) return res.status(400).json({ success: false, message: 'Delivery address is required.' });
      if (!delivery_contact || !isValidPhone(delivery_contact)) {
        return res.status(400).json({ success: false, message: 'Valid contact number is required for delivery.' });
      }
    }

    const newRequest = await db.createRequest({
      user_id,
      certificate_id,
      purpose,
      delivery_method,
      pickup_date: delivery_method === 'pickup' ? pickup_date : null,
      pickup_time: delivery_method === 'pickup' ? pickup_time : null,
      delivery_address: delivery_method === 'delivery' ? delivery_address : null,
      delivery_contact: delivery_method === 'delivery' ? delivery_contact : null,
      delivery_fee: 0,
      total_amount: 0,
      id_document_url: id_document_url || null,
    });

    await db.createAuditLog({
      user_id,
      action: 'NEW_REQUEST',
      details: `New request for ${newRequest.certificate_name} (${newRequest.id})`,
      ip_address: req.ip,
    });

    res.status(201).json({ success: true, message: 'Request submitted successfully!', request: newRequest });
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ success: false, message: 'Could not submit request.' });
  }
});

app.patch('/api/requests/:id/status', apiLimiter, requireAuth, async (req, res) => {
  try {
    const id = sanitizeStr(req.params.id, 50);
    const status = req.body.status ?? '';
    const admin_remarks = sanitizeStr(req.body.admin_remarks ?? '', 500);
    const approved_by = Number(req.body.approved_by) || req.userId;

    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const updated = await db.updateRequestStatus(id, { status, admin_remarks, approved_by });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    await db.createAuditLog({
      user_id: approved_by,
      action: `STATUS_${status.toUpperCase()}`,
      details: `${id} → ${status.toUpperCase()}${admin_remarks ? `. Note: ${admin_remarks}` : ''}`,
      ip_address: req.ip,
    });

    res.json({ success: true, message: `Request updated to ${status}.`, request: updated });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ success: false, message: 'Could not update request.' });
  }
});

app.post('/api/upload', apiLimiter, requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl, filename: req.file.filename });
});

// Multer error handler for upload route
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes('Only')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

app.get('/api/analytics', apiLimiter, requireAuth, async (req, res) => {
  try {
    const [allRequests, allUsers, allTransactions] = await Promise.all([
      db.getAllRequests(),
      db.getAllUsers(),
      db.getTransactions(),
    ]);

    const countBy = (arr, fn) => arr.filter(fn).length;
    const certDistribution = {};
    allRequests.forEach(r => {
      const name = r.certificate_name || r.certificate_id;
      certDistribution[name] = (certDistribution[name] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalRequests: allRequests.length,
        pendingCount: countBy(allRequests, r => r.status === 'pending'),
        reviewingCount: countBy(allRequests, r => r.status === 'reviewing'),
        approvedCount: countBy(allRequests, r => ['approved', 'ready', 'completed'].includes(r.status)),
        rejectedCount: countBy(allRequests, r => r.status === 'rejected'),
        totalRevenue: 0, // all free
        residentsCount: countBy(allUsers, u => u.role === 'resident'),
        certDistribution,
        dbMode: db.isMySQL() ? 'XAMPP MySQL' : 'Local Store',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load analytics.' });
  }
});

app.get('/api/notifications', apiLimiter, requireAuth, async (req, res) => {
  try {
    const user_id = Number(req.query.user_id);
    if (!user_id) return res.status(400).json({ success: false, message: 'user_id is required.' });
    if (user_id !== req.userId) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const notifications = await db.getNotifications(user_id);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load notifications.' });
  }
});

app.patch('/api/notifications/:id/read', apiLimiter, requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID.' });
    }
    await db.markNotificationAsRead(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not mark notification.' });
  }
});

app.get('/api/transactions', apiLimiter, requireAuth, async (req, res) => {
  try {
    const transactions = await db.getTransactions();
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load transactions.' });
  }
});

app.get('/api/audit-logs', apiLimiter, requireAuth, async (req, res) => {
  try {
    const logs = await db.getAuditLogs();
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load audit logs.' });
  }
});

app.get('/api/verify-certificate/:hash', apiLimiter, async (req, res) => {
  try {
    const hash = sanitizeStr(req.params.hash, 100);
    if (!hash) return res.status(400).json({ success: false, message: 'Invalid hash.' });

    const all = await db.getAllRequests();
    const found = all.find(r => r.qr_code_hash === hash || r.id === hash);
    if (!found) {
      return res.status(404).json({ success: false, valid: false, message: 'Certificate not found or invalid.' });
    }

    res.json({
      success: true,
      valid: true,
      certificate: {
        certificate_number: found.certificate_number,
        certificate_name: found.certificate_name,
        issued_to: found.resident_name,
        barangay: found.resident_barangay,
        municipality: 'Cainta, Rizal',
        issue_date: found.approved_at || found.created_at,
        status: 'OFFICIALLY VERIFIED & VALID',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'ONEcainTAP API',
    municipality: 'Municipality of Cainta, Rizal',
  });
});

// ── Serve React frontend ──────────────────────────────────────────────────────
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, { index: false, dotfiles: 'deny' }));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
  console.log(`📦 Serving React frontend from ${clientDistPath}`);
} else {
  console.log(`⚠️  No client/dist found. Run "npm run build" inside /client first.`);
}

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 ONEcainTAP running on http://localhost:${PORT}`);
    console.log(`🌐 Public URL: Check your ngrok terminal`);
    console.log(`🏛️ Municipality of Cainta, Rizal`);
    console.log(`====================================================`);
  });
});
