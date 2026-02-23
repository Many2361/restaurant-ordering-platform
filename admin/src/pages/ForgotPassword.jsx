import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Login.module.css';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [status, setStatus]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        setStatus(data.message || 'Something went wrong');
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
        <h1 className={styles.title}>Forgot Password</h1>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#4caf50', marginBottom: '16px' }}>
              ✅ Reset link sent! Check your email.
            </p>
            <Link to="/login" className={styles.btn}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: '#999', marginBottom: '20px', fontSize: '0.9rem' }}>
              Enter your admin email and we'll send you a reset link.
            </p>
            <div className={styles.field}>
              <label className={styles.label}>Admin Email</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@tasteowestafrica.co.uk"
                required
              />
            </div>
            {status && (
              <p className={styles.error}>{status}</p>
            )}
            <button
              type="submit"
              className={styles.btn}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/login" style={{ color: '#C4622D', fontSize: '0.9rem' }}>
                Back to Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}