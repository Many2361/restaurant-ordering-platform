import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getFeatured } from '../api';
import { useCart } from '../context/CartContext';
import styles from './Home.module.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const { addItem, setIsOpen }  = useCart();
  const revealRefs = useRef([]);

  useEffect(() => {
    getFeatured()
      .then(res => setFeatured(res.data.items))
      .catch(() => {}); // silently fail if API is down

    // Scroll reveal observer
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      {/* ---- HERO ---- */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroKente} />
        <div className={styles.heroContent}>
          <p className={styles.heroTag}>London · SE18 · West African Cuisine</p>
          <h1 className={styles.heroTitle}>
            A True <em>Taste</em><br />of West Africa
          </h1>
          <p className={styles.heroSub}>
            Authentic Nigerian flavours — from hearty soups & swallows to
            smoky suya, brought to Woolwich with love.
          </p>
          <div className={styles.heroButtons}>
            <Link to="/menu" className="btn btn-primary">Order Now</Link>
            <a href="#about" className="btn btn-outline">Our Story</a>
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>5.0</span>
            <span className={styles.statLabel}>Google Rating</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>30+</span>
            <span className={styles.statLabel}>Dishes</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>100%</span>
            <span className={styles.statLabel}>Authentic</span>
          </div>
        </div>
      </section>

      {/* ---- ABOUT ---- */}
      <section className={styles.about} id="about">
        <div className={`${styles.aboutLeft} reveal`}>
          <p className="section-tag light">Our Story</p>
          <h2 className="section-title light">Rooted in Tradition</h2>
          <p className={styles.aboutText}>
            Every pot tells a story. At Taste of West Africa, we bring the soulful,
            bold flavours of Nigerian and West African cooking straight to your table
            — made with fresh ingredients, time-honoured recipes, and a whole lot of heart.
          </p>
          <p className={styles.aboutText} style={{ marginTop: '16px' }}>
            Whether you're craving the comforting warmth of Abula with Amala, the
            rich depth of Egusi soup, or the smoky thrill of fresh Suya — you're home.
          </p>
        </div>
        <div className={`${styles.aboutTiles} reveal`}>
          {[
            { icon: '🍲', label: 'Service',   val: 'Dine-in'   },
            { icon: '🛵', label: 'Delivery',  val: 'Available' },
            { icon: '🕐', label: 'Open Until',val: '11:45 PM'  },
            { icon: '⭐', label: 'Rated',     val: '5.0 Stars' },
          ].map(tile => (
            <div key={tile.label} className={styles.tile}>
              <div className={styles.tileIcon}>{tile.icon}</div>
              <div className={styles.tileLabel}>{tile.label}</div>
              <div className={styles.tileVal}>{tile.val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- FEATURED DISHES ---- */}
      {featured.length > 0 && (
        <section className={styles.featured}>
          <div className="container">
            <div className={`${styles.featuredHeader} reveal`}>
              <p className="section-tag">Must Try</p>
              <h2 className="section-title">Featured Dishes</h2>
            </div>
            <div className={styles.featuredGrid}>
              {featured.map((item, i) => (
                <div
                  key={item._id}
                  className={`${styles.featuredCard} reveal`}
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardName}>{item.name}</h3>
                    <p className={styles.cardDesc}>{item.description}</p>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardPrice}>£{item.price.toFixed(2)}</span>
                    <div className={styles.cardActions}>
                      {item.isSpicy && <span className="badge-spicy">🌶 Spicy</span>}
                      <button
                        className={styles.addBtn}
                        onClick={() => { addItem(item); setIsOpen(true); }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.featuredCta}>
              <Link to="/menu" className="btn btn-primary">View Full Menu</Link>
            </div>
          </div>
        </section>
      )}

      {/* ---- CONTACT ---- */}
      <section className={styles.contact} id="contact">
        <div className="container">
          <div className={`${styles.contactHeader} reveal`}>
            <p className="section-tag light">Find Us</p>
            <h2 className="section-title light">Come & Eat With Us</h2>
          </div>
          <div className={styles.contactGrid}>
            {[
              { icon: '📍', label: 'Address',  val: 'Unit 5, 11 Parry Place', sub: 'London SE18 6AN' },
              { icon: '📞', label: 'Phone',    val: '07940 221089',           sub: 'Call to reserve or enquire' },
              { icon: '🕐', label: 'Hours',    val: 'Open Daily',             sub: 'Closes at 11:45 PM' },
              { icon: '💳', label: 'Payment',  val: 'Cards & Contactless',    sub: 'Credit, debit & NFC' },
            ].map(item => (
              <div key={item.label} className={`${styles.contactCard} reveal`}>
                <div className={styles.contactIcon}>{item.icon}</div>
                <div className={styles.contactLabel}>{item.label}</div>
                <div className={styles.contactVal}>{item.val}</div>
                <div className={styles.contactSub}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}