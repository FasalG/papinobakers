const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Link = require('../models/Link');

// Create Order (Customer)
router.post('/submit', async (req, res) => {
    const { customer, items, linkId } = req.body;
    
    try {
        // Find the link to associate the order
        const link = await Link.findOne({ linkId });
        
        const newOrder = new Order({
            customer,
            items,
            linkUsed: link ? link._id : null
        });
        
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get Orders (Admin)
router.get('/all', async (req, res) => {
    try {
        const orders = await Order.find().populate('items.product').sort('-createdAt');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Order Status (Admin)
router.patch('/:id/status', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status },
            { new: true }
        );
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
