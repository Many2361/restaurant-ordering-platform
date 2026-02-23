import { useParams, Link } from 'react-router-dom';
import styles from './OrderConfirmation.module.css';

export default function OrderConfirmation() {
  const { ref } = useParams();

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>🎉</div>
        <h1 className={styles.title}>Order Received!</h1>
        <p className={styles.ref}>Order Reference: <strong>{ref}</strong></p>
        <p className={styles.msg}>
          Thank you! We've got your order and we'll be in touch shortly
          on the number you provided.
        </p>
        <p className={styles.contact}>
          Questions? Call us on{' '}
          <p> className={styles.phone}07940 221089</p>
        </p>
        <Link to="/menu" className={`btn btn-primary ${styles.btn}`}>
          Order Again
        </Link>
      </div>
    </main>
  );
}