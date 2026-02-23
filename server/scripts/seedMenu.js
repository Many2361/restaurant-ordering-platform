// =============================================
// MENU SEED SCRIPT
// =============================================
// Run this ONCE to populate your MongoDB database with the full menu.
// Command: node server/scripts/seedMenu.js
//
// ⚠️  Running it again will CLEAR and re-insert all menu items.
// =============================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from the server folder
dotenv.config({ path: path.join(__dirname, '../.env') });

const { MenuModel, menuSeedData } = require('../models/Menu');

async function seedMenu() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing menu items
    await MenuModel.deleteMany({});
    console.log('🗑️  Cleared existing menu items');

    // Insert all seed data
    const inserted = await MenuModel.insertMany(menuSeedData);
    console.log(`🍲 Successfully seeded ${inserted.length} menu items`);

    // Show summary by category
    const categories = [...new Set(menuSeedData.map(i => i.category))];
    categories.forEach(cat => {
      const count = menuSeedData.filter(i => i.category === cat).length;
      console.log(`   ${cat}: ${count} items`);
    });

    console.log('\n✅ Menu seed complete! You can now start the server.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seedMenu();