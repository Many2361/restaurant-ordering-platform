import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🍲</span>
          <span className={styles.brandName}>TOWA Admin</span>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            📋 Orders
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            🍽️ Menu
          </NavLink>
        </nav>
        <button className={styles.logout} onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}