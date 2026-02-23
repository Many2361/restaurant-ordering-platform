import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <span className={styles.logo}>Taste of West Africa</span>
        <span className={styles.address}>Unit 5, 11 Parry Place, London SE18 6AN</span>
      </div>
      <div className={styles.rating}>★★★★★ 5.0 on Google</div>
      <div className={styles.right}>
        <Link to="/menu">Menu</Link>
        <a href="tel:07940221089">07940 221089</a>
      </div>
    </footer>
  );
}
