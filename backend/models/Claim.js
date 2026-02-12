const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
    warranty_id: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    date: { type: String },
    status: { type: String, default: 'pending' },
    notes: { type: String },
    service_center: { type: String },
    estimated_resolution: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Claim', claimSchema);
