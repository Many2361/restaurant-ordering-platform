import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './Home.module.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const { addItem, setIsOpen } = useCart();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/menu/featured`)
      .then(res => res.json())
      .then(data => {
        console.log('Featured data:', data);
        if (data.items && data.items.length > 0) {
          setFeatured(data.items);
        }
      })
      .catch(err => console.log('Fetch error:', err));

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
        <div className={styles.featuredHeader}>
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
            { icon: '🍲', label: 'Service',    val: 'Dine-in'   },
            { icon: '🛵', label: 'Delivery',   val: 'Available' },
            { icon: '🕐', label: 'Opening Time', val: 'Mon–Sat 10–11pm, Sun 10–9:30pm' },
            { icon: '⭐', label: 'Rated',      val: '5.0 Stars' },
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
      <section className={styles.featured}>
        <div className="container">
          <div className={`${styles.featuredHeader} reveal`}>
            <p className="section-tag">Must Try</p>
            <h2 className="section-title" style={{ color: 'var(--deep-brown)' }}>
              Featured Dishes
            </h2>
            <p className={styles.featuredSubtitle}>
              Hover over a dish to find out more
            </p>
          </div>

          {featured.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
              Loading dishes...
            </p>
          ) : (
            <div className={styles.featuredGrid}>
              {featured.map((item, i) => (
                <div
                    key={item._id}
                    className={styles.flipCard}
                    style={{ transitionDelay: `${i * 0.1}s` }}
                  >
                  <div className={styles.flipInner}>

                    {/* FRONT */}
                    <div className={styles.flipFront}>
                      <div className={styles.flipEmoji}>🍲</div>
                      <h3 className={styles.flipName}>{item.name}</h3>
                      <span className={styles.flipPrice}>
                        £{item.price.toFixed(2)}
                      </span>
                      {item.isSpicy && (
                        <span className="badge-spicy">🌶 Spicy</span>
                      )}
                      <p className={styles.flipHint}>Hover to see more</p>
                    </div>

                    {/* BACK */}
                    <div className={styles.flipBack}>
                      <h3 className={styles.flipNameBack}>{item.name}</h3>
                      <p className={styles.flipDesc}>{item.description}</p>
                      <span className={styles.flipPriceBack}>
                        £{item.price.toFixed(2)}
                      </span>
                      <button
                        className={styles.flipBtn}
                        onClick={() => { addItem(item); setIsOpen(true); }}
                      >
                        + Add to Order
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.featuredCta}>
            <Link to="/menu" className="btn btn-primary">View Full Menu</Link>
          </div>
        </div>
      </section>

      {/* ---- CONTACT ---- */}
      <section className={styles.contact} id="contact">
        <div className="container">
          <div className={`${styles.contactHeader} reveal`}>
            <p className="section-tag light">Find Us</p>
            <h2 className="section-title light">Come & Eat With Us</h2>
          </div>
          <div className={styles.contactGrid}>
            {[
              { icon: '📍', label: 'Address', val: 'Unit 5, 11 Parry Place', sub: 'London SE18 6AN' },
              { icon: '📞', label: 'Phone',   val: '07940 221089',           sub: 'Call to reserve or enquire' },
              { icon: '🕐', label: 'Hours',   val: 'Opening Time',             sub: 'Mon–Sat 10–11pm, Sun 10–9:30pm' },
              { icon: '💳', label: 'Payment', val: 'Cards & Contactless',    sub: 'Credit, debit & NFC' },
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