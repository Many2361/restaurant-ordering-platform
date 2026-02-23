import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { itemCount, setIsOpen } = useCart();
  const [scrolled, setScrolled]  = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <Link to="/" className={styles.logo}>
        Taste of West Africa
      </Link>

      <ul className={styles.links}>
        <li><Link to="/" className={location.pathname === '/' ? styles.active : ''}>Home</Link></li>
        <li><Link to="/menu" className={location.pathname === '/menu' ? styles.active : ''}>Menu</Link></li>
        <Link to="/find-us">Find-Us</Link>
      </ul>

      <button className={styles.cartBtn} onClick={() => setIsOpen(true)}>
        🛒 Order
        {itemCount > 0 && (
          <span className={styles.badge}>{itemCount}</span>
        )}
      </button>
    </nav>
  );
}