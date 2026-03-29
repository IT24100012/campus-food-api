require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const studentRoutes = require('./routes/students');
const menuItemRoutes = require('./routes/menuItems');
const orderRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware [cite: 105-107]
app.use(cors());
app.use(express.json());

// Root route [cite: 108-111]
app.get('/', (req, res) => {
    res.json({ message: 'Campus Food API is running successfully!' });
});

// Attach routes [cite: 112-116, 138-145]
app.use('/students', studentRoutes);
app.use('/menu-items', menuItemRoutes);
app.use('/orders', orderRoutes);
app.use('/analytics', analyticsRoutes);

// Database connection [cite: 117-121]
console.log("My MongoDB URI is:", process.env.MONGO_URI);

// Database connection
mongoose.connect('mongodb://127.0.0.1:27017/campusFoodDB')
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));