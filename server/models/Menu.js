const mongoose = require('mongoose');

// =============================================
// MENU ITEM SCHEMA
// =============================================
const menuItemSchema = new mongoose.Schema(
  {
    // --- Basic Info ---
    name: {
      type: String,
      required: [true, 'Menu item must have a name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Menu item must have a price'],
      min: [0, 'Price cannot be negative'],
    },

    // --- Category ---
    // Used to group items on the menu page
    category: {
      type: String,
      required: true,
      enum: [
        'starters',
        'soups',
        'special',
        'rice',
        'proteins',
        'beans',
        'swallow',
        'drinks',
      ],
    },

    // --- Flags ---
    isSpicy: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true, // Set to false to hide item from menu without deleting it
    },
    isFeatured: {
      type: Boolean,
      default: false, // Featured items show on the homepage
    },

    // --- Display Order ---
    // Lower number = appears first in its category
    sortOrder: {
      type: Number,
      default: 0,
    },

    // --- Image ---
    image: {
      type: String,
      default: '', // URL to dish image (optional)
    },
  },
  {
    timestamps: true,
  }
);

// =============================================
// INDEX - speeds up queries when filtering by category
// =============================================
menuItemSchema.index({ category: 1, isAvailable: 1 });

// =============================================
// SEED DATA - Pre-built menu from the restaurant
// =============================================
// Run this once to populate the database:
// node server/scripts/seedMenu.js
const menuSeedData = [
  // STARTERS
  { name: 'Moinmoin', category: 'starters', price: 4.00, isAvailable: true, sortOrder: 1, description: 'Steamed blended beans made with onions, peppers, and spices — soft, flavourful, and perfect as a light starter or side.' },
  { name: 'Akara', category: 'starters', price: 5.00, isAvailable: true, sortOrder: 2, description: 'Crispy, fluffy Nigerian bean fritters made with seasoned beans.' },
  { name: 'Puff-Puff', category: 'starters', price: 4.00, isAvailable: false, sortOrder: 3, description: 'Soft, sweet deep-fried dough balls — a beloved West African street snack.' },
  { name: 'Meat Pie', category: 'starters', price: 4.50, isAvailable: false, sortOrder: 4, description: 'Flaky pastry filled with spiced minced meat and vegetables.' },

  // SOUPS
  { name: 'Eforiro with Assorted', category: 'soups', price: 15.40, isAvailable: true, sortOrder: 1, description: 'A rich Yoruba vegetable soup made with assorted meats and bold spices.' },
  { name: 'Egusi with Assorted', category: 'soups', price: 15.40, isAvailable: true, isFeatured: true, sortOrder: 2, description: 'Hearty melon seed soup cooked with assorted meats and traditional spices.' },
  { name: 'Mixed Okra with Assorted', category: 'soups', price: 15.40, isAvailable: true, sortOrder: 3, description: 'Thick, flavourful okra soup with a mix of assorted meats including beef, tripe, and cow foot.' },
  { name: 'Seafood Okra', category: 'soups', price: 35.00, isAvailable: true, isSpicy: true, sortOrder: 4, description: 'Flavourful okra soup packed with prawns, lobster, crab, and fresh seafood in a spicy pepper sauce.' },
  { name: 'Assorted Stew (Beef)', category: 'soups', price: 12.35, isAvailable: true, sortOrder: 5, description: 'Classic Nigerian beef stew with assorted cuts, slow-cooked in tomatoes and peppers.' },
  { name: 'Goatmeat Stew', category: 'soups', price: 12.00, isAvailable: true, sortOrder: 6, description: 'Tender goat meat in a rich tomato and pepper stew with aromatic spices.' },
  { name: 'Abula with Amala', category: 'soups', price: 25.00, isAvailable: true, isSpicy: true, isFeatured: true, sortOrder: 7, description: 'Gbegiri (creamy bean soup) + Ewedu (jute leaves) + Obe Ata (spicy red stew) — the ultimate Yoruba combination.' },
  { name: 'Ogbono Soup', category: 'soups', price: 15.40, isAvailable: false, sortOrder: 8, description: 'A thick and hearty Nigerian soup made with ground ogbono seeds, assorted meats, and traditional spices.' },
  { name: 'Catfish Stew', category: 'soups', price: 15.40, isAvailable: false, isSpicy: true, sortOrder: 9, description: 'Rich Nigerian-style catfish stew cooked in a spicy tomato and pepper sauce.' },
  { name: 'Oha Soup', category: 'soups', price: 15.40, isAvailable: false, sortOrder: 10, description: 'Best enjoyed with swallows like pounded yam, fufu, or semovita.' },

  // SPECIAL DISHES
  { name: 'Ayamase Stew', category: 'special', price: 12.00, isAvailable: true, isSpicy: true, sortOrder: 1, description: 'The bold green pepper designer stew — one of the most iconic Nigerian dishes.' },
  { name: 'Beef Suya', category: 'special', price: 15.40, isAvailable: true, isSpicy: true, isFeatured: true, sortOrder: 2, description: 'Smoky, spiced West African grilled beef skewers. Street food at its finest.' },
  { name: 'Hot & Spicy Tilapia Fish Pepper Soup', category: 'special', price: 18.00, isAvailable: false, isSpicy: true, sortOrder: 3, description: 'Fresh tilapia in a bold, spicy pepper soup broth with traditional herbs.' },

  // RICE & NOODLES
  { name: 'Jollof Rice', category: 'rice', price: 8.00, isAvailable: true, isFeatured: true, sortOrder: 1, description: 'The legendary West African one-pot rice dish cooked in a rich tomato and pepper base.' },
  { name: 'Fried Rice', category: 'rice', price: 11.00, isAvailable: true, sortOrder: 2, description: 'Nigerian-style fried rice with vegetables and seasoning.' },
  { name: 'White Rice', category: 'rice', price: 5.00, isAvailable: true, sortOrder: 3, description: 'Plain boiled white rice, perfect paired with any stew or soup.' },
  { name: 'Rice and Beans', category: 'rice', price: 7.00, isAvailable: false, sortOrder: 4, description: 'Plain boiled rice and Nigerian brown beans.' },

  // PROTEINS
  { name: 'Croaker Fish with Plantain & Salad', category: 'proteins', price: 30.00, isAvailable: true, sortOrder: 1, description: 'Whole fried croaker fish served with sweet fried plantain and a fresh side salad.' },
  { name: 'Beef Suya', category: 'proteins', price: 15.00, isAvailable: true, isSpicy: true, sortOrder: 2, description: 'Classic beef suya served with fresh onion slices.' },
  { name: 'Assorted Beef Pepper Soup', category: 'proteins', price: 15.00, isAvailable: true, isSpicy: true, sortOrder: 3, description: 'Rich and spicy soup with tender assorted beef cuts, tripe and cow foot, slow-cooked in traditional pepper soup spices.' },
  { name: 'Fried Hake Fish', category: 'proteins', price: 14.00, isAvailable: false, sortOrder: 4, description: 'Crispy golden fried hake fish seasoned with spices.' },
  { name: 'Turkey Wing', category: 'proteins', price: 12.00, isAvailable: false, sortOrder: 5, description: 'Juicy oven-roasted or grilled turkey wing with Nigerian spices.' },
  { name: 'Fried Mackerel', category: 'proteins', price: 14.00, isAvailable: false, sortOrder: 6, description: 'Whole fried mackerel fish, crispy outside and tender inside.' },
  { name: 'Oven Grill Tilapia with Plantain & Salad', category: 'proteins', price: 28.00, isAvailable: false, sortOrder: 7, description: 'Whole oven-grilled tilapia served with sweet fried plantain and salad.' },

  // BEANS & YAM
  { name: 'Ewa Agoyin with Spicy Sauce', category: 'beans', price: 12.00, isAvailable: true, isSpicy: true, sortOrder: 1, description: 'Mashed honey beans served with the addictive Lagos-style spicy caramelised onion sauce.' },
  { name: 'Asaro / Yam Pottage', category: 'beans', price: 10.00, isAvailable: false, sortOrder: 2, description: 'Savory mashed yam cooked in a rich blend of peppers, tomatoes, onions, and palm oil.' },
  { name: 'Beans & Yam', category: 'beans', price: 10.00, isAvailable: false, sortOrder: 3, description: 'Tender yam and creamy beans cooked together in a rich, flavourful sauce.' },

  // SWALLOW
  { name: 'Eba', category: 'swallow', price: 3.08, isAvailable: true, sortOrder: 1, description: 'Smooth cassava flour swallow, the perfect companion to any Nigerian soup.' },
  { name: 'Pounded Yam', category: 'swallow', price: 3.08, isAvailable: true, sortOrder: 2, description: 'Light and stretchy pounded yam — a Nigerian classic.' },
  { name: 'Amala', category: 'swallow', price: 3.08, isAvailable: true, sortOrder: 3, description: 'Dark, smooth yam flour swallow. Best paired with Abula or Ewedu.' },
  { name: 'Oatmeal', category: 'swallow', price: 3.08, isAvailable: true, sortOrder: 4, description: 'Smooth oatmeal swallow — a lighter alternative.' },

  // DRINKS
  { name: 'Nigerian Fanta Orange 500ml', category: 'drinks', price: 4.00, isAvailable: true, sortOrder: 1, description: 'The iconic Nigerian Fanta — sweeter and bolder than you remember.' },
  { name: 'Volvic Mineral Water 500ml', category: 'drinks', price: 2.00, isAvailable: true, sortOrder: 2, description: 'Still mineral water.' },
  { name: 'Coca-Cola 330ml', category: 'drinks', price: 2.20, isAvailable: true, sortOrder: 3, description: 'Classic Coca-Cola in a can.' },
  { name: 'Chivita Juice', category: 'drinks', price: 3.50, isAvailable: true, sortOrder: 4, description: 'Refreshing Nigerian fruit juice.' },
  { name: 'Teem Bitter Lemon', category: 'drinks', price: 2.50, isAvailable: false, sortOrder: 5, description: 'Refreshing bitter lemon soda.' },
];

module.exports = {
  MenuModel: mongoose.model('Menu', menuItemSchema),
  menuSeedData,
};
