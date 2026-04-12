const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

const { storage, cloudinary } = require('../config/cloudinary');
const upload = multer({ storage });

const extractPublicId = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    let publicIdParts = parts.slice(uploadIndex + 1);
    if (publicIdParts[0].startsWith('v') && /^\d+$/.test(publicIdParts[0].substring(1))) {
        publicIdParts = publicIdParts.slice(1);
    }

    const publicIdWithExtension = publicIdParts.join('/');
    return publicIdWithExtension.split('.')[0];
};

router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ imageUrl: req.file.path }); // Cloudinary returns the full URL
});

// CATEGORIES
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/categories', async (req, res) => {
    const category = new Category({ name: req.body.name, description: req.body.description });
    try {
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PRODUCTS
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().populate('category');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/products', async (req, res) => {
    const product = new Product({
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        image: req.body.image,
        quantityOptions: req.body.quantityOptions
    });
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE CATEGORY
router.delete('/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE PRODUCT
router.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product && product.image) {
            const publicId = extractPublicId(product.image);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE PRODUCT
router.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product && product.image && req.body.image && product.image !== req.body.image) {
            const oldPublicId = extractPublicId(product.image);
            if (oldPublicId) {
                await cloudinary.uploader.destroy(oldPublicId);
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                category: req.body.category,
                price: req.body.price,
                image: req.body.image,
                quantityOptions: req.body.quantityOptions
            },
            { new: true }
        );
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
