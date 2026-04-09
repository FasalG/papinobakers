const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    linkId: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    note: { type: String } // Optional note for this link (e.g. for a specific customer)
}, { timestamps: true });

module.exports = mongoose.model('Link', LinkSchema);
