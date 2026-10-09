account/* =============================================
   auth.js — Authentication Logic
============================================= */
const Auth = {

  _forgotEmail: '',
  _otpCode: '',
  _otpInterval: null,

  // ---- Show Sign In tab ----
  showSignIn() {
    App.navigate('screen-signin');
  },

  // ---- Toggle password visibility ----
  togglePwd(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = `<svg width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    } else {
      input.type = 'password';
      btn.innerHTML = `<svg width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
    }
  },

  // ---- Sign In ----
  signIn(e) {
    e.preventDefault();
    const email    = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    // Clear errors
    document.getElementById('signin-email-err').classList.remove('show');
    document.getElementById('signin-pass-err').classList.remove('show');

    const user = DB.getUserByEmail(email);
    if (!user) {
      this._showErr('signin-email-err', 'No account found with this email.');
      return;
    }
    if (user.password !== password) {
      this._showErr('signin-pass-err', 'Incorrect password.');
      return;
    }

    DB.setSession(user);

    if (user.role === 'admin') {
      Admin.load();
      App.navigate('screen-admin');
    } else {
      Resident.load();
      App.navigate('screen-resident');
    }
    App.toast('Welcome back, ' + user.name.split(' ')[0] + '!', 'success');
  },

  // ---- Demo Admin Sign In ----
  signInAdmin() {
    const admin = DB.getUserByEmail('admin@cainta.gov.ph');
    if (admin) {
      DB.setSession(admin);
      Admin.load();
      App.navigate('screen-admin');
      App.toast('Signed in as Admin', 'success');
    }
  },

  // ---- Register ----
  register(e) {
    e.preventDefault();
    const name    = document.getElementById('reg-name').value.trim();
    const address = document.getElementById('reg-address').value.trim();
    const contact = document.getElementById('reg-contact').value.trim();
    const email   = document.getElementById('reg-email').value.trim();
    const password= document.getElementById('reg-password').value;

    // Clear errors
    ['reg-name-err','reg-email-err','reg-contact-err','reg-pass-err']
      .forEach(id => document.getElementById(id).classList.remove('show'));

    if (name.length < 2) {
      this._showErr('reg-name-err', 'Please enter your full name.'); return;
    }
    if (!this._validEmail(email)) {
      this._showErr('reg-email-err', 'Please enter a valid email.'); return;
    }
    if (DB.getUserByEmail(email)) {
      this._showErr('reg-email-err', 'An account with this email already exists.'); return;
    }
    if (!contact.match(/^(\+63|0)[0-9]{9,10}$/)) {
      this._showErr('reg-contact-err', 'Please enter a valid PH phone number.'); return;
    }
    if (password.length < 6) {
      this._showErr('reg-pass-err', 'Password must be at least 6 characters.'); return;
    }

    const user = {
      id: 'user-' + App.uid(),
      name, address, contact, email, password,
      role: 'resident',
      createdAt: new Date().toISOString()
    };

    DB.addUser(user);
    DB.setSession(user);
    Resident.load();
    App.navigate('screen-resident');
    App.toast('Account created! Welcome, ' + name.split(' ')[0] + '!', 'success');
  },

  // ---- Forgot Password ----
  forgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();
    document.getElementById('forgot-err').classList.remove('show');

    if (!this._validEmail(email)) {
      this._showErr('forgot-err', 'Please enter a valid email.'); return;
    }

    const user = DB.getUserByEmail(email);
    if (!user) {
      this._showErr('forgot-err', 'No account found with this email.'); return;
    }

    // Generate mock OTP
    this._forgotEmail = email;
    this._otpCode = String(Math.floor(1000 + Math.random() * 9000));

    // Show OTP in toast (simulating email delivery)
    App.toast(`Demo OTP: ${this._otpCode} (simulated)`, '', 6000);

    // Update verify screen
    const disp = document.getElementById('verify-email-display');
    if (disp) disp.textContent = email;

    App.navigate('screen-verify');
    this._startOtpTimer(34);
  },

  // ---- Verify OTP ----
  verifyCode(e) {
    e.preventDefault();
    const code = [0,1,2,3].map(i => document.getElementById(`otp-${i}`).value).join('');
    if (code.length < 4) {
      App.toast('Please enter all 4 digits.', 'error'); return;
    }
    if (code !== this._otpCode) {
      App.toast('Incorrect code. Please try again.', 'error'); return;
    }

    const newPwd = document.getElementById('new-password').value;
    if (!newPwd || newPwd.length < 6) {
      App.toast('Password must be at least 6 characters.', 'error'); return;
    }

    // Update user password
    const user = DB.getUserByEmail(this._forgotEmail);
    if (user) {
      DB.updateUser(user.id, { password: newPwd });
      clearInterval(this._otpInterval);
      App.toast('Password updated! Please sign in.', 'success');
      [0,1,2,3].forEach(i => document.getElementById(`otp-${i}`).value = '');
      document.getElementById('new-password').value = '';
      App.navigate('screen-signin');
    }
  },

  // ---- OTP Next Input ----
  otpNext(input, idx) {
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value && idx < 3) {
      document.getElementById(`otp-${idx + 1}`).focus();
    }
  },

  // ---- Resend Code ----
  resendCode() {
    this._otpCode = String(Math.floor(1000 + Math.random() * 9000));
    App.toast(`New OTP: ${this._otpCode} (simulated)`, '', 5000);
    this._startOtpTimer(34);
  },

  // ---- OTP Countdown ----
  _startOtpTimer(seconds) {
    clearInterval(this._otpInterval);
    let s = seconds;
    const el = document.getElementById('otp-timer');
    const btn = document.getElementById('resend-btn');
    if (btn) btn.style.pointerEvents = 'none';

    this._otpInterval = setInterval(() => {
      s--;
      const m = String(Math.floor(s / 60)).padStart(2, '0');
      const sec = String(s % 60).padStart(2, '0');
      if (el) el.textContent = ` ${m}:${sec}`;
      if (s <= 0) {
        clearInterval(this._otpInterval);
        if (el) el.textContent = '';
        if (btn) btn.style.pointerEvents = 'auto';
      }
    }, 1000);
  },

  // ---- Sign Out ----
  signOut() {
    DB.clearSession();
    App._history = [];
    App.navigate('screen-signin');
    App.toast('Signed out successfully.');
  },

  // ---- Helpers ----
  _showErr(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.add('show'); }
  },
  _validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
};
