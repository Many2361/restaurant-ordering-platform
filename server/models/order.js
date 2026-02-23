const mongoose = require('mongoose');

// =============================================
// ORDER ITEM SCHEMA (each dish in the order)
// =============================================
const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true,
  },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

// =============================================
// MAIN ORDER SCHEMA
// =============================================
const orderSchema = new mongoose.Schema(
  {
    // --- Customer Info ---
    customer: {
      name:    { type: String, required: true, trim: true },
      phone:   { type: String, required: true, trim: true },
      email:   { type: String, trim: true, lowercase: true },
      address: { type: String, trim: true }, // only required for delivery
    },

    // --- Order Items ---
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: 'Order must contain at least one item',
      },
    },

    // --- Pricing ---
    subtotal:     { type: Number, required: true },
    deliveryFee:  { type: Number, default: 0 },
    total:        { type: Number, required: true },

    // --- Order Type ---
    orderType: {
      type: String,
      enum: ['collection', 'delivery'],
      required: true,
    },

    // --- Payment ---
    paymentMethod: {
      type: String,
      enum: ['card', 'cash'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    stripePaymentIntentId: {
      type: String, // stored when customer pays by card via Stripe
    },

    // --- Order Status ---
    // This is what the admin updates as the order progresses
    status: {
      type: String,
      enum: ['new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'new',
    },

    // --- Special Instructions ---
    notes: { type: String, trim: true },

    // --- Order Reference Number ---
    // Short human-readable ID shown to customer e.g. "TOWA-1042"
    orderRef: {
      type: String,
      unique: true,
    },

    // --- Notification Tracking ---
    emailSent: { type: Boolean, default: false },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// =============================================
// GENERATE ORDER REFERENCE BEFORE SAVING
// =============================================
// Runs automatically before every new order is saved
orderSchema.pre('save', async function (next) {
  if (!this.orderRef) {
    // Generate a short ref like "TOWA-4821"
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.orderRef = `TOWA-${randomNum}`;
  }
  next();
});

// =============================================
// VIRTUAL: ITEM COUNT
// =============================================
// Not stored in DB, calculated on the fly
orderSchema.virtual('itemCount').get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

module.exports = mongoose.model('Order', orderSchema);
