import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';

const C = {
  bg: '#F7F3EE',
  text: '#4B362F',
  softGray: '#999999',
  green: '#66806A',
  gold: '#D4AF37',
  copper: '#7B4B3A',
  dust: '#C7A19A',
  border: '#E4DDD6',
  inputBg: '#F0EBE4',
  white: '#FFFFFF',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      const profile = snap.data();
      if (profile?.isAdmin) return navigate('/admin/dashboard');
      if (profile?.role === 'freelancer') return navigate('/freelancer/dashboard');
      navigate('/client/dashboard');
    } catch (err: any) {
      const msg =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Incorrect email or password.'
          : err.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many attempts. Please try again later.'
          : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: C.inputBg,
    border: `0.5px solid ${C.border}`,
    borderRadius: 8,
    padding: '12px 14px',
    fontSize: 14,
    color: C.text,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.softGray, marginBottom: '3rem', textAlign: 'center' }}>MGNOVA</p>

        <div style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 16, padding: '2.5rem' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dust, marginBottom: '0.4rem' }}>Welcome back</p>
          <h1 style={{ fontSize: 24, fontWeight: 500, color: C.text, marginBottom: '2.5rem' }}>Sign in to your account</h1>

          {error && (
            <div style={{ background: '#fdf2f0', border: `0.5px solid ${C.dust}`, borderRadius: 8, padding: '10px 14px', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: 13, color: C.copper }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.softGray, marginBottom: 8 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex@studio.io"
                required
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.softGray }}>
                  Password
                </label>
                <a href="/forgot-password" style={{ fontSize: 11, color: C.softGray, textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ ...inputStyle, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: C.softGray }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? C.border : C.text,
                color: loading ? C.softGray : C.white,
                border: 'none',
                borderRadius: 8,
                padding: '13px 20px',
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'background 0.2s',
              }}
            >
              {loading ? (
                <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: C.softGray, marginTop: '1.5rem' }}>
          No account?{' '}
          <a href="/register" style={{ color: C.text, textDecoration: 'none', fontWeight: 500 }}>Sign up</a>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}