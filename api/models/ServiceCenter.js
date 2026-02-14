const mongoose = require('mongoose');

const serviceCenterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        index: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
        index: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    website: String,
    coordinates: {
        lat: Number,
        lng: Number
    },
    openingHours: {
        type: String, // e.g., "Mon-Sat: 9AM - 6PM"
        default: "Mon-Sat: 9:00 AM - 6:00 PM"
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    authorized: {
        type: Boolean,
        default: true
    },
    categories: [String] // e.g., ["Electronics", "Appliances"]
}, {
    timestamps: true
});

// Index for geospatial queries (future proofing)
serviceCenterSchema.index({ brand: 1, city: 1 });

module.exports = mongoose.models.ServiceCenter || mongoose.model('ServiceCenter', serviceCenterSchema);
