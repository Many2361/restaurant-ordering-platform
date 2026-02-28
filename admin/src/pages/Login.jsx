import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const { login }             = useAuth();
  const navigate              = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    await login(form.email, form.password);
    alert('Login success! Redirecting...');
    navigate('/dashboard', { replace: true });
  } catch (err) {
    alert('Login failed: ' + JSON.stringify(err.response?.data));
    setError(err.response?.data?.message || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🍲</div>
        <h1 className={styles.title}>Taste of West Africa</h1>
        <p className={styles.subtitle}>Admin Dashboard</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.group}>
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="admin@restaurant.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div className={styles.group}>
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '12px' }}>
            <Link to="/forgot-password" style={{ color: '#C4622D', fontSize: '0.9rem' }}>
              Forgot your password?
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}