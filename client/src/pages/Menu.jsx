import { useEffect, useState } from 'react';
import { getMenu } from '../api';
import { useCart } from '../context/CartContext';
import styles from './Menu.module.css';

const CATEGORY_LABELS = {
  starters:  '🌿 Starters',
  soups:     '🍲 Soups',
  special:   '⭐ Special Dishes',
  rice:      '🍚 Rice & Noodles',
  proteins:  '🥩 Proteins',
  beans:     '🫘 Beans & Yam',
  swallow:   '🫓 Swallow',
  drinks:    '🥤 Drinks',
};

export default function Menu() {
  const [grouped,  setGrouped]  = useState({});
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const { addItem, setIsOpen }  = useCart();

  useEffect(() => {
    getMenu()
      .then(res => setGrouped(res.data.grouped))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = Object.keys(grouped);

  const visibleCategories = filter === 'all'
    ? categories
    : categories.filter(c => c === filter);

  return (
    <main className={styles.page}>

      {/* ---- PAGE HEADER ---- */}
      <div className={styles.pageHeader}>
        <div className="container">
          <p className="section-tag">What We Serve</p>
          <h1 className="section-title" style={{ color: 'var(--cream)' }}>
            Our Menu
          </h1>
          <p className={styles.pageSubtitle}>
            Freshly prepared every day — click any dish to add it to your order.
          </p>
        </div>
      </div>

      {/* ---- MENU CONTENT ---- */}
      <div className="container">

        {/* ---- FILTER TABS ---- */}
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${filter === cat ? styles.active : ''}`}
              onClick={() => setFilter(cat)}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {/* ---- MENU ITEMS ---- */}
        {loading ? (
          <div className="spinner" />
        ) : (
          visibleCategories.map(cat => (
            <div key={cat} className={styles.category}>
              <h2 className={styles.categoryTitle}>
                {CATEGORY_LABELS[cat] || cat}
              </h2>
              <div className={styles.grid}>
                {grouped[cat].map(item => (
                  <div key={item._id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <h3 className={styles.cardName}>{item.name}</h3>
                      {item.isSpicy && (
                        <span className="badge-spicy">🌶 Spicy</span>
                      )}
                    </div>
                    {item.description && (
                      <p className={styles.cardDesc}>{item.description}</p>
                    )}
                    <div className={styles.cardFooter}>
                      <span className={styles.cardPrice}>
                        £{item.price.toFixed(2)}
                      </span>
                      <button
                        className={styles.addBtn}
                        onClick={() => { addItem(item); setIsOpen(true); }}
                        aria-label={`Add ${item.name} to order`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

      </div>
    </main>
  );
}