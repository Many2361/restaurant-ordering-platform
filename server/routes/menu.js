const express = require('express');
const router = express.Router();
const { MenuModel } = require('../models/Menu');
const protect = require('../middleware/auth');

// =============================================
// GET /api/menu
// PUBLIC — Returns all AVAILABLE menu items
// Grouped by category for the customer frontend
// =============================================
router.get('/', async (req, res) => {
  try {
    const items = await MenuModel
      .find({ isAvailable: true })
      .sort({ category: 1, sortOrder: 1 });

    // Group items by category
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({ success: true, grouped, total: items.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch menu' });
  }
});

// =============================================
// GET /api/menu/featured
// PUBLIC — Returns featured items for homepage
// =============================================
router.get('/featured', async (req, res) => {
  try {
    const items = await MenuModel
      .find({ isAvailable: true, isFeatured: true })
      .sort({ sortOrder: 1 });

    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch featured items' });
  }
});

// =============================================
// GET /api/menu/all
// ADMIN ONLY — Returns ALL items including unavailable
// So admin can see and manage everything
// =============================================
router.get('/all', protect, async (req, res) => {
  try {
    const items = await MenuModel
      .find({})
      .sort({ category: 1, sortOrder: 1 });

    // Group by category for easier admin display
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({ success: true, grouped, total: items.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch menu' });
  }
});

// =============================================
// GET /api/menu/:id
// PUBLIC — Returns a single menu item by ID
// =============================================
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuModel.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch item' });
  }
});

// =============================================
// POST /api/menu
// ADMIN ONLY — Add a new menu item
// =============================================
router.post('/', protect, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      isSpicy,
      isAvailable,
      isFeatured,
      sortOrder,
      image,
    } = req.body;

    // Basic validation
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price and category are required' });
    }

    const item = await MenuModel.create({
      name,
      description,
      price,
      category,
      isSpicy:     isSpicy     ?? false,
      isAvailable: isAvailable ?? true,
      isFeatured:  isFeatured  ?? false,
      sortOrder:   sortOrder   ?? 0,
      image:       image       ?? '',
    });

    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create menu item', error: err.message });
  }
});

// =============================================
// PUT /api/menu/:id
// ADMIN ONLY — Update a menu item (full update)
// =============================================
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await MenuModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update menu item', error: err.message });
  }
});

// =============================================
// PATCH /api/menu/:id/availability
// ADMIN ONLY — Quickly toggle available on/off
// This is the most common admin action:
// "We've run out of Seafood Okra" → flip to false
// =============================================
router.patch('/:id/availability', protect, async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'isAvailable must be true or false' });
    }

    const item = await MenuModel.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    res.json({
      success: true,
      message: `${item.name} is now ${isAvailable ? 'available' : 'unavailable'}`,
      item,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update availability' });
  }
});

// =============================================
// PATCH /api/menu/:id/price
// ADMIN ONLY — Quickly update just the price
// =============================================
router.patch('/:id/price', protect, async (req, res) => {
  try {
    const { price } = req.body;

    if (!price || price < 0) {
      return res.status(400).json({ message: 'Valid price is required' });
    }

    const item = await MenuModel.findByIdAndUpdate(
      req.params.id,
      { price },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    res.json({
      success: true,
      message: `${item.name} price updated to £${price.toFixed(2)}`,
      item,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update price' });
  }
});

// =============================================
// DELETE /api/menu/:id
// ADMIN ONLY — Permanently delete a menu item
// (prefer using isAvailable=false instead)
// =============================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await MenuModel.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    res.json({
      success: true,
      message: `${item.name} has been deleted`,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete menu item' });
  }
});

module.exports = router;