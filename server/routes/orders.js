const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const Order = require('../models/Order');
const { MenuModel } = require('../models/Menu');
const protect = require('../middleware/auth');

// =============================================
// EMAIL TRANSPORTER (Gmail SMTP)
// =============================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =============================================
// HELPER: Send order notification emails
// =============================================
async function sendOrderEmails(order) {
  try {
    const itemsList = order.items
      .map(i => `• ${i.name} x${i.quantity} — £${(i.price * i.quantity).toFixed(2)}`)
      .join('\n');

    // --- Email to RESTAURANT ---
    await transporter.sendMail({
      from: `"TOWA Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.RESTAURANT_EMAIL,
      subject: `🍲 New Order ${order.orderRef} — ${order.orderType.toUpperCase()}`,
      text: `
NEW ORDER RECEIVED
==================
Ref:     ${order.orderRef}
Type:    ${order.orderType}
Payment: ${order.paymentMethod} (${order.paymentStatus})
Time:    ${new Date(order.createdAt).toLocaleString('en-GB')}

CUSTOMER
--------
Name:    ${order.customer.name}
Phone:   ${order.customer.phone}
${order.orderType === 'delivery' ? `Address: ${order.customer.address}` : ''}

ITEMS
-----
${itemsList}

Total: £${order.total.toFixed(2)}

${order.notes ? `Notes: ${order.notes}` : ''}
      `.trim(),
    });

    // --- Email to CUSTOMER (only if they provided an email) ---
    if (order.customer.email) {
      await transporter.sendMail({
        from: `"Taste of West Africa" <${process.env.EMAIL_USER}>`,
        to: order.customer.email,
        subject: `Your order ${order.orderRef} is confirmed! 🍲`,
        html: `
          <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#2A1810;">
            <div style="background:#2A1810;padding:32px;text-align:center;">
              <h1 style="color:#F0C060;margin:0;font-size:1.8rem;">Taste of West Africa</h1>
              <p style="color:rgba(245,237,216,0.7);margin:8px 0 0;font-style:italic;">Order Confirmed</p>
            </div>
            <div style="padding:32px;">
              <h2 style="color:#C4622D;">Thank you, ${order.customer.name}! 🎉</h2>
              <p>Your order <strong>${order.orderRef}</strong> has been received and we're getting it ready.</p>
              <table style="width:100%;border-collapse:collapse;margin:24px 0;">
                ${order.items.map(i => `
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #eee;">${i.name} × ${i.quantity}</td>
                    <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">£${(i.price * i.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr>
                  <td style="padding:12px 0;font-weight:bold;font-size:1.1rem;">Total</td>
                  <td style="padding:12px 0;font-weight:bold;font-size:1.1rem;text-align:right;color:#C4622D;">£${order.total.toFixed(2)}</td>
                </tr>
              </table>
              <p><strong>Order type:</strong> ${order.orderType}</p>
              <p><strong>Payment:</strong> ${order.paymentMethod}</p>
              ${order.orderType === 'delivery' ? `<p><strong>Delivery to:</strong> ${order.customer.address}</p>` : ''}
              <p style="margin-top:32px;color:#888;font-size:0.9rem;">
                Questions? Call us on <a href="tel:${process.env.RESTAURANT_PHONE}" style="color:#C4622D;">${process.env.RESTAURANT_PHONE}</a>
              </p>
            </div>
          </div>
        `,
      });
    }

    return true;
  } catch (err) {
    // Don't crash the order if email fails — just log it
    console.error('📧 Email send failed:', err.message);
    return false;
  }
}

// =============================================
// POST /api/orders/create-payment-intent
// Creates a Stripe PaymentIntent for card orders
// Called BEFORE the order is saved — gets the
// client_secret the frontend needs to show the card form
// =============================================
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    // Verify prices from DB (never trust frontend prices!)
    let total = 0;
    for (const item of items) {
      const menuItem = await MenuModel.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: `Item not found: ${item.name}` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is currently unavailable` });
      }
      total += menuItem.price * item.quantity;
    }

    // Add delivery fee if applicable
    const deliveryFee = req.body.orderType === 'delivery' ? 2.50 : 0;
    const grandTotal = total + deliveryFee;

    // Stripe amounts are in pence (multiply by 100)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(grandTotal * 100),
      currency: 'gbp',
      metadata: { integration_check: 'accept_a_payment' },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      total: grandTotal,
    });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ message: 'Payment setup failed', error: err.message });
  }
});

// =============================================
// POST /api/orders
// Creates and saves a new order
// =============================================
router.post('/', async (req, res) => {
  try {
    const {
      customer,
      items,
      orderType,
      paymentMethod,
      paymentIntentId,
      notes,
    } = req.body;

    // --- Validate required fields ---
    if (!customer?.name || !customer?.phone) {
      return res.status(400).json({ message: 'Customer name and phone are required' });
    }
    if (orderType === 'delivery' && !customer?.address) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // --- Re-verify prices from DB (security: never trust frontend) ---
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const menuItem = await MenuModel.findById(item.menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({ message: `${item.name} is not available` });
      }
      subtotal += menuItem.price * item.quantity;
      verifiedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });
    }

    const deliveryFee = orderType === 'delivery' ? 2.50 : 0;
    const total = subtotal + deliveryFee;

    // --- Determine payment status ---
    let paymentStatus = 'pending';
    if (paymentMethod === 'card' && paymentIntentId) {
      // Verify the payment actually went through with Stripe
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (intent.status === 'succeeded') {
        paymentStatus = 'paid';
      } else {
        return res.status(400).json({ message: 'Payment was not completed' });
      }
    }

    // --- Save order to MongoDB ---
    const order = await Order.create({
      customer,
      items: verifiedItems,
      subtotal,
      deliveryFee,
      total,
      orderType,
      paymentMethod,
      paymentStatus,
      stripePaymentIntentId: paymentIntentId || null,
      notes,
      status: 'new',
    });

    // --- Send email notifications ---
    const emailSent = await sendOrderEmails(order);
    if (emailSent) {
      await Order.findByIdAndUpdate(order._id, { emailSent: true });
    }

    res.status(201).json({
      success: true,
      orderRef: order.orderRef,
      orderId: order._id,
      total: order.total,
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
});

// =============================================
// GET /api/orders  (ADMIN ONLY)
// Returns all orders, newest first
// Supports ?status=new&date=today filters
// =============================================
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.date === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.json({ count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// =============================================
// GET /api/orders/:id  (ADMIN ONLY)
// Returns a single order by ID
// =============================================
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// =============================================
// PATCH /api/orders/:id/status  (ADMIN ONLY)
// Updates the status of an order
// e.g. new → confirmed → preparing → ready → delivered
// =============================================
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status: ${status}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // returns the updated document
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// =============================================
// GET /api/orders/stats/summary  (ADMIN ONLY)
// Returns today's order stats for the dashboard
// =============================================
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todayOrders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    });

    const stats = {
      totalOrders: todayOrders.length,
      newOrders: todayOrders.filter(o => o.status === 'new').length,
      revenue: todayOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0),
      byStatus: {
        new: todayOrders.filter(o => o.status === 'new').length,
        confirmed: todayOrders.filter(o => o.status === 'confirmed').length,
        preparing: todayOrders.filter(o => o.status === 'preparing').length,
        ready: todayOrders.filter(o => o.status === 'ready').length,
        delivered: todayOrders.filter(o => o.status === 'delivered').length,
        cancelled: todayOrders.filter(o => o.status === 'cancelled').length,
      },
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

module.exports = router;