const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: String }, // Path to the image
    price: { type: Number, default: 0 },
    quantityOptions: { type: [Number], default: [1, 2, 3, 4, 5, 10, 20] } // Selectable quantities
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
