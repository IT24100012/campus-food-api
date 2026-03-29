const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const router = express.Router();

// GET /analytics/total-spent/:studentId [cite: 460-478]
router.get('/total-spent/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ error: 'Invalid MongoDB ObjectId' });
        }

        const result = await Order.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(studentId) } },
            { $group: { _id: '$student', totalSpent: { $sum: '$totalPrice' } } }
        ]);

        const totalSpent = result.length > 0 ? result[0].totalSpent : 0;
        res.json({ studentId, totalSpent });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /analytics/top-menu-items [cite: 480-502]
router.get('/top-menu-items', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        const result = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { 
                _id: '$items.menuItem', 
                totalQuantity: { $sum: '$items.quantity' } 
            }},
            { $sort: { totalQuantity: -1 } },
            { $limit: limit },
            { $lookup: {
                from: 'menuitems',
                localField: '_id',
                foreignField: '_id',
                as: 'menuItemDetails'
            }},
            { $unwind: '$menuItemDetails' },
            { $project: {
                _id: 0,
                menuItem: '$menuItemDetails',
                totalQuantity: 1
            }}
        ]);

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /analytics/daily-orders [cite: 504-516]
router.get('/daily-orders', async (req, res) => {
    try {
        const result = await Order.aggregate([
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                orderCount: { $sum: 1 }
            }},
            { $sort: { _id: 1 } },
            { $project: {
                _id: 0,
                date: '$_id',
                orderCount: 1
            }}
        ]);

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;