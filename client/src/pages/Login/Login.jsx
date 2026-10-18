import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';

import { itineraryService } from '../../services/itineraryService';

export const Login = () => {
  const { login, loginWithGoogle, isMock, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handlePostLogin = async (u) => {
    if (u) {
      const savedPending = await itineraryService.processPendingItinerary(u.uid);
      if (savedPending) {
        navigate('/dashboard/itineraries');
        return;
      }
    }
    navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const u = await login(email, password);
      await handlePostLogin(u);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid credentials. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (selectedEmail) => {
    setError('');
    setLoading(true);
    try {
      const u = await login(selectedEmail, 'password123');
      await handlePostLogin(u);
    } catch (err) {
      setError('Mock login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const u = await loginWithGoogle();
      await handlePostLogin(u);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        backgroundImage: `url('/images/hero-bg-1.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      { }
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          background: 'linear-gradient(135deg, rgba(15,43,40,0.75) 0%, rgba(5,30,25,0.80) 100%)',
        }}
      />

      { }
      <div
        className="max-w-md w-full rounded-3xl p-8 text-left relative z-10"
        style={{
          background: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.20)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.40)',
        }}
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-full overflow-hidden mb-3 border-2 border-teal-400/30 shadow-lg shadow-teal-900/30">
            <img src="/images/dinagat-seal.png" alt="Province of Dinagat Islands" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Sign In to Your Account</h2>
          <p className="text-[11px] text-teal-200/70 mt-1 font-semibold">Welcome back! Access your bookings and itinerary logs.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-900/40 border border-rose-400/30 rounded-2xl text-xs text-rose-200 font-semibold flex items-start space-x-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-teal-200/80 uppercase tracking-wider block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-white/40 pointer-events-none" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none w-full font-semibold text-white placeholder-white/30"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-teal-200/80 uppercase tracking-wider block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-white/40 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-xs rounded-xl pl-10 pr-10 py-3 focus:outline-none w-full font-semibold text-white placeholder-white/30"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-3 text-white/40 hover:text-white/80 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold rounded-2xl shadow-lg shadow-teal-900/40 transition-colors disabled:opacity-40"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center space-x-2.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.83 21.56,11.43 21.35,11.1z" fill="#4285F4" />
              <path d="M12,20.73c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.58c-0.92,0.62 -2.1,0.98 -3.38,0.98 -2.42,0 -4.47,-1.64 -5.2,-3.84H2.66v2.66C4.15,18.73 7.82,20.73 12,20.73z" fill="#34A853" />
              <path d="M6.8,13.09C6.6,12.49 6.5,11.87 6.5,11.23c0,-0.64 0.1,-1.26 0.3,-1.86V6.7H2.66c-0.65,1.3 -1.02,2.77 -1.02,4.32s0.37,3.02 1.02,4.32L6.8,13.09z" fill="#FBBC05" />
              <path d="M12,5.2c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.47,2.5 14.43,1.73 12,1.73c-4.18,0 -7.85,2 -9.34,4.97l3.84,2.66C7.23,6.84 9.28,5.2 12,5.2z" fill="#EA4335" />
            </g>
          </svg>
          <span>Continue with Google</span>
        </button>

        <p className="mt-6 text-center text-xs text-white/50">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-300 hover:text-white hover:underline font-bold transition-colors">
            Create an Account
          </Link>
        </p>

        {/* Quick Logins (Mock Mode Only) */}
        {
          isMock && (
            <div className="mt-8 pt-6 border-t text-left" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center space-x-1.5 mb-3">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>Developer Quick Logins (Mock Simulator)</span>
              </span>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleQuickLogin('tourist@dinagat.com')}
                  className="w-full p-2.5 rounded-xl text-[10px] font-bold flex justify-between items-center transition-colors text-teal-200 hover:text-white"
                  style={{ background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)' }}
                >
                  <span>Tourist (Jane Doe)</span>
                  <span className="opacity-60">tourist@dinagat.com</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('operator@dinagat.com')}
                  className="w-full p-2.5 rounded-xl text-[10px] font-bold flex justify-between items-center transition-colors text-rose-200 hover:text-white"
                  style={{ background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.25)' }}
                >
                  <span>Tour Agency (Isla Tour Agency)</span>
                  <span className="opacity-60">operator@dinagat.com</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('admin@dinagat.com')}
                  className="w-full p-2.5 rounded-xl text-[10px] font-bold flex justify-between items-center transition-colors text-amber-200 hover:text-white"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
                >
                  <span>System Administrator</span>
                  <span className="opacity-60">admin@dinagat.com</span>
                </button>
              </div>
            </div>
          )
        }
      </div >
    </div >
  );
};

export default Login;
