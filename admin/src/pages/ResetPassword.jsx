import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import styles from './Login.module.css';

export default function ResetPassword() {
  const [searchParams]          = useSearchParams();
  const token                   = searchParams.get('token');
  const [newPassword, setNew]   = useState('');
  const [confirm, setConfirm]   = useState('');
  const [status, setStatus]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [hash, setHash]         = useState('');
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      return setStatus('Passwords do not match');
    }
    if (newPassword.length < 8) {
      return setStatus('Password must be at least 8 characters');
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setHash(data.hash);
        setDone(true);
      } else {
        setStatus(data.message || 'Reset failed');
      }
    } catch {
      setStatus('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🍲</div>
        <h1 className={styles.title}>Reset Password</h1>

        {done ? (
          <div>
            <p style={{ color: '#4caf50', marginBottom: '12px' }}>
              ✅ Password reset successful!
            </p>
            <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '8px' }}>
              Copy this hash and update your server environment variable:
            </p>
            <code style={{
              display: 'block',
              background: '#1a1a1a',
              color: '#4caf50',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              wordBreak: 'break-all',
              marginBottom: '16px'
            }}>
              ADMIN_PASSWORD_HASH={hash}
            </code>
            <Link to="/login" className={styles.btn}>
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>New Password</label>
              <input
                type="password"
                className={styles.input}
                value={newPassword}
                onChange={e => setNew(e.target.value)}
                placeholder="Min 8 characters"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirm Password</label>
              <input
                type="password"
                className={styles.input}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                required
              />
            </div>
            {status && <p className={styles.error}>{status}</p>}
            <button
              type="submit"
              className={styles.btn}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}