import { useEffect, useState } from 'react';
import { getOrders, updateStatus } from '../api';
import toast from 'react-hot-toast';
import styles from './Orders.module.css';

const STATUSES = ['all', 'new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
const STATUS_FLOW = ['new', 'confirmed', 'preparing', 'ready', 'delivered'];
const STATUS_LABELS = {
  new: '🔵 New', confirmed: '🟣 Confirmed', preparing: '🟡 Preparing',
  ready: '🟢 Ready', delivered: '⚫ Delivered', cancelled: '🔴 Cancelled',
};

export default function Orders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (dateFilter === 'today') params.date = 'today';
      const res = await getOrders(params);
      setOrders(res.data.orders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filter, dateFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateStatus(orderId, newStatus);
      toast.success(`Order updated to ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update order');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Orders</h1>
        <button className="btn btn-ghost" onClick={fetchOrders}>↻ Refresh</button>
      </div>

      {/* ---- FILTERS ---- */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          {STATUSES.map(s => (
            <button
              key={s}
              className={`${styles.filterBtn} ${filter === s ? styles.active : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <select
          className="form-select"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="today">Today</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* ---- ORDERS ---- */}
      {loading ? (
        <div className="fullscreen-loader" style={{ minHeight: '200px' }}>
          <div className="spinner" />
        </div>
      ) : orders.length === 0 ? (
        <div className={`card ${styles.empty}`}>No orders found for this filter.</div>
      ) : (
        <div className={styles.list}>
          {orders.map(order => (
            <div key={order._id} className={`card ${styles.card}`}>
              <div className={styles.cardTop}>
                <div className={styles.cardLeft}>
                  <span className={styles.ref}>{order.orderRef}</span>
                  <span className={`status-badge status-${order.status}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className={styles.type}>
                    {order.orderType === 'delivery' ? '🛵 Delivery' : '🚶 Collection'}
                  </span>
                  <span className={styles.payment}>
                    {order.paymentMethod === 'card' ? '💳 Card' : '💵 Cash'}
                    {' '}({order.paymentStatus})
                  </span>
                </div>
                <div className={styles.cardRight}>
                  <span className={styles.time}>
                    {new Date(order.createdAt).toLocaleString('en-GB', {
                      day: '2-digit', month: 'short',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                  <span className={styles.total}>£{order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.meta}>
                <span>👤 {order.customer.name}</span>
                <span>📞 {order.customer.phone}</span>
                {order.customer.email && <span>✉️ {order.customer.email}</span>}
                {order.orderType === 'delivery' && order.customer.address && (
                  <span>📍 {order.customer.address}</span>
                )}
              </div>

              <div className={styles.items}>
                {order.items.map((item, i) => (
                  <span key={i} className={styles.item}>
                    {item.name} ×{item.quantity} — £{(item.price * item.quantity).toFixed(2)}
                  </span>
                ))}
              </div>

              {order.notes && (
                <p className={styles.notes}>📝 {order.notes}</p>
              )}

              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className={styles.actions}>
                  {STATUS_FLOW.indexOf(order.status) < STATUS_FLOW.length - 1 && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleStatusUpdate(
                        order._id,
                        STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]
                      )}
                    >
                      → {STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]}
                    </button>
                  )}
                  <button
                    className="btn btn-danger"
                    onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                  >
                    ✕ Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}