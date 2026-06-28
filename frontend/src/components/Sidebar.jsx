import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const performLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer');
    queryClient.clear();
    toast.success('Logged out successfully', { icon: '👋', duration: 2500 });
    navigate('/login', { replace: true });
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img
            src="https://akshayahomelyfoods.com/wp-content/uploads/2025/07/cropped-Ak-Logo-21-scaled-e1759121864836-1-170x109.png"
            alt="Akshaya Homely Foods Logo"
            className="sidebar-logo"
          />
          <h2 className="sidebar-title">Admin Panel</h2>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <svg className="sidebar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="9"></line>
              <line x1="9" y1="13" x2="15" y2="13"></line>
              <line x1="9" y1="17" x2="15" y2="17"></line>
            </svg>
            <span>Orders</span>
          </NavLink>

          <NavLink to="/summary" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <svg className="sidebar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>Daily Summary</span>
          </NavLink>

          <NavLink to="/menu" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <svg className="sidebar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5"></path>
            </svg>
            <span>Menu Management</span>
          </NavLink>
        </nav>

        {/* Sidebar Logout Button */}
        <button onClick={() => setShowConfirm(true)} className="sidebar-logout">
          <svg className="sidebar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path>
          </svg>
          <span>Logout</span>
        </button>
      </aside>

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
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                background: '#fff', borderRadius: '1.25rem',
                padding: '2rem 2.25rem', maxWidth: '380px', width: '100%',
                boxShadow: '0 32px 64px rgba(0,0,0,0.2)', textAlign: 'center',
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(220,38,38,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                    flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                    border: '1.5px solid #e5e7eb', background: 'white',
                    color: '#374151', fontWeight: '600', fontSize: '0.875rem',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowConfirm(false); performLogout(); }}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white', fontWeight: '700', fontSize: '0.875rem',
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
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
