import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrderStats, getOrders, updateStatus } from '../api';
import toast from 'react-hot-toast';
import styles from './Dashboard.module.css';

const STATUS_FLOW = ['new', 'confirmed', 'preparing', 'ready', 'delivered'];

const STATUS_LABELS = {
  new:       '🔵 New',
  confirmed: '🟣 Confirmed',
  preparing: '🟡 Preparing',
  ready:     '🟢 Ready',
  delivered: '⚫ Delivered',
  cancelled: '🔴 Cancelled',
};

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        getOrderStats(),
        getOrders({ date: 'today' }),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data.orders);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateStatus(orderId, newStatus);
      toast.success(`Order updated to ${newStatus}`);
      fetchAll();
    } catch {
      toast.error('Failed to update order');
    }
  };

  if (loading) return <div className="fullscreen-loader"><div className="spinner" /></div>;

  return (
    <div className={styles.page}>
      {/* ---- PAGE HEADER ---- */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageDate}>
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={fetchAll}>↻ Refresh</button>
      </div>

      {/* ---- STAT CARDS ---- */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={`card ${styles.statCard}`}>
            <div className={styles.statIcon}>📦</div>
            <div className={styles.statVal}>{stats.totalOrders}</div>
            <div className={styles.statLabel}>Today's Orders</div>
          </div>
          <div className={`card ${styles.statCard}`}>
            <div className={styles.statIcon}>🔵</div>
            <div className={`${styles.statVal} ${styles.statNew}`}>{stats.newOrders}</div>
            <div className={styles.statLabel}>Awaiting Action</div>
          </div>
          <div className={`card ${styles.statCard}`}>
            <div className={styles.statIcon}>💷</div>
            <div className={`${styles.statVal} ${styles.statRevenue}`}>
              £{stats.revenue.toFixed(2)}
            </div>
            <div className={styles.statLabel}>Today's Revenue</div>
          </div>
          <div className={`card ${styles.statCard}`}>
            <div className={styles.statIcon}>🟢</div>
            <div className={styles.statVal}>{stats.byStatus.ready}</div>
            <div className={styles.statLabel}>Ready to Collect/Deliver</div>
          </div>
        </div>
      )}

      {/* ---- TODAY'S ORDERS ---- */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Today's Orders</h2>
          <Link to="/orders" className="btn btn-ghost">View All →</Link>
        </div>

        {orders.length === 0 ? (
          <div className={`card ${styles.empty}`}>
            <p>No orders yet today. They'll appear here automatically.</p>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map(order => (
              <div key={order._id} className={`card ${styles.orderCard}`}>
                <div className={styles.orderTop}>
                  <div className={styles.orderLeft}>
                    <span className={styles.orderRef}>{order.orderRef}</span>
                    <span className={`status-badge status-${order.status}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span className={styles.orderType}>
                      {order.orderType === 'delivery' ? '🛵 Delivery' : '🚶 Collection'}
                    </span>
                  </div>
                  <div className={styles.orderRight}>
                    <span className={styles.orderTime}>
                      {new Date(order.createdAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    <span className={styles.orderTotal}>£{order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.orderMeta}>
                  <span>👤 {order.customer.name}</span>
                  <span>📞 {order.customer.phone}</span>
                  <span>💳 {order.paymentMethod}</span>
                  {order.orderType === 'delivery' && (
                    <span>📍 {order.customer.address}</span>
                  )}
                </div>

                <div className={styles.orderItems}>
                  {order.items.map((item, i) => (
                    <span key={i} className={styles.orderItem}>
                      {item.name} ×{item.quantity}
                    </span>
                  ))}
                </div>

                {order.notes && (
                  <p className={styles.orderNotes}>📝 {order.notes}</p>
                )}

                {/* ---- STATUS ACTION BUTTONS ---- */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className={styles.orderActions}>
                    {STATUS_FLOW.indexOf(order.status) < STATUS_FLOW.length - 1 && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStatusUpdate(
                          order._id,
                          STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]
                        )}
                      >
                        → Mark as {STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]}
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
    </div>
  );
}