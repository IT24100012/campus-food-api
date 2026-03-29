const express = require('express');
const MenuItem = require('../models/MenuItem');
const router = express.Router();

// POST /menu-items - Create menu item
router.post('/', async (req, res) => {
    try {
        const menuItem = new MenuItem(req.body);
        const saved = await menuItem.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ error: err.message });
    }
});

// GET /menu-items/search - Search menu items [cite: 338-352]
// Must be placed BEFORE the general GET route to prevent routing conflicts
router.get('/search', async (req, res) => {
    try {
        const { name, category } = req.query;
        let filter = {};
        
        if (name) filter.name = { $regex: name, $options: 'i' }; // Partial case-insensitive match
        if (category) filter.category = category;
        
        const items = await MenuItem.find(filter).sort({ name: 1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /menu-items - List all menu items
router.get('/', async (req, res) => {
    try {
        const items = await MenuItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;