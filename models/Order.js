const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true }
    },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        priceAtOrder: { type: Number }
    }],
    totalAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    linkUsed: { type: mongoose.Schema.Types.ObjectId, ref: 'Link' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
