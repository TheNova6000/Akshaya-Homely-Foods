import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft } from 'lucide-react';
import './CustomerChat.css';

const signupSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  whatsapp_number: z.string()
    .min(10, 'Mobile number must be at least 10 digits')
    .regex(/^\d+$/, 'Mobile number must contain digits only'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function CustomerSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/customer/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          whatsapp_number: data.whatsapp_number,
          email: data.email,
          password: data.password
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Signup failed');

      toast.success(result.message || 'Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page-container flex-center" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
      {/* ── GRADIENT BLOBS ── */}
      <div className="bg-canvas" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="bg-overlay" aria-hidden="true" />

      <div className="header-logo" style={{ position: 'absolute', top: '1.5rem', left: '2rem', cursor: 'pointer', zIndex: 100 }} onClick={() => navigate('/')}>
        <img src="/logo.png" alt="Akshaya Homely Foods Logo" className="header-logo-img" />
        Akshaya Homely Foods
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '1.5rem',
          padding: '2.25rem',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          marginTop: '60px',
          marginBottom: '20px'
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <img src="/logo.png" alt="Branding" style={{ height: '52px', marginBottom: '0.5rem', objectFit: 'contain' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white', margin: 0 }}>Create Account</h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem' }}>Join us to order delicious traditional homemade food</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label className="form-label" htmlFor="name" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', fontWeight: '600' }}>Full Name</label>
            <input
              type="text"
              id="name"
              placeholder="e.g. Kiran Kumar"
              className="form-input"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                color: 'white',
                outline: 'none',
                fontSize: '0.88rem'
              }}
              {...register('name')}
            />
            {errors.name && <span className="form-error" style={{ color: '#f87171', fontSize: '0.72rem' }}>{errors.name.message}</span>}
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label className="form-label" htmlFor="whatsapp_number" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', fontWeight: '600' }}>Mobile / WhatsApp Number</label>
            <input
              type="tel"
              id="whatsapp_number"
              placeholder="e.g. 919876543210"
              className="form-input"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                color: 'white',
                outline: 'none',
                fontSize: '0.88rem'
              }}
              {...register('whatsapp_number')}
            />
            {errors.whatsapp_number && <span className="form-error" style={{ color: '#f87171', fontSize: '0.72rem' }}>{errors.whatsapp_number.message}</span>}
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label className="form-label" htmlFor="email" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', fontWeight: '600' }}>Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="e.g. kiran@gmail.com"
              className="form-input"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                color: 'white',
                outline: 'none',
                fontSize: '0.88rem'
              }}
              {...register('email')}
            />
            {errors.email && <span className="form-error" style={{ color: '#f87171', fontSize: '0.72rem' }}>{errors.email.message}</span>}
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label className="form-label" htmlFor="password" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', fontWeight: '600' }}>Password</label>
            <input
              type="password"
              id="password"
              placeholder="Min 6 characters"
              className="form-input"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                color: 'white',
                outline: 'none',
                fontSize: '0.88rem'
              }}
              {...register('password')}
            />
            {errors.password && <span className="form-error" style={{ color: '#f87171', fontSize: '0.72rem' }}>{errors.password.message}</span>}
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label className="form-label" htmlFor="confirmPassword" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', fontWeight: '600' }}>Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Re-enter password"
              className="form-input"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                color: 'white',
                outline: 'none',
                fontSize: '0.88rem'
              }}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && <span className="form-error" style={{ color: '#f87171', fontSize: '0.72rem' }}>{errors.confirmPassword.message}</span>}
          </div>

          <button
            type="submit"
            className="send-btn"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              height: 'auto',
              padding: '0.8rem',
              borderRadius: '0.75rem',
              background: 'var(--brand-gradient)',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: '700',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {loading ? 'Creating account...' : <><UserPlus size={16} /> Sign Up</>}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.825rem', color: 'rgba(255,255,255,0.5)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#fb923c', fontWeight: '600', textDecoration: 'none' }}>
            Login
          </Link>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={12} /> Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
