require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import Models
const User = require('./models/User');
const Warranty = require('./models/Warranty');
const Claim = require('./models/Claim');
const Settings = require('./models/Settings');

const DATA_DIR = path.join(__dirname, 'data');
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI not found in .env file');
    process.exit(1);
}

const loadData = (filename) => {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return [];
};

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB Atlas...');

        // 1. Migrate Users
        const localUsers = loadData('users.json');
        console.log(`Migrating ${localUsers.length} users...`);
        for (const u of localUsers) {
            await User.updateOne({ email: u.email }, { $set: u }, { upsert: true });
        }

        // 2. Migrate Warranties
        const localWarranties = loadData('warranties.json');
        console.log(`Migrating ${localWarranties.length} warranties...`);
        for (const w of localWarranties) {
            // Create a copy without the old ID if it's not a valid Mongo ID
            // But keeping old ID as string might be safer for relations
            await Warranty.updateOne({ userId: w.userId, product_name: w.product_name }, { $set: w }, { upsert: true });
        }

        // 3. Migrate Claims
        const localClaims = loadData('claims.json');
        console.log(`Migrating ${localClaims.length} claims...`);
        for (const c of localClaims) {
            await Claim.updateOne({ warranty_id: c.warranty_id, title: c.title }, { $set: c }, { upsert: true });
        }

        // 4. Migrate Settings
        const localSettings = loadData('settings.json');
        console.log(`Migrating settings...`);
        for (const userId in localSettings) {
            await Settings.updateOne({ userId }, { $set: { userId, ...localSettings[userId] } }, { upsert: true });
        }

        console.log('MIGRATION COMPLETE! ✅');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
