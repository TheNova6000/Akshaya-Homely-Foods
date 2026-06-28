import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, MessageSquare, Loader2, Calendar, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import './CustomerChat.css';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('customer_token');
        if (!token) throw new Error('Unauthenticated');

        const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/customer/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
        if (err.message === 'Unauthenticated') {
          toast.error('Please log in to view your orders.', { id: 'auth-error' });
        } else {
          toast.error('Failed to load your orders. Please try again later.', { id: 'orders-error' });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer');
    navigate('/');
  };

  return (
    <div className="ai-page-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── GRADIENT BLOBS ── */}
      <div className="bg-canvas" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="bg-overlay" aria-hidden="true" />

      {/* ── NAVBAR ── */}
      <header className="chat-header" style={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 15, 26, 0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="header-logo" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Akshaya Homely Foods Logo" className="header-logo-img" />
          Akshaya Homely Foods
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' }}>Home</Link>
          <Link to="/my-orders" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            My Orders
          </Link>
          <Link to="/order-tracking" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Track Order
          </Link>
          <button onClick={handleLogout} className="new-chat-btn">
            <LogOut size={14} /> Logout
          </button>
        </nav>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="messages-area" style={{ flex: 1, padding: '3rem 1.5rem 1.5rem', zIndex: 10, width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'white', margin: 0 }}>My Orders</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem' }}>Track and review your order history</p>
          </div>
          <button
            onClick={() => navigate('/chat')}
            className="new-chat-btn"
            style={{ background: 'var(--brand-gradient)', color: 'white', border: 'none', fontWeight: '600' }}
          >
            <MessageSquare size={14} /> Order Assistant
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '5rem 0' }}>
            <Loader2 className="spinner" size={32} style={{ animation: 'spin 1s linear infinite', color: '#f97316' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Retrieving your order history...</span>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1.5rem',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <span style={{ fontSize: '3rem' }}>🛍️</span>
            <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: '700' }}>No Orders Found</h3>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', maxWidth: '300px', lineHeight: '1.5' }}>
              You haven't placed any orders yet. Tap below to chat with our assistant and order homemade delicacies.
            </p>
            <button
              onClick={() => navigate('/chat')}
              className="new-chat-btn"
              style={{ background: 'var(--brand-gradient)', color: 'white', border: 'none', fontWeight: '600', padding: '0.75rem 1.5rem', marginTop: '0.5rem' }}
            >
              Order Now
            </button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="qty-confirm-card"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '1.5rem',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem' }}>🛍️</span>
                    <span style={{ color: 'white', fontWeight: '800', fontSize: '0.95rem' }}>Order #{order.id}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={`payment-status-badge ${order.payment_status.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                      Payment: {order.payment_status}
                    </span>
                    <span className={`payment-status-badge`} style={{
                      fontSize: '0.65rem',
                      background: order.order_status.toLowerCase() === 'delivered' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                      border: order.order_status.toLowerCase() === 'delivered' ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(249, 115, 22, 0.25)',
                      color: order.order_status.toLowerCase() === 'delivered' ? '#4ade80' : '#fb923c'
                    }}>
                      Status: {order.order_status}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="items-list-container">
                    {order.items.map((item, i) => (
                      <div key={i} className="item-tracking-row" style={{ fontSize: '0.9rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.85)' }}>
                          • {item.name} <strong style={{ color: 'white' }}>x{item.quantity}</strong>
                        </span>
                        <span style={{ color: '#fb923c', fontWeight: '600' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', color: 'rgba(255,255,255,0.45)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Total: <strong style={{ color: '#fb923c', fontSize: '1.1rem', fontWeight: '800' }}>₹{order.total_amount.toFixed(2)}</strong>
                    </div>
                  </div>

                  {order.delivery_address && (
                    <div style={{ display: 'flex', gap: '6px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', textAlign: 'left', marginTop: '0.25rem' }}>
                      <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{order.delivery_address}</span>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <Link
                    to={`/track/${order.id}`}
                    className="new-chat-btn"
                    style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '0.78rem', color: 'white' }}
                  >
                    📍 Live Tracking
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
