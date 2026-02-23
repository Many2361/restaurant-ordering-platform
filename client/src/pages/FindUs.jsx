import styles from './FindUs.module.css';

export default function FindUs() {
  return (
    <main className={styles.page}>

      {/* ---- HEADER ---- */}
      <div className={styles.pageHeader}>
        <div className="container">
          <p className="section-tag">Where To Find Us</p>
          <h1 className="section-title" style={{ color: 'var(--cream)' }}>
            Visit Us
          </h1>
          <p className={styles.subtitle}>
            Come and experience authentic West African food in the heart of Woolwich
          </p>
        </div>
      </div>

      <div className="container">

        {/* ---- INFO CARDS ---- */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📍</div>
            <h3 className={styles.infoTitle}>Address</h3>
            <p className={styles.infoVal}>Unit 5, 11 Parry Place</p>
            <p className={styles.infoSub}>London SE18 6AN</p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📞</div>
            <h3 className={styles.infoTitle}>Phone</h3>
            <p className={styles.infoVal}>07940 221089</p>
            <p className={styles.infoSub}>Call to reserve or enquire</p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🕐</div>
            <h3 className={styles.infoTitle}>Opening Hours</h3>
            <p className={styles.infoVal}>Open Daily</p>
            <p className={styles.infoSub}>Closes at 11:45 PM</p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>💳</div>
            <h3 className={styles.infoTitle}>Payment</h3>
            <p className={styles.infoVal}>Cards & Contactless</p>
            <p className={styles.infoSub}>Credit, debit & NFC</p>
          </div>
        </div>

        {/* ---- MAP ---- */}
        <div className={styles.mapSection}>
          <h2 className={styles.mapTitle}>Find Us on the Map</h2>
          <div className={styles.mapWrapper}>
            <iframe
              title="Taste of West Africa Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2485.5!2d0.0698!3d51.4899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8ab28d4b6e6a9%3A0x4a1a0c0e2b3f5d6e!2s11%20Parry%20Pl%2C%20London%20SE18%206AN%2C%20UK!5e0!3m2!1sen!2suk!4v1234567890"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href="https://maps.google.com/?q=11+Parry+Place+London+SE18+6AN"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.directionsBtn}
          >
            📍 Get Directions
          </a>
        </div>

        {/* ---- TRANSPORT ---- */}
        <div className={styles.transport}>
          <h2 className={styles.transportTitle}>Getting Here</h2>
          <div className={styles.transportGrid}>
            <div className={styles.transportCard}>
              <div className={styles.transportIcon}>🚂</div>
              <h3>Train</h3>
              <p>Woolwich Arsenal station — 5 min walk</p>
            </div>
            <div className={styles.transportCard}>
              <div className={styles.transportIcon}>🚇</div>
              <h3>Elizabeth Line</h3>
              <p>Woolwich station — 8 min walk</p>
            </div>
            <div className={styles.transportCard}>
              <div className={styles.transportIcon}>🚌</div>
              <h3>Bus</h3>
              <p>Routes 51, 53, 54, 161, 380</p>
            </div>
            <div className={styles.transportCard}>
              <div className={styles.transportIcon}>🚗</div>
              <h3>Car</h3>
              <p>Parking available on Parry Place</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}