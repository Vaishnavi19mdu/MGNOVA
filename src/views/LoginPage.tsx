import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      const profile = snap.data();

      if (profile?.isAdmin) return navigate('/admin/dashboard');
      if (profile?.role === 'freelancer') return navigate('/freelancer/dashboard');
      navigate('/client/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-ivory">
      <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-sm">
        <h1 className="text-2xl font-medium mb-8 text-coffee-satin">MGNOVA LOGIN</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-5">
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-coffee-satin" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-coffee-satin" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="w-full bg-coffee-satin text-warm-ivory py-3 rounded-lg text-sm font-bold tracking-widest" type="submit">LOGIN</button>
        </form>
        <p className="text-center text-sm text-soft-gray mt-6">No account? <a href="/register" className="text-coffee-satin font-medium">Sign up</a></p>
      </div>
    </div>
  );
}