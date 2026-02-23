import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { createPaymentIntent, placeOrder } from '../api';
import toast from 'react-hot-toast';
import styles from './Cart.module.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ---- CHECKOUT FORM (inside Stripe Elements) ----
function CheckoutForm({ onSuccess }) {
  const { items, subtotal, clearCart } = useCart();
  const stripe   = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [orderType,     setOrderType]     = useState('collection');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading,       setLoading]       = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', notes: '',
  });

  const deliveryFee = orderType === 'delivery' ? 2.50 : 0;
  const total       = subtotal + deliveryFee;

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      toast.error('Please enter your name and phone number');
      return;
    }
    if (orderType === 'delivery' && !form.address) {
      toast.error('Please enter your delivery address');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customer: {
          name:    form.name,
          phone:   form.phone,
          email:   form.email,
          address: form.address,
        },
        items: items.map(i => ({
          menuItemId: i._id,
          name:       i.name,
          price:      i.price,
          quantity:   i.quantity,
        })),
        orderType,
        paymentMethod,
        notes: form.notes,
      };

      if (paymentMethod === 'card') {
        // Step 1: Create payment intent on backend
        const { data: intentData } = await createPaymentIntent({
          items: orderPayload.items,
          orderType,
        });

        // Step 2: Confirm card payment with Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          intentData.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: { name: form.name },
            },
          }
        );

        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }

        orderPayload.paymentIntentId = paymentIntent.id;
      }

      // Step 3: Save order to database
      const { data } = await placeOrder(orderPayload);

      clearCart();
      navigate(`/order/${data.orderRef}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.checkout}>
      {/* Order Type Toggle */}
      <div className={styles.toggleGroup}>
        <button
          className={`${styles.toggleBtn} ${orderType === 'collection' ? styles.active : ''}`}
          onClick={() => setOrderType('collection')}
        >
          🚶 Collection
        </button>
        <button
          className={`${styles.toggleBtn} ${orderType === 'delivery' ? styles.active : ''}`}
          onClick={() => setOrderType('delivery')}
        >
          🛵 Delivery
        </button>
      </div>

      {/* Customer Details */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Full Name *</label>
        <input className={styles.input} name="name" placeholder="Your name"
          value={form.name} onChange={handleChange} />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Phone *</label>
          <input className={styles.input} name="phone" placeholder="07xxx xxxxxx"
            value={form.phone} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email (optional)</label>
          <input className={styles.input} name="email" placeholder="For confirmation"
            value={form.email} onChange={handleChange} type="email" />
        </div>
      </div>

      {orderType === 'delivery' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Delivery Address *</label>
          <input className={styles.input} name="address" placeholder="Full delivery address"
            value={form.address} onChange={handleChange} />
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.label}>Special Instructions</label>
        <textarea className={styles.textarea} name="notes" placeholder="Allergies, preferences..."
          value={form.notes} onChange={handleChange} rows={2} />
      </div>

      {/* Payment Method Toggle */}
      <div className={styles.toggleGroup}>
        <button
          className={`${styles.toggleBtn} ${paymentMethod === 'cash' ? styles.active : ''}`}
          onClick={() => setPaymentMethod('cash')}
        >
          💵 Cash
        </button>
        <button
          className={`${styles.toggleBtn} ${paymentMethod === 'card' ? styles.active : ''}`}
          onClick={() => setPaymentMethod('card')}
        >
          💳 Card
        </button>
      </div>

      {/* Stripe Card Element */}
      {paymentMethod === 'card' && (
        <div className={styles.cardElement}>
          <label className={styles.label}>Card Details</label>
          <div className={styles.stripeBox}>
            <CardElement options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#2A1810',
                  fontFamily: 'Georgia, serif',
                  '::placeholder': { color: '#aaa' },
                },
              },
            }} />
          </div>
        </div>
      )}

      {/* Order Total */}
      <div className={styles.totalBox}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>
        {orderType === 'delivery' && (
          <div className={styles.totalRow}>
            <span>Delivery fee</span>
            <span>£{deliveryFee.toFixed(2)}</span>
          </div>
        )}
        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
          <span>Total</span>
          <span>£{total.toFixed(2)}</span>
        </div>
      </div>

      <button
        className={styles.placeOrderBtn}
        onClick={handleSubmit}
        disabled={loading || !stripe}
      >
        {loading ? 'Placing Order...' : `✓ Place Order — £${total.toFixed(2)}`}
      </button>
    </div>
  );
}

// ---- MAIN CART SIDEBAR ----
export default function Cart() {
  const { items, itemCount, subtotal, isOpen, isCheckout,
          setIsOpen, setIsCheckout, addItem, removeItem, deleteItem } = useCart();

  const close = () => { setIsOpen(false); setIsCheckout(false); };

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={close}
      />

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {isCheckout && (
              <button className={styles.backBtn} onClick={() => setIsCheckout(false)}>
                ← Back
              </button>
            )}
            <h2 className={styles.title}>
              {isCheckout ? 'Checkout' : 'Your Order'}
            </h2>
          </div>
          <button className={styles.closeBtn} onClick={close}>✕</button>
        </div>

        {/* Content */}
        <div className={styles.body}>
          {!isCheckout ? (
            <>
              {items.length === 0 ? (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>🛒</div>
                  <p>Your order is empty.</p>
                  <p>Add something delicious!</p>
                </div>
              ) : (
                <>
                  {items.map(item => (
                    <div key={item._id} className={styles.cartItem}>
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemPrice}>
                          £{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className={styles.qtyControls}>
                        <button onClick={() => removeItem(item._id)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => addItem(item)}>+</button>
                      </div>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => deleteItem(item._id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </>
              )}
            </>
          ) : (
            <Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          )}
        </div>

        {/* Footer — only show when viewing cart (not checkout) */}
        {!isCheckout && items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.footerTotal}>
              <span className={styles.footerTotalLabel}>Subtotal ({itemCount} items)</span>
              <span className={styles.footerTotalAmount}>£{subtotal.toFixed(2)}</span>
            </div>
            <button
              className={styles.checkoutBtn}
              onClick={() => setIsCheckout(true)}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}