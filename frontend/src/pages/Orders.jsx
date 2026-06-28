import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchOrders, updateOrderStatus } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function Orders() {
  const queryClient = useQueryClient();
  const [paymentFilter, setPaymentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Track user selection adjustments per order in the list
  const [selectedStatuses, setSelectedStatuses] = useState({});

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders', { payment_status: paymentFilter, order_status: statusFilter, date: dateFilter }],
    queryFn: () => fetchOrders({ payment_status: paymentFilter, order_status: statusFilter, date: dateFilter }),
    refetchInterval: 3000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Invalidate dashboard summaries as well in case they are active
      queryClient.invalidateQueries({ queryKey: ['summaryToday'] });
      toast.success(`Order #${data.id} status updated to: ${data.order_status}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update order status');
    }
  });

  const handleStatusChange = (orderId, value) => {
    setSelectedStatuses(prev => ({
      ...prev,
      [orderId]: value
    }));
  };

  const handleUpdateClick = (orderId) => {
    const status = selectedStatuses[orderId];
    if (!status) {
      toast.error("Please select a status to update");
      return;
    }
    updateStatusMutation.mutate({ orderId, status });
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Topbar title="Orders Management" />

        {/* Filters Bar */}
        <div className="filter-bar">
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">Payment Status</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Payments</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Statuses</option>
              <option value="Received">Received</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">Order Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            onClick={() => {
              setPaymentFilter('');
              setStatusFilter('');
              setDateFilter('');
            }}
            className="btn btn-outline"
            style={{ height: '42px', alignSelf: 'flex-end' }}
          >
            Clear Filters
          </button>
        </div>

        {/* Orders Table */}
        <div className="table-container card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>WhatsApp Number</th>
                <th>Items Ordered</th>
                <th>Delivery Address</th>
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td><div className="skeleton skeleton-text" style={{ width: '40px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '100px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '110px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '150px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '180px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '60px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '70px', borderRadius: '50px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '100px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '80px' }} /></td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--danger)', padding: '2rem' }}>
                    Error loading orders. Please try again later.
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>No orders found</span>
                      <span style={{ fontSize: '0.8rem' }}>Try adjusting or clearing the filters above.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const currentSelectedStatus = selectedStatuses[order.id] ?? order.order_status;
                  const hasStatusChanged = currentSelectedStatus !== order.order_status;

                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: '700' }}>#{order.id}</td>
                      <td style={{ fontWeight: '500' }}>{order.customer.name}</td>
                      <td>
                        <a
                          href={`https://wa.me/${order.customer.whatsapp_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#128C7E', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                          </svg>
                          {order.customer.whatsapp_number}
                        </a>
                      </td>
                      <td>
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                          {order.items.map((item, i) => (
                            <li key={i} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              • {item.name} <strong>x{item.quantity}</strong>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '0.825rem' }}>
                        {order.delivery_address}
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{order.total_amount}</td>
                      <td>
                        <span className={`badge badge-${order.payment_status.toLowerCase()}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${order.order_status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <select
                            value={currentSelectedStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="form-select"
                            style={{ padding: '0.25rem 0.5rem', width: '135px', fontSize: '0.825rem' }}
                          >
                            <option value="Received">Received</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Ready">Ready</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                          <button
                            onClick={() => handleUpdateClick(order.id)}
                            disabled={!hasStatusChanged || updateStatusMutation.isPending}
                            className="btn btn-primary btn-sm"
                            style={{ minWidth: '80px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          >
                            {updateStatusMutation.isPending && selectedStatuses[order.id] === currentSelectedStatus
                              ? 'Saving...'
                              : 'Update'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
