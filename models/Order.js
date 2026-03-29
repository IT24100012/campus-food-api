const mongoose = require('mongoose');

// Schema for items embedded inside an order [cite: 227, 235]
const orderItemSchema = new mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false }); // Disable _id for subdocuments [cite: 249]

const orderSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    items: { 
        type: [orderItemSchema], 
        validate: [arr => arr.length > 0, 'At least one item is required'] // [cite: 262]
    },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { 
        type: String, 
        enum: ['PLACED', 'PREPARING', 'DELIVERED', 'CANCELLED'], // [cite: 271]
        default: 'PLACED' 
    },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;