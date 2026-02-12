const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    product_name: { type: String, required: true },
    brand: { type: String },
    purchase_date: { type: String },
    warranty_duration_months: { type: Number },
    expiry_date: { type: String },
    provider: { type: String },
    notes: { type: String },
    image_url: { type: String },
    categoryId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Warranty || mongoose.model('Warranty', warrantySchema);
