import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Topbar({ title }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const adminJson = localStorage.getItem('admin');
  const admin = adminJson ? JSON.parse(adminJson) : null;
  const username = admin ? admin.username : 'Admin';

  const performLogout = () => {
    // Clear all auth tokens and state
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer');

    // Clear React Query cache
    queryClient.clear();

    // Show success toast
    toast.success('Logged out successfully', { icon: '👋', duration: 2500 });

    // Replace history so Back button cannot return to dashboard
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="topbar">
        <h1 className="topbar-title">{title}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Admin Profile Pill */}
          <div className="topbar-profile">
            <div className="topbar-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="topbar-info">
              <span className="topbar-name">{username}</span>
              <span className="topbar-role">Store Manager</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowConfirm(true)}
            title="Logout"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 1rem',
              borderRadius: '50px',
              border: '1.5px solid #fca5a5',
              background: 'white',
              color: '#dc2626',
              fontWeight: '600',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 4px rgba(220,38,38,0.1)',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#dc2626';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(220,38,38,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.borderColor = '#fca5a5';
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(220,38,38,0.1)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path>
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* ── LOGOUT CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            key="logout-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}
          >
            <motion.div
              key="logout-card"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: '#fff',
                borderRadius: '1.25rem',
                padding: '2rem 2.25rem',
                maxWidth: '380px',
                width: '100%',
                boxShadow: '0 32px 64px rgba(0,0,0,0.2)',
                textAlign: 'center',
              }}
            >
              {/* Icon */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(220, 38, 38, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path>
                </svg>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
                Confirm Logout
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.75rem', lineHeight: '1.6' }}>
                Are you sure you want to logout? You will need to sign in again to access the admin dashboard.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    border: '1.5px solid #e5e7eb',
                    background: 'white',
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowConfirm(false); performLogout(); }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.15s ease',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'; }}
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
