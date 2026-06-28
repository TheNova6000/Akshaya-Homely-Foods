import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LogIn, ArrowLeft } from 'lucide-react';
import './CustomerChat.css';

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = () => {
    let valid = true;
    setIdentifierError('');
    setPasswordError('');
    if (!identifier.trim()) {
      setIdentifierError('Please enter your Email, Mobile, or Username');
      valid = false;
    }
    if (!password.trim()) {
      setPasswordError('Please enter your password');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Login failed');

      if (result.role === 'admin') {
        // Admin user — store admin token and redirect to dashboard
        localStorage.setItem('admin_token', result.token);
        localStorage.setItem('admin', JSON.stringify(result.admin));
        toast.success(`Welcome back, ${result.admin.username}!`);
        navigate('/orders');
      } else if (result.role === 'customer') {
        // Customer user — store customer token and redirect to chat
        localStorage.setItem('customer_token', result.token);
        localStorage.setItem('customer', JSON.stringify(result.customer));
        localStorage.setItem('ahf_customer_name', result.customer.name);
        localStorage.setItem('ahf_customer_whatsapp', result.customer.whatsapp_number);
        toast.success(`Welcome back, ${result.customer.name}!`);
        navigate('/chat');
      } else {
        throw new Error('Unexpected response. Please try again.');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="ai-page-container flex-center"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}
    >
      {/* ── GRADIENT BLOBS ── */}
      <div className="bg-canvas" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="bg-overlay" aria-hidden="true" />

      {/* ── NAVBAR LOGO ── */}
      <div
        className="header-logo"
        style={{ position: 'absolute', top: '1.5rem', left: '2rem', cursor: 'pointer', zIndex: 100 }}
        onClick={() => navigate('/')}
      >
        <img src="/logo.png" alt="Akshaya Homely Foods Logo" className="header-logo-img" />
        Akshaya Homely Foods
      </div>

      {/* ── LOGIN CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.13)',
          borderRadius: '1.75rem',
          padding: '2.75rem 2.5rem',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
        }}
      >
        {/* Logo + Heading */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{ marginBottom: '2rem' }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            style={{ height: '60px', marginBottom: '1rem', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(239,68,68,0.35))' }}
          />
          <h1 style={{ fontSize: '1.55rem', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Welcome to Akshaya Homely Foods
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.5rem' }}>
            Sign in to access your account
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}
        >
          {/* Identifier Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label
              htmlFor="identifier"
              style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.03em' }}
            >
              Email / Mobile / Username
            </label>
            <input
              id="identifier"
              type="text"
              placeholder="e.g. kiran@gmail.com or admin"
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setIdentifierError(''); }}
              autoComplete="username"
              style={{
                background: identifierError ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.07)',
                border: identifierError ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.13)',
                borderRadius: '0.85rem',
                padding: '0.9rem 1rem',
                color: 'white',
                outline: 'none',
                fontSize: '0.9rem',
                transition: 'border 0.2s ease, background 0.2s ease',
                width: '100%',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.border = '1px solid rgba(239,68,68,0.5)'; }}
              onBlur={(e) => { e.target.style.border = identifierError ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.13)'; }}
            />
            {identifierError && (
              <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.1rem' }}>{identifierError}</span>
            )}
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label
              htmlFor="password"
              style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.03em' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
              autoComplete="current-password"
              style={{
                background: passwordError ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.07)',
                border: passwordError ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.13)',
                borderRadius: '0.85rem',
                padding: '0.9rem 1rem',
                color: 'white',
                outline: 'none',
                fontSize: '0.9rem',
                transition: 'border 0.2s ease, background 0.2s ease',
                width: '100%',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.border = '1px solid rgba(239,68,68,0.5)'; }}
              onBlur={(e) => { e.target.style.border = passwordError ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.13)'; }}
            />
            {passwordError && (
              <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.1rem' }}>{passwordError}</span>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.025, boxShadow: '0 0 30px rgba(239,68,68,0.5)' } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            style={{
              marginTop: '0.25rem',
              width: '100%',
              padding: '1rem',
              borderRadius: '0.9rem',
              background: loading
                ? 'rgba(239,68,68,0.4)'
                : 'linear-gradient(135deg, #ef4444 0%, #ea580c 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '700',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(239,68,68,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s ease',
            }}
          >
            {loading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }}
                />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Login
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          style={{ marginTop: '1.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}
        >
          New customer?{' '}
          <Link to="/signup" style={{ color: '#fb923c', fontWeight: '600', textDecoration: 'none' }}>
            Create an Account
          </Link>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          style={{ marginTop: '1rem' }}
        >
          <Link
            to="/"
            style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <ArrowLeft size={12} /> Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
