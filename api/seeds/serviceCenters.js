const mongoose = require('mongoose');
const ServiceCenter = require('../models/ServiceCenter');

const sampleCenters = [
    {
        name: "Samsung Service Plaza",
        brand: "Samsung",
        address: "Shop #12, Star City Mall, Saddar",
        city: "Karachi",
        phone: "+92-21-34567890",
        email: "support.khi@samsung.com",
        coordinates: { lat: 24.8607, lng: 67.0011 },
        rating: 4.5,
        categories: ["Electronics", "Mobile", "Appliances"]
    },
    {
        name: "Apple Authorized Service Provider - Future Tech",
        brand: "Apple",
        address: "Dolmen Mall Clifton, Ground Floor",
        city: "Karachi",
        phone: "+92-21-111-222-333",
        email: "support@futuretech.pk",
        coordinates: { lat: 24.8138, lng: 67.0312 },
        rating: 4.8,
        categories: ["Electronics", "Computers"]
    },
    {
        name: "Haier Service Center",
        brand: "Haier",
        address: "Gulshan-e-Iqbal Block 13-D",
        city: "Karachi",
        phone: "+92-21-34987654",
        coordinates: { lat: 24.9180, lng: 67.0971 },
        rating: 4.2,
        categories: ["Appliances"]
    },
    {
        name: "Dell Official Service Center",
        brand: "Dell",
        address: "Techno City Mall, I.I. Chundrigar Road",
        city: "Karachi",
        phone: "+92-21-32212222",
        coordinates: { lat: 24.8532, lng: 67.0056 },
        rating: 4.0,
        categories: ["Computers", "Electronics"]
    },
    {
        name: "Sony Service Center",
        brand: "Sony",
        address: "Zamzama Boulevard, DHA Phase 5",
        city: "Karachi",
        phone: "+92-21-35861234",
        coordinates: { lat: 24.8055, lng: 67.0298 },
        rating: 4.4,
        categories: ["Electronics", "Audio", "Video"]
    }
];

async function seedServiceCenters() {
    try {
        const count = await ServiceCenter.countDocuments();
        if (count === 0) {
            await ServiceCenter.insertMany(sampleCenters);
            console.log('✅ Service centers seeded successfully');
        } else {
            console.log('ℹ️ Service centers already exist, skipping seed');
        }
    } catch (error) {
        console.error('❌ Failed to seed service centers:', error);
    }
}

module.exports = seedServiceCenters;
