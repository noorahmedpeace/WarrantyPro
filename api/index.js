require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || 'warranty-pro-secret-key';
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

// Import Models
const User = require('./models/User');
const Warranty = require('./models/Warranty');
const Claim = require('./models/Claim');
const Settings = require('./models/Settings');

const MONGODB_URI = process.env.MONGODB_URI;

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb && mongoose.connection.readyState === 1) {
        console.log('✅ [Serverless] Using cached database connection');
        return cachedDb;
    }

    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI is missing');
        throw new Error('MONGODB_URI is required');
    }

    try {
        // Check if connection is in progress
        if (mongoose.connection.readyState === 2) {
            console.log('⏳ [Serverless] MongoDB connecting...');
            await new Promise(resolve => {
                mongoose.connection.once('connected', resolve);
                mongoose.connection.once('error', resolve);
            });
            if (mongoose.connection.readyState === 1) {
                cachedDb = mongoose.connection;
                return cachedDb;
            }
        }

        console.log('🔄 [Serverless] Establishing new database connection...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 1, // Serverless optimal
            bufferCommands: false,
        });

        cachedDb = mongoose.connection;
        console.log('✅ [Serverless] Connected to MongoDB');
        return cachedDb;
    } catch (err) {
        console.error('❌ [Serverless] DB Error:', err.message);
        throw err;
    }
}

const app = express();

app.use(cors());
app.use(bodyParser.json());

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const dbCheck = asyncHandler(async (req, res, next) => {
    try {
        await connectToDatabase();
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'DATABASE_CONNECTING', retryAfter: 3 });
        }
        next();
    } catch (error) {
        return res.status(503).json({ error: 'DATABASE_ERROR', message: error.message });
    }
});

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const normalizeEmail = (email) => email ? email.trim().toLowerCase() : '';

const getUserIds = async (mongoUserId) => {
    const user = await User.findById(mongoUserId);
    if (!user) return [mongoUserId];

    const ids = [mongoUserId];
    if (user.id && user.id !== mongoUserId && user.id.length < 20) {
        ids.push(user.id);
    }
    return ids;
};

// Health check
app.get('/api/health', asyncHandler(async (req, res) => {
    let dbError = null;
    let dbState = mongoose.connection.readyState;

    // Attempt proactive connection
    try {
        if (MONGODB_URI && dbState !== 1) {
            await connectToDatabase();
            dbState = mongoose.connection.readyState;
        }
    } catch (e) {
        dbError = e.message;
    }

    const statusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        service: 'api/index.js',
        database: {
            configured: !!MONGODB_URI,
            connected: dbState === 1,
            state: statusMap[dbState] || dbState,
            readyState: dbState,
            error: dbError
        },
        environment: {
            isProduction: IS_PRODUCTION,
            hasJWT: !!process.env.JWT_SECRET
        }
    });
}));

// Auth routes
app.use('/api/auth', dbCheck);
app.use('/api/warranties', dbCheck);
app.use('/api/claims', dbCheck);
app.use('/api/settings', dbCheck);
app.use('/api/ocr', require('./routes/ocr')); // OCR routes (no auth required for now)

app.post('/api/auth/register', asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        return res.status(400).json({ message: 'Account already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email: normalizedEmail, password: hashedPassword, name });
    await user.save();

    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
        token,
        user: { id: user._id.toString(), email: user.email, name: user.name }
    });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
        return res.status(401).json({ message: 'No account found. Please sign up.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ message: 'Incorrect password.' });
    }

    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
        token,
        user: { id: user._id.toString(), email: user.email, name: user.name }
    });
}));

app.get('/api/auth/me', authMiddleware, asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({
        id: user._id.toString(),
        email: user.email,
        name: user.name
    });
}));

// Warranties
app.get('/api/warranties', authMiddleware, asyncHandler(async (req, res) => {
    const userIds = await getUserIds(req.userId);
    const warranties = await Warranty.find({ userId: { $in: userIds } }).sort({ createdAt: -1 });
    res.json(warranties);
}));

app.get('/api/warranties/:id', authMiddleware, asyncHandler(async (req, res) => {
    const userIds = await getUserIds(req.userId);
    const warranty = await Warranty.findOne({ _id: req.params.id, userId: { $in: userIds } });
    if (!warranty) return res.status(404).json({ message: 'Warranty not found' });
    res.json(warranty);
}));

app.post('/api/warranties', authMiddleware, asyncHandler(async (req, res) => {
    const warranty = new Warranty({ userId: req.userId, ...req.body });
    await warranty.save();
    res.json(warranty);
}));

app.patch('/api/warranties/:id', authMiddleware, asyncHandler(async (req, res) => {
    const userIds = await getUserIds(req.userId);
    const warranty = await Warranty.findOneAndUpdate(
        { _id: req.params.id, userId: { $in: userIds } },
        { $set: req.body },
        { new: true }
    );
    if (!warranty) return res.status(404).json({ message: 'Warranty not found' });
    res.json(warranty);
}));

app.delete('/api/warranties/:id', authMiddleware, asyncHandler(async (req, res) => {
    const userIds = await getUserIds(req.userId);
    const result = await Warranty.deleteOne({ _id: req.params.id, userId: { $in: userIds } });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Warranty not found' });
    res.json({ message: 'Warranty deleted' });
}));

// Claims
app.post('/api/warranties/:id/claims', authMiddleware, asyncHandler(async (req, res) => {
    const userIds = await getUserIds(req.userId);
    const warranty = await Warranty.findOne({ _id: req.params.id, userId: { $in: userIds } });
    if (!warranty) return res.status(404).json({ message: 'Warranty not found' });

    const claim = new Claim({
        warranty_id: req.params.id,
        title: req.body.title,
        description: req.body.description,
        date: req.body.date || new Date().toISOString(),
        status: 'pending',
        notes: req.body.notes || '',
        service_center: req.body.service_center || '',
        estimated_resolution: req.body.estimated_resolution || ''
    });

    await claim.save();
    res.json(claim);
}));

app.get('/api/warranties/:id/claims', authMiddleware, asyncHandler(async (req, res) => {
    const userIds = await getUserIds(req.userId);
    const warranty = await Warranty.findOne({ _id: req.params.id, userId: { $in: userIds } });
    if (!warranty) return res.status(404).json({ message: 'Warranty not found' });
    const claims = await Claim.find({ warranty_id: req.params.id });
    res.json(claims);
}));

app.get('/api/claims', authMiddleware, asyncHandler(async (req, res) => {
    const userIds = await getUserIds(req.userId);
    const warranties = await Warranty.find({ userId: { $in: userIds } });
    const warrantyIds = warranties.map(w => w._id.toString());
    const claims = await Claim.find({ warranty_id: { $in: warrantyIds } }).sort({ createdAt: -1 });
    res.json(claims);
}));

app.get('/api/claims/:id', authMiddleware, asyncHandler(async (req, res) => {
    const userIds = await getUserIds(req.userId);
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const warranty = await Warranty.findOne({ _id: claim.warranty_id, userId: { $in: userIds } });
    if (!warranty) return res.status(403).json({ message: 'Access denied' });
    res.json(claim);
}));

app.patch('/api/claims/:id', authMiddleware, asyncHandler(async (req, res) => {
    const userIds = await getUserIds(req.userId);
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const warranty = await Warranty.findOne({ _id: claim.warranty_id, userId: { $in: userIds } });
    if (!warranty) return res.status(403).json({ message: 'Access denied' });

    const updated = await Claim.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updated);
}));

// Settings
app.get('/api/settings', authMiddleware, asyncHandler(async (req, res) => {
    const userIds = await getUserIds(req.userId);
    let settings = await Settings.findOne({ userId: { $in: userIds } });
    if (!settings) {
        settings = new Settings({ userId: req.userId });
        await settings.save();
    }
    res.json(settings);
}));

app.patch('/api/settings', authMiddleware, asyncHandler(async (req, res) => {
    const userIds = await getUserIds(req.userId);
    const settings = await Settings.findOneAndUpdate(
        { userId: { $in: userIds } },
        { $set: req.body },
        { new: true, upsert: true }
    );
    res.json(settings);
}));

// Categories
app.get('/api/categories', (req, res) => {
    res.json([
        { id: '1', name: 'Electronics' },
        { id: '2', name: 'Furniture' },
        { id: '3', name: 'Appliances' },
        { id: '4', name: 'Vehicles' },
        { id: '5', name: 'Other' }
    ]);
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// CRITICAL: Export for Vercel serverless
module.exports = app;
