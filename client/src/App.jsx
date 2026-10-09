import React, { useState, useEffect } from 'react';
import { SignInScreen } from './components/auth/SignInScreen';
import { SignUpScreen } from './components/auth/SignUpScreen';
import { ForgotPasswordScreen } from './components/auth/ForgotPasswordScreen';
import { VerifyCodeScreen } from './components/auth/VerifyCodeScreen';
import { ResetPasswordScreen } from './components/auth/ResetPasswordScreen';
import { ResidentDashboard } from './components/resident/ResidentDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DesktopNationalIdGate } from './components/DesktopNationalIdGate';

export function App() {
  const [authScreen, setAuthScreen] = useState('signin');
  const [resetEmail, setResetEmail] = useState('example@gmail.com');
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  const [isMobileDevice, setIsMobileDevice] = useState(() => {
    if (typeof window === 'undefined') return true;
    const isSmallScreen = window.innerWidth < 768;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isSmallScreen || isMobileUA;
  });
  const [simulatedMobile, setSimulatedMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 768;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobileDevice(isSmall || isMobileUA);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('onecaintap_user');
    const savedToken = localStorage.getItem('onecaintap_token');
    if (savedUser && savedToken) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {}
    }
  }, []);

  const handleLoginSuccess = (user, authToken) => {
    setCurrentUser(user);
    setToken(authToken);
    localStorage.setItem('onecaintap_user', JSON.stringify(user));
    localStorage.setItem('onecaintap_token', authToken);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('onecaintap_user');
    localStorage.removeItem('onecaintap_token');
    setAuthScreen('signin');
  };

  const handleSwitchToAdmin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@cainta.gov.ph', password: 'admin123' })
      });
      const data = await res.json();
      if (data.success) {
        handleLoginSuccess(data.user, data.token);
      }
    } catch (e) {}
  };

  const renderAuthContent = () => {
    switch (authScreen) {
      case 'signin':
        return (
          <SignInScreen
            onNavigate={setAuthScreen}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'signup':
        return (
          <SignUpScreen
            onNavigate={setAuthScreen}
            onRegisterSuccess={() => setAuthScreen('signin')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordScreen
            onNavigate={setAuthScreen}
            onCodeSent={(email) => {
              setResetEmail(email);
              setAuthScreen('verify-code');
            }}
          />
        );
      case 'verify-code':
        return (
          <VerifyCodeScreen
            email={resetEmail}
            onNavigate={setAuthScreen}
            onCodeVerified={() => setAuthScreen('reset-password')}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordScreen
            email={resetEmail}
            onNavigate={setAuthScreen}
          />
        );
      default:
        return (
          <SignInScreen
            onNavigate={setAuthScreen}
            onLoginSuccess={handleLoginSuccess}
          />
        );
    }
  };

  const renderLoggedInContent = () => {
    if (currentUser.role === 'admin' || currentUser.role === 'staff') {
      return (
        <AdminDashboard
          user={currentUser}
          onLogout={handleLogout}
        />
      );
    }
    return (
      <ResidentDashboard
        user={currentUser}
        onLogout={handleLogout}
        onSwitchToAdmin={handleSwitchToAdmin}
      />
    );
  };

  if (!isMobileDevice && !simulatedMobile) {
    return (
      <DesktopNationalIdGate
        onSimulateMobile={() => setSimulatedMobile(true)}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0B1C63] text-slate-100 flex flex-col font-sans max-w-md mx-auto shadow-2xl relative">
      <div className="flex-1 flex flex-col overflow-y-auto">
        {currentUser ? renderLoggedInContent() : renderAuthContent()}
      </div>
    </div>
  );
}

export default App;
