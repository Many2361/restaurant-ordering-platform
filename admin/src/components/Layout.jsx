import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

const NAV = [
  { to: '/',       label: 'Dashboard', icon: '📊', end: true },
  { to: '/orders', label: 'Orders',    icon: '🧾'            },
  { to: '/menu',   label: 'Menu',      icon: '🍲'            },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={styles.shell}>
      {/* ---- SIDEBAR ---- */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>🍲</span>
            <div>
              <div className={styles.brandName}>TOWA Admin</div>
              <div className={styles.brandSub}>Restaurant Dashboard</div>
            </div>
          </div>

          <nav className={styles.nav}>
            {NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navActive : ''}`
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>A</div>
            <div>
              <div className={styles.adminName}>Admin</div>
              <div className={styles.adminEmail}>{admin?.email}</div>
            </div>
          </div>
          <button className={`btn btn-ghost ${styles.logoutBtn}`} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ---- MAIN CONTENT ---- */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}