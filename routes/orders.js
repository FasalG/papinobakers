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

// Clear Completed Orders History (Admin)
router.delete('/clear-all', async (req, res) => {
    try {
        await Order.deleteMany({ status: 'completed' });
        res.status(200).json({ message: 'Order history cleared successfully' });
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

// Get Order by ID (Customer)
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Order Items (Customer)
router.put('/:id', async (req, res) => {
    const { items, totalAmount } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot edit order after it has been processed' });
        }

        order.items = items;
        if (totalAmount) {
            order.totalAmount = totalAmount;
        }
        
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
