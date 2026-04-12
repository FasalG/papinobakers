const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const { nanoid } = require('nanoid');

// Generate a new link
router.post('/generate', async (req, res) => {
    const { validityDays, note } = req.body; // e.g. 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (validityDays || 7));
    
    const linkId = nanoid(10);
    const newLink = new Link({ linkId, expiresAt, note });
    
    try {
        await newLink.save();
        res.status(201).json(newLink);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all links (Admin)
router.get('/all', async (req, res) => {
    try {
        // Cleanup expired or inactive links
        await Link.deleteMany({
            $or: [
                { expiresAt: { $lt: new Date() } },
                { isActive: false }
            ]
        });
        
        const links = await Link.find().sort('-createdAt');
        res.json(links);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Validate link
router.get('/validate/:linkId', async (req, res) => {
    try {
        const link = await Link.findOne({ linkId: req.params.linkId });
        if (!link) return res.status(404).json({ message: 'Link not found' });
        
        if (!link.isActive || link.expiresAt < new Date()) {
            return res.status(410).json({ message: 'Link expired or inactive' });
        }
        
        res.json({ valid: true, link });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
