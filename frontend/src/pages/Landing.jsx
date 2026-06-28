import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, LogOut, ShoppingBag } from 'lucide-react';
import './CustomerChat.css';

export default function Landing() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    const customer = JSON.parse(localStorage.getItem('customer') || '{}');
    if (token && customer.name) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="ai-page-container">
      {/* ── GRADIENT BLOBS ── */}
      <div className="bg-canvas" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
      </div>
      <div className="bg-overlay" aria-hidden="true" />

      {/* ── NAVBAR ── */}
      <header className={`premium-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-logo" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Akshaya Homely Foods Logo" className="header-logo-img" />
          Akshaya Homely Foods
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' }}>Home</Link>
          
          {!isLoggedIn ? (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LogIn size={15} /> Login
              </Link>
            </>
          ) : (
            <>
              <Link to="/my-orders" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingBag size={15} /> My Orders
              </Link>
              <Link to="/order-tracking" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Track Order
              </Link>
              <button onClick={handleLogout} className="new-chat-btn">
                <LogOut size={14} /> Logout
              </button>
            </>
          )}
        </nav>
      </header>

      {/* ── HERO CONTENT ── */}
      <main className="hero-container" style={{ paddingTop: '80px' }}>
        {/* Brand Logo */}
        <motion.div
          className="hero-logo-container"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src="/logo.png" alt="Akshaya Homely Foods Logo" className="hero-logo" style={{ height: '90px' }} />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Akshaya Homely Foods
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.65)', fontWeight: '400', maxWidth: '560px', margin: '0 0 2.5rem 0' }}
        >
          Order freshly prepared homemade pickles, sweets, and podis instantly with our AI assistant.
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {!isLoggedIn ? (
            <motion.button
              onClick={() => navigate('/login')}
              className="send-btn"
              whileHover={{ 
                scale: 1.06, 
                boxShadow: '0 0 35px rgba(239, 68, 68, 0.6)',
                background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)'
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              style={{
                width: 'auto',
                height: 'auto',
                padding: '1.1rem 2.5rem',
                fontSize: '1.1rem',
                fontWeight: '800',
                borderRadius: '1.25rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #ea580c 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 12px 30px rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              Get Started →
            </motion.button>
          ) : (
            <motion.button
              onClick={() => navigate('/chat')}
              className="send-btn"
              whileHover={{ 
                scale: 1.06, 
                boxShadow: '0 0 35px rgba(239, 68, 68, 0.6)',
                background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)'
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              style={{
                width: 'auto',
                height: 'auto',
                padding: '1.1rem 2.5rem',
                fontSize: '1.1rem',
                fontWeight: '800',
                borderRadius: '1.25rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #ea580c 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 12px 30px rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              Open AI Chat Assistant →
            </motion.button>
          )}
        </motion.div>
      </main>
    </div>
  );
}
