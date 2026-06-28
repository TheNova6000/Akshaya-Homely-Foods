import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Orders from './pages/Orders';
import Summary from './pages/Summary';
import MenuManagement from './pages/MenuManagement';
import CustomerChat from './pages/CustomerChat';
import OrderTracking from './pages/OrderTracking';
import Landing from './pages/Landing';
import CustomerSignup from './pages/CustomerSignup';
import MyOrders from './pages/MyOrders';

// Create a single shared query client for React Query cache management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Admin Authentication Guard Component
// Uses 'replace' so the browser history does not keep the protected page
// — pressing Back after logout goes to Landing/Login, not back to dashboard.
function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Customer Authentication Guard Component
function CustomerProtectedRoute({ children }) {
  const token = localStorage.getItem('customer_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Fallback logic
function FallbackRoute() {
  const adminToken = localStorage.getItem('admin_token');
  if (adminToken) {
    return <Navigate to="/orders" replace />;
  }
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<CustomerSignup />} />

          {/* Protected Customer Routes */}
          <Route
            path="/chat"
            element={
              <CustomerProtectedRoute>
                <CustomerChat />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <CustomerProtectedRoute>
                <MyOrders />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/order-tracking"
            element={
              <CustomerProtectedRoute>
                <OrderTracking />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/order-tracking/:id"
            element={
              <CustomerProtectedRoute>
                <OrderTracking />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/track/:id"
            element={<OrderTracking />}
          />

          {/* Admin Routes */}
          <Route
            path="/orders"
            element={
              <AdminProtectedRoute>
                <Orders />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/summary"
            element={
              <AdminProtectedRoute>
                <Summary />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <AdminProtectedRoute>
                <MenuManagement />
              </AdminProtectedRoute>
            }
          />

          {/* Navigation Fallback */}
          <Route path="*" element={<FallbackRoute />} />
        </Routes>
      </BrowserRouter>

      {/* Styled Global Toast Notification Alerts */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'custom-toast',
          duration: 3500,
          style: {
            padding: '12px 20px',
            fontSize: '14px',
          },
        }}
      />
    </QueryClientProvider>
  );
}

