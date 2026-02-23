import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import MenuManager from './pages/MenuManager';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Wrapper that redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div className="fullscreen-loader"><div className="spinner" /></div>;
  if (!admin)  return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.85rem',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Nested routes render inside Layout's <Outlet /> */}
          <Route index                element={<Dashboard />}   />
          <Route path="orders"        element={<Orders />}      />
          <Route path="menu"          element={<MenuManager />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
      </Routes>
    </>
  );
}