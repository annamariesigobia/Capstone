import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, Mail, ShieldCheck, RefreshCw } from 'lucide-react';
import { generateAndSendOTP, verifyOTP } from '../../services/emailService';

export const Register = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('tourist');
  const [address, setAddress] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // OTP flow states
  const [otpStep, setOtpStep] = useState('email'); // 'email' | 'verify' | 'done'
  const [otpEmail, setOtpEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Dev mode: store generated OTP for display (since EmailJS not fully configured)
  const [devOtp, setDevOtp] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ─── Start cooldown timer ─── */
  const startCooldown = (secs = 60) => {
    setResendCooldown(secs);
    const iv = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(iv); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  /* ─── Send / Resend OTP ─── */
  const handleSendOTP = async () => {
    if (!otpEmail.trim()) { setError('Please enter your Gmail address.'); return; }
    if (!otpEmail.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (!agreedToTerms) { setError('You must agree to the Terms & Conditions first.'); return; }
    if (role === 'operator' && !address.trim()) { setError('Please enter your agency address.'); return; }

    setError('');
    setOtpSending(true);
    try {
      const code = await generateAndSendOTP(otpEmail.trim(), 'User');
      // In dev/mock mode, show the OTP on screen since EmailJS isn't wired
      setDevOtp(code);
      setOtpStep('verify');
      startCooldown(60);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  /* ─── Verify OTP ─── */
  const handleVerifyOTP = () => {
    setError('');
    const result = verifyOTP(otpEmail.trim(), otpInput.trim());
    if (result.valid) {
      setOtpVerified(true);
      setOtpStep('done');
    } else {
      setError(result.reason);
    }
  };

  /* ─── Final Google Sign-In ─── */
  const handleGoogleSignIn = async () => {
    if (!otpVerified) { setError('Please verify your OTP first.'); return; }
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(role, address.trim());
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Glassmorphism style ─── */
  const glassInput = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        backgroundImage: `url('/images/hero-bg-2.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          background: 'linear-gradient(135deg, rgba(15,43,40,0.75) 0%, rgba(5,30,25,0.80) 100%)',
        }}
      />

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
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="mx-auto w-14 h-14 rounded-full overflow-hidden mb-3 border-2 border-teal-400/30 shadow-lg shadow-teal-900/30">
            <img src="/images/dinagat-seal.png" alt="Province of Dinagat Islands" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Create a New Account</h2>
          <p className="text-[11px] text-teal-200/70 mt-1 font-semibold">Join the Dinagat Islands centralized booking system.</p>
        </div>

        {/* OTP progress steps */}
        <div className="flex items-center gap-1.5 mb-6">
          {['Role & Email', 'Verify OTP', 'Register'].map((label, i) => {
            const stepNum = i; // 0=email, 1=verify, 2=done
            const current = otpStep === 'email' ? 0 : otpStep === 'verify' ? 1 : 2;
            return (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider ${current >= stepNum ? 'text-teal-300' : 'text-white/30'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 ${
                    current > stepNum ? 'bg-teal-500 text-white' : current === stepNum ? 'bg-teal-400/40 border border-teal-400 text-teal-300' : 'bg-white/10 text-white/30 border border-white/15'
                  }`}>{current > stepNum ? '✓' : i + 1}</div>
                  <span className="hidden sm:block">{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px ${current > stepNum ? 'bg-teal-500' : 'bg-white/15'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-900/40 border border-rose-400/30 rounded-2xl text-xs text-rose-200 font-semibold flex items-start space-x-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-5">

          {/* ── STEP 1: Role & Email + Send OTP ── */}
          {(otpStep === 'email' || otpStep === 'verify' || otpStep === 'done') && (
            <>
              {/* Role selector */}
              <div>
                <label className="text-[10px] font-bold text-teal-200/80 uppercase tracking-wider block mb-2">Register As</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('tourist')}
                    disabled={otpStep !== 'email'}
                    className={`flex-grow py-3 text-xs font-bold rounded-xl border transition-all ${role === 'tourist'
                        ? 'bg-teal-500 text-white border-teal-400 shadow-lg shadow-teal-900/40'
                        : 'text-white/70 border-white/15'
                      } disabled:opacity-60`}
                    style={role !== 'tourist' ? { background: 'rgba(255,255,255,0.07)' } : {}}
                  >
                    Tourist / Traveler
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('operator')}
                    disabled={otpStep !== 'email'}
                    className={`flex-grow py-3 text-xs font-bold rounded-xl border transition-all ${role === 'operator'
                        ? 'bg-teal-500 text-white border-teal-400 shadow-lg shadow-teal-900/40'
                        : 'text-white/70 border-white/15'
                      } disabled:opacity-60`}
                    style={role !== 'operator' ? { background: 'rgba(255,255,255,0.07)' } : {}}
                  >
                    Tour Agency
                  </button>
                </div>
              </div>

              {/* Agency address */}
              {role === 'operator' && (
                <div>
                  <label className="text-[10px] font-bold text-teal-200/80 uppercase tracking-wider block mb-1">Agency Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Loreto, Dinagat Islands"
                    value={address}
                    disabled={otpStep !== 'email'}
                    onChange={(e) => setAddress(e.target.value)}
                    className="text-xs rounded-xl px-4 py-3 focus:outline-none w-full font-semibold text-white placeholder-white/30 disabled:opacity-60"
                    style={glassInput}
                  />
                </div>
              )}

              {/* Pending notice */}
              {role === 'operator' && (
                <div className="p-3 rounded-xl text-[10px] font-semibold" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fde68a' }}>
                  ⚠️ Tour Agency accounts require <strong>Admin approval</strong> before activation.
                </div>
              )}

              {/* Gmail input */}
              <div>
                <label className="text-[10px] font-bold text-teal-200/80 uppercase tracking-wider block mb-1">Your Gmail Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-teal-300/60 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={otpEmail}
                    disabled={otpStep !== 'email'}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && otpStep === 'email' && handleSendOTP()}
                    className="text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none w-full font-semibold text-white placeholder-white/30 disabled:opacity-60"
                    style={glassInput}
                  />
                </div>
                {otpStep !== 'email' && (
                  <p className="mt-1 text-[9px] text-teal-300 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> OTP sent to {otpEmail}
                  </p>
                )}
              </div>

              {/* Terms */}
              {otpStep === 'email' && (
                <div className="flex items-start space-x-2.5">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 cursor-pointer accent-teal-500 shrink-0"
                  />
                  <label htmlFor="terms-checkbox" className="text-[10px] text-white/60 font-semibold leading-relaxed cursor-pointer select-none">
                    I agree to the{' '}
                    <button type="button" onClick={() => setShowTermsModal(true)} className="text-teal-300 hover:text-white underline underline-offset-2 font-bold transition-colors">
                      Terms & Conditions
                    </button>{' '}and{' '}
                    <button type="button" onClick={() => setShowTermsModal(true)} className="text-teal-300 hover:text-white underline underline-offset-2 font-bold transition-colors">
                      Privacy Policy
                    </button>{' '}of Dinagat Islands.
                  </label>
                </div>
              )}

              {/* Send OTP button */}
              {otpStep === 'email' && (
                <button
                  type="button"
                  disabled={otpSending || !agreedToTerms || !otpEmail.trim()}
                  onClick={handleSendOTP}
                  className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl border border-teal-500 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  <Mail className="h-4 w-4" />
                  <span>{otpSending ? 'Sending OTP...' : 'Send OTP to Gmail'}</span>
                </button>
              )}
            </>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {otpStep === 'verify' && (
            <>
              {/* Dev mode OTP display */}
              {devOtp && (
                <div className="p-3 rounded-xl text-[10px] font-bold text-center" style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.4)', color: '#5eead4' }}>
                  🔐 <strong>Dev Mode OTP:</strong> {devOtp}
                  <div className="text-[9px] opacity-70 mt-0.5">This shows because EmailJS is not fully configured. In production, it will be sent to your Gmail.</div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-teal-200/80 uppercase tracking-wider block mb-1">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="_ _ _ _ _ _"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                  className="text-xl text-center tracking-[0.5em] rounded-xl px-4 py-4 focus:outline-none w-full font-black text-white placeholder-white/20"
                  style={glassInput}
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={otpInput.length !== 6}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Verify OTP</span>
              </button>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40 font-semibold">Didn't receive it?</span>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={resendCooldown > 0 || otpSending}
                  className="text-[10px] text-teal-300 hover:text-white font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setOtpStep('email'); setOtpInput(''); setError(''); setDevOtp(''); }}
                className="w-full text-[10px] text-white/40 hover:text-white/70 font-semibold transition-colors"
              >
                ← Change email or role
              </button>
            </>
          )}

          {/* ── STEP 3: OTP Verified — Continue with Google ── */}
          {otpStep === 'done' && (
            <>
              <div className="p-4 rounded-2xl text-xs font-bold text-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#6ee7b7' }}>
                <ShieldCheck className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
                Email <strong>{otpEmail}</strong> has been verified!<br />
                <span className="text-[10px] opacity-70">Now sign in with your Google account to complete registration.</span>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl border border-teal-500 transition-all flex items-center justify-center space-x-2.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28-0.96,2.37-2.04,3.1v2.58h3.3c1.93-1.78,3.04-4.4,3.04-7.4C21.68,11.83,21.56,11.43,21.35,11.1z" fill="#4285F4" />
                    <path d="M12,20.73c2.43,0,4.47-0.8,5.96-2.2l-3.3-2.58c-0.92,0.62-2.1,0.98-3.38,0.98-2.42,0-4.47-1.64-5.2-3.84H2.66v2.66C4.15,18.73,7.82,20.73,12,20.73z" fill="#34A853" />
                    <path d="M6.8,13.09C6.6,12.49,6.5,11.87,6.5,11.23c0-0.64,0.1-1.26,0.3-1.86V6.7H2.66c-0.65,1.3-1.02,2.77-1.02,4.32s0.37,3.02,1.02,4.32L6.8,13.09z" fill="#FBBC05" />
                    <path d="M12,5.2c1.32,0,2.5,0.45,3.44,1.35l2.58-2.58C16.47,2.5,14.43,1.73,12,1.73c-4.18,0-7.85,2-9.34,4.97l3.84,2.66C7.23,6.84,9.28,5.2,12,5.2z" fill="#EA4335" />
                  </g>
                </svg>
                <span>{loading ? 'Creating account...' : 'Continue with Google'}</span>
              </button>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-300 hover:text-white hover:underline font-bold transition-colors">
            Sign In
          </Link>
        </p>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="max-w-lg w-full rounded-3xl p-6 relative max-h-[80vh] overflow-y-auto"
            style={{
              background: 'rgba(15,30,28,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.50)',
            }}
          >
            <h3 className="text-lg font-extrabold text-white mb-1">Terms & Conditions</h3>
            <p className="text-[10px] text-teal-200/60 font-semibold mb-4">Dinagat Islands — Last Updated: July 2026</p>

            <div className="space-y-4 text-[11px] text-white/70 font-medium leading-relaxed">
              <div>
                <h4 className="text-xs font-bold text-teal-300 mb-1">1. Acceptance of Terms</h4>
                <p>By creating an account and using this platform, you agree to abide by these Terms & Conditions. If you do not agree, please do not register.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-teal-300 mb-1">2. User Accounts</h4>
                <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete registration information.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-teal-300 mb-1">3. Booking & Payment</h4>
                <p>All accommodation bookings are subject to availability and tour agency confirmation. Payment proofs must be legitimate.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-teal-300 mb-1">4. Privacy & Data Protection</h4>
                <p>We collect and store your personal data (name, email, phone number) solely for the purpose of providing tourism services, in compliance with the Data Privacy Act of 2012 (RA 10173).</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-teal-300 mb-1">5. Tour Agency Responsibilities</h4>
                <p>Tour agencies must provide accurate property listings, pricing, and availability. Misrepresentation may lead to account revocation.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-teal-300 mb-1">6. Limitation of Liability</h4>
                <p>The Dinagat Islands platform acts as an intermediary. We are not liable for disputes between tourists and tour agencies.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-teal-300 mb-1">7. Modifications</h4>
                <p>We reserve the right to update these terms at any time. Continued use constitutes acceptance.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setAgreedToTerms(true); setShowTermsModal(false); }}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl shadow-md transition-colors"
              >
                I Agree
              </button>
              <button
                onClick={() => setShowTermsModal(false)}
                className="flex-1 py-3 text-white/60 text-xs font-bold rounded-2xl transition-colors hover:text-white"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
