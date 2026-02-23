import { useEffect, useState } from 'react';
import { getAllMenu, toggleAvailability, updatePrice, addMenuItem, deleteMenuItem } from '../api';
import toast from 'react-hot-toast';
import styles from './MenuManager.module.css';

const CATEGORIES = ['starters','soups','special','rice','proteins','beans','swallow','drinks'];
const CATEGORY_LABELS = {
  starters: '🌿 Starters', soups: '🍲 Soups', special: '⭐ Special',
  rice: '🍚 Rice', proteins: '🥩 Proteins', beans: '🫘 Beans & Yam',
  swallow: '🫓 Swallow', drinks: '🥤 Drinks',
};

const EMPTY_FORM = { name: '', description: '', price: '', category: 'starters', isSpicy: false };

export default function MenuManager() {
  const [grouped,  setGrouped]  = useState({});
  const [loading,  setLoading]  = useState(true);
  const [editPrice, setEditPrice] = useState({}); // { [itemId]: newPrice }
  const [showAdd,  setShowAdd]  = useState(false);
  const [addForm,  setAddForm]  = useState(EMPTY_FORM);
  const [adding,   setAdding]   = useState(false);

  const fetchMenu = async () => {
    try {
      const res = await getAllMenu();
      setGrouped(res.data.grouped);
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenu(); }, []);

  // --- Toggle availability on/off ---
  const handleToggle = async (item) => {
    try {
      await toggleAvailability(item._id, !item.isAvailable);
      toast.success(`${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`);
      fetchMenu();
    } catch {
      toast.error('Failed to update');
    }
  };

  // --- Update price ---
  const handlePriceUpdate = async (item) => {
    const newPrice = parseFloat(editPrice[item._id]);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Enter a valid price');
      return;
    }
    try {
      await updatePrice(item._id, newPrice);
      toast.success(`${item.name} price updated to £${newPrice.toFixed(2)}`);
      setEditPrice(prev => { const n = { ...prev }; delete n[item._id]; return n; });
      fetchMenu();
    } catch {
      toast.error('Failed to update price');
    }
  };

  // --- Delete item ---
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await deleteMenuItem(item._id);
      toast.success(`${item.name} deleted`);
      fetchMenu();
    } catch {
      toast.error('Failed to delete');
    }
  };

  // --- Add new item ---
  const handleAdd = async () => {
    if (!addForm.name || !addForm.price || !addForm.category) {
      toast.error('Name, price and category are required');
      return;
    }
    setAdding(true);
    try {
      await addMenuItem({ ...addForm, price: parseFloat(addForm.price) });
      toast.success(`${addForm.name} added to menu!`);
      setAddForm(EMPTY_FORM);
      setShowAdd(false);
      fetchMenu();
    } catch {
      toast.error('Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="fullscreen-loader"><div className="spinner" /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Menu Manager</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? '✕ Cancel' : '+ Add Dish'}
        </button>
      </div>

      {/* ---- ADD ITEM FORM ---- */}
      {showAdd && (
        <div className={`card ${styles.addForm}`}>
          <h3 className={styles.addTitle}>Add New Dish</h3>
          <div className={styles.addGrid}>
            <div>
              <label className="form-label">Name *</label>
              <input className="form-input" placeholder="Dish name"
                value={addForm.name}
                onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Price (£) *</label>
              <input className="form-input" type="number" step="0.01" placeholder="0.00"
                value={addForm.price}
                onChange={e => setAddForm(p => ({ ...p, price: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select className="form-select"
                value={addForm.category}
                onChange={e => setAddForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div className={styles.spicyToggle}>
              <label className="form-label">Spicy?</label>
              <button
                className={`${styles.spicyBtn} ${addForm.isSpicy ? styles.spicyOn : ''}`}
                onClick={() => setAddForm(p => ({ ...p, isSpicy: !p.isSpicy }))}
              >
                🌶 {addForm.isSpicy ? 'Yes' : 'No'}
              </button>
            </div>
          </div>
          <div>
            <label className="form-label">Description (optional)</label>
            <input className="form-input" placeholder="Brief description..."
              value={addForm.description}
              onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={adding}
            style={{ marginTop: '12px' }}
          >
            {adding ? 'Adding...' : '✓ Add to Menu'}
          </button>
        </div>
      )}

      {/* ---- MENU CATEGORIES ---- */}
      {CATEGORIES.filter(cat => grouped[cat]).map(cat => (
        <div key={cat} className={styles.category}>
          <h2 className={styles.categoryTitle}>{CATEGORY_LABELS[cat]}</h2>
          <div className={styles.itemsList}>
            {grouped[cat].map(item => (
              <div
                key={item._id}
                className={`${styles.item} ${!item.isAvailable ? styles.unavailable : ''}`}
              >
                <div className={styles.itemLeft}>
                  {/* Availability toggle */}
                  <button
                    className={`${styles.toggle} ${item.isAvailable ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => handleToggle(item)}
                    title={item.isAvailable ? 'Click to mark unavailable' : 'Click to mark available'}
                  >
                    <span className={styles.toggleKnob} />
                  </button>
                  <div>
                    <div className={styles.itemName}>
                      {item.name}
                      {item.isSpicy && <span className={styles.spicyBadge}>🌶</span>}
                      {!item.isAvailable && (
                        <span className={styles.unavailableBadge}>Unavailable</span>
                      )}
                    </div>
                    {item.description && (
                      <div className={styles.itemDesc}>{item.description}</div>
                    )}
                  </div>
                </div>

                <div className={styles.itemRight}>
                  {/* Inline price editor */}
                  <div className={styles.priceEdit}>
                    <span className={styles.pricePrefix}>£</span>
                    <input
                      className={styles.priceInput}
                      type="number"
                      step="0.01"
                      value={editPrice[item._id] ?? item.price.toFixed(2)}
                      onChange={e => setEditPrice(prev => ({
                        ...prev, [item._id]: e.target.value
                      }))}
                    />
                    {editPrice[item._id] !== undefined && (
                      <button
                        className={styles.savePrice}
                        onClick={() => handlePriceUpdate(item)}
                      >
                        ✓
                      </button>
                    )}
                  </div>

                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                    onClick={() => handleDelete(item)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}