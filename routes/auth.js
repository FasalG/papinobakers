const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to check credentials (In a real app, use the Admin model)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    console.log('Expected:', { 
        user: process.env.ADMIN_USERNAME, 
        pass: process.env.ADMIN_PASSWORD 
    });
    
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        console.log('Login successful');
        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token });
    }
    
    console.log('Login failed: Invalid credentials');
    res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
