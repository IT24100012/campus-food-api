const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const router = express.Router();

// Helper: calculate totalPrice from items [cite: 367-374]
async function calculateTotalPrice(items) {
    let total = 0;
    for (const item of items) {
        const menuItem = await MenuItem.findById(item.menuItem);
        if (!menuItem) throw new Error(`Invalid menu item ID: ${item.menuItem}`);
        total += menuItem.price * item.quantity;
    }
    return total;
}

// POST /orders - Place order [cite: 375-392]
router.post('/', async (req, res) => {
    try {
        const { student, items } = req.body;
        if (!student || !items || items.length === 0) {
            return res.status(400).json({ error: 'Valid student and non-empty items array required' });
        }
        
        const totalPrice = await calculateTotalPrice(items);
        const order = new Order({ student, items, totalPrice, status: 'PLACED' });
        await order.save();
        
        const populatedOrder = await Order.findById(order._id)
            .populate('student')
            .populate('items.menuItem');
            
        res.status(201).json(populatedOrder);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ error: err.message });
    }
});

// GET /orders - List orders with pagination [cite: 393-411]
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('student')
            .populate('items.menuItem');

        const totalOrders = await Order.countDocuments();

        res.json({
            page,
            limit,
            totalOrders,
            totalPages: Math.ceil(totalOrders / limit),
            orders
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /orders/:id - Get order by ID [cite: 412-424]
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('student')
            .populate('items.menuItem');
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ error: 'Invalid order ID' });
    }
});

// PATCH /orders/:id/status - Update order status [cite: 425-438]
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ['PLACED', 'PREPARING', 'DELIVERED', 'CANCELLED'];
        
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true, runValidators: true }
        ).populate('student').populate('items.menuItem');

        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ error: err.message });
    }
});

// DELETE /orders/:id - Delete order [cite: 439-449]
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ error: 'Invalid order ID' });
    }
});

module.exports = router;