const mongoose = require('mongoose');
const ServiceCenter = require('../_models/ServiceCenter');

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
    },
    {
        name: "Dawlance Reliable Service Center",
        brand: "Dawlance",
        address: "Plot # 12, Sector 15, Korangi Industrial Area",
        city: "Karachi",
        phone: "+92-21-111-11-7359",
        coordinates: { lat: 24.8300, lng: 67.1200 },
        rating: 4.6,
        categories: ["Appliances", "Refrigerators", "Washing Machines"]
    },
    {
        name: "Orient Electronics Service",
        brand: "Orient",
        address: "Shahrah-e-Faisal, Near Nursery",
        city: "Karachi",
        phone: "+92-21-34533333",
        coordinates: { lat: 24.8660, lng: 67.0600 },
        rating: 4.3,
        categories: ["Appliances", "LED TVs"]
    },
    {
        name: "Kenwood & Homage Service Center",
        brand: "Kenwood",
        address: "Lucky Star, Saddar",
        city: "Karachi",
        phone: "+92-21-35688888",
        coordinates: { lat: 24.8580, lng: 67.0250 },
        rating: 4.5,
        categories: ["Appliances", "Kitchen"]
    },
    {
        name: "TCL Service Center",
        brand: "TCL",
        address: "Gulistan-e-Jauhar, Block 12",
        city: "Karachi",
        phone: "+92-21-34011111",
        coordinates: { lat: 24.9150, lng: 67.1300 },
        rating: 4.2,
        categories: ["Electronics", "LED TVs"]
    },
    {
        name: "LG Authorized Service",
        brand: "LG",
        address: "DHA Phase 6, Bukhari Commercial",
        city: "Karachi",
        phone: "+92-21-35844444",
        coordinates: { lat: 24.8100, lng: 67.0500 },
        rating: 4.7,
        categories: ["Electronics", "Appliances"]
    }
];

async function seedServiceCenters() {
    try {
        const count = await ServiceCenter.countDocuments();
        // If empty OR missing new data (simple check: count < sample size), re-seed
        if (count < sampleCenters.length) {
            console.log(`ℹ️ Database has ${count} centers, expected ${sampleCenters.length}. Re-seeding...`);
            await ServiceCenter.deleteMany({}); // Clear old data to ensure clean slate
            await ServiceCenter.insertMany(sampleCenters);
            console.log('✅ Service centers seeded successfully');
        } else {
            console.log('ℹ️ Service centers up to date, skipping seed');
        }
    } catch (error) {
        console.error('❌ Failed to seed service centers:', error);
    }
}

module.exports = seedServiceCenters;
module.exports.sampleCenters = sampleCenters;
