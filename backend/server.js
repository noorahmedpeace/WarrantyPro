require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const JWT_SECRET = process.env.JWT_SECRET || 'warranty-pro-secret-key-change-in-production';
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

// Import Models
const User = require('./models/User');
const Warranty = require('./models/Warranty');
const Claim = require('./models/Claim');
const Settings = require('./models/Settings');

// ============ SERVERLESS-OPTIMIZED MONGODB CONNECTION ============
const MONGODB_URI = process.env.MONGODB_URI;

// Cache connection across serverless invocations
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached database connection');
    return cachedDb;
  }

  if (!MONGODB_URI) {
    if (IS_PRODUCTION) {
      throw new Error('❌ FATAL: MONGODB_URI is required in production');
    }
    console.warn('⚠️ WARNING: MONGODB_URI not found. Running in LOCAL mode');
    return null;
  }

  try {
    console.log('🔄 Establishing new database connection...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    cachedDb = mongoose.connection;
    console.log('✅ Connected to MongoDB Atlas (Serverless Mode)');
    return cachedDb;
  } catch (err) {
    console.error('❌ CRITICAL: MongoDB connection error:', err);
    if (IS_PRODUCTION) {
      throw new Error('Database connection failed');
    }
    return null;
  }
}

// Secret validation
if (IS_PRODUCTION && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'warranty-pro-secret-key-change-in-production')) {
  console.error('❌ FATAL ERROR: Secure JWT_SECRET is required in production.');
  throw new Error('Secure JWT_SECRET environment variable is required in production.');
}

// Ensure data directory exists (ONLY if not in production or if needed for local fallback)
if (!IS_PRODUCTION && !MONGODB_URI) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Helper to load data (with safety for production)
const loadData = (filename, defaultData) => {
  if (IS_PRODUCTION || MONGODB_URI) return defaultData;
  const filePath = path.join(DATA_DIR, filename);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`Error parsing ${filename}`, e);
      return defaultData;
    }
  }
  return defaultData;
};

// Helper to save data (with safety for production)
const saveData = (filename, data) => {
  if (IS_PRODUCTION || MONGODB_URI) return;
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving ${filename}:`, error);
  }
};

// Mock Data
let users = loadData('users.json', []);
let warranties = loadData('warranties.json', []);
let claims = loadData('claims.json', []);
let settings = loadData('settings.json', {});

let categories = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Furniture' },
  { id: '3', name: 'Appliances' },
  { id: '4', name: 'Vehicles' },
  { id: '5', name: 'Other' }
];
let alerts = [];

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Utility: Global Async Error Handler (Prevents unhandled promise rejections)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware: Database Connection Checker (Serverless-Optimized)
const dbCheck = asyncHandler(async (req, res, next) => {
  if (!MONGODB_URI) {
    // Local mode, no DB check needed
    return next();
  }

  try {
    await connectToDatabase();
    if (mongoose.connection.readyState !== 1) {
      console.warn(`⚠️ [DB Check] Database not ready (State: ${mongoose.connection.readyState})`);
      return res.status(503).json({
        error: 'DATABASE_CONNECTING',
        message: 'Database is connecting. Please retry in a moment.',
        retryAfter: 3
      });
    }
    next();
  } catch (error) {
    console.error('❌ [DB Check] Connection error:', error);
    return res.status(503).json({
      error: 'DATABASE_ERROR',
      message: 'Database connection failed. Please try again.',
      retryAfter: 5
    });
  }
});

// Auth Middleware
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
    console.error("JWT Verification failed:", error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Helper to normalize email
const normalizeEmail = (email) => email ? email.trim().toLowerCase() : '';

// Helper to get all associated user IDs (legacy + new)
const getUserIds = async (mongoUserId) => {
  if (!MONGODB_URI) return [mongoUserId];
  const user = await User.findById(mongoUserId);
  if (!user) return [mongoUserId];

  const ids = [mongoUserId];
  if (user.id && user.id !== mongoUserId && user.id.length < 20) {
    ids.push(user.id);
  }
  if (user._doc && user._doc.id && !ids.includes(user._doc.id)) {
    ids.push(user._doc.id);
  }
  return ids;
};

// ============ DIAGNOSTIC ENDPOINT ============
app.get('/api/health', asyncHandler(async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: IS_PRODUCTION ? 'production' : 'development',
    database: {
      configured: !!MONGODB_URI,
      status: dbStatusMap[dbStatus] || 'unknown',
      readyState: dbStatus
    },
    jwt: {
      configured: !!process.env.JWT_SECRET,
      isSecure: process.env.JWT_SECRET !== 'warranty-pro-secret-key-change-in-production'
    }
  });
}));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'WarrantyPro Backend is running',
    status: 'online',
    mode: MONGODB_URI ? 'cloud' : 'local'
  });
});

// Apply DB check BEFORE all data routes
app.use('/auth', dbCheck);
app.use('/warranties', dbCheck);
app.use('/claims', dbCheck);
app.use('/settings', dbCheck);

// Authentication
app.post('/auth/register', asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const normalizedEmail = normalizeEmail(email);

  console.log('📝 Registering user:', normalizedEmail);

  let existingUser;
  if (MONGODB_URI) {
    existingUser = await User.findOne({ email: normalizedEmail });
  } else {
    existingUser = users.find(u => normalizeEmail(u.email) === normalizedEmail);
  }

  if (existingUser) {
    return res.status(400).json({ message: 'Account already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let user;
  if (MONGODB_URI) {
    user = new User({ email: normalizedEmail, password: hashedPassword, name });
    await user.save();
    console.log('✅ User saved to MongoDB:', user._id);
  } else {
    user = {
      id: Date.now().toString(),
      email: normalizedEmail,
      password: hashedPassword,
      name,
      provider: 'local',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    saveData('users.json', users);
  }

  const userId = user._id ? user._id.toString() : user.id;
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      id: userId,
      email: user.email,
      name: user.name
    }
  });
}));

app.post('/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  console.log('🔐 Login attempt for:', normalizedEmail);

  let user;
  if (MONGODB_URI) {
    user = await User.findOne({ email: normalizedEmail });
  } else {
    user = users.find(u => normalizeEmail(u.email) === normalizedEmail);
  }

  if (!user) {
    return res.status(401).json({ message: 'No account found. Please sign up.' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Incorrect password.' });
  }

  const userId = user._id ? user._id.toString() : user.id;
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

  console.log('✅ Login successful for:', normalizedEmail);

  res.json({
    token,
    user: {
      id: userId,
      email: user.email,
      name: user.name
    }
  });
}));

app.get('/auth/me', authMiddleware, asyncHandler(async (req, res) => {
  let user;
  if (MONGODB_URI) {
    user = await User.findById(req.userId);
  } else {
    user = users.find(u => u.id === req.userId);
  }

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user._id ? user._id.toString() : user.id,
    email: user.email,
    name: user.name
  });
}));

// Warranties
app.get('/warranties', authMiddleware, asyncHandler(async (req, res) => {
  if (MONGODB_URI) {
    const userIds = await getUserIds(req.userId);
    console.log(`[Warranties] Fetching for user IDs: ${userIds.join(', ')}`);
    const userWarranties = await Warranty.find({ userId: { $in: userIds } }).sort({ createdAt: -1 });
    res.json(userWarranties);
  } else {
    const userWarranties = warranties.filter(w => w.userId === req.userId);
    res.json(userWarranties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }
}));

app.get('/warranties/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (MONGODB_URI) {
    const userIds = await getUserIds(req.userId);
    const warranty = await Warranty.findOne({ _id: id, userId: { $in: userIds } });
    if (!warranty) return res.status(404).json({ message: 'Warranty not found' });
    res.json(warranty);
  } else {
    const warranty = warranties.find(w => w.id === id && w.userId === req.userId);
    if (!warranty) return res.status(404).json({ message: 'Warranty not found' });
    res.json(warranty);
  }
}));

app.post('/warranties', authMiddleware, asyncHandler(async (req, res) => {
  if (MONGODB_URI) {
    const newWarranty = new Warranty({
      userId: req.userId,
      ...req.body
    });
    await newWarranty.save();
    console.log('✅ Warranty saved:', newWarranty._id);
    res.json(newWarranty);
  } else {
    const newWarranty = {
      id: Date.now().toString(),
      userId: req.userId,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    warranties.push(newWarranty);
    saveData('warranties.json', warranties);
    res.json(newWarranty);
  }
}));

app.patch('/warranties/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (MONGODB_URI) {
    const userIds = await getUserIds(req.userId);
    const updated = await Warranty.findOneAndUpdate(
      { _id: id, userId: { $in: userIds } },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Warranty not found' });
    res.json(updated);
  } else {
    const index = warranties.findIndex(w => w.id === id && w.userId === req.userId);
    if (index !== -1) {
      warranties[index] = { ...warranties[index], ...req.body };
      saveData('warranties.json', warranties);
      res.json(warranties[index]);
    } else {
      res.status(404).json({ message: 'Warranty not found' });
    }
  }
}));

app.delete('/warranties/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (MONGODB_URI) {
    const userIds = await getUserIds(req.userId);
    const result = await Warranty.deleteOne({ _id: id, userId: { $in: userIds } });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Warranty not found' });
    res.json({ message: 'Warranty deleted' });
  } else {
    const initialLength = warranties.length;
    warranties = warranties.filter(w => !(w.id === id && w.userId === req.userId));
    if (warranties.length === initialLength) {
      return res.status(404).json({ message: 'Warranty not found' });
    }
    saveData('warranties.json', warranties);
    res.json({ message: 'Warranty deleted' });
  }
}));

// Claims
app.post('/warranties/:id/claims', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (MONGODB_URI) {
    const userIds = await getUserIds(req.userId);
    const warranty = await Warranty.findOne({ _id: id, userId: { $in: userIds } });
    if (!warranty) return res.status(404).json({ message: 'Warranty not found' });

    const newClaim = new Claim({
      warranty_id: id,
      title: req.body.title,
      description: req.body.description || req.body.issue_description,
      date: req.body.date || new Date().toISOString(),
      status: 'pending',
      notes: req.body.notes || '',
      service_center: req.body.service_center || '',
      estimated_resolution: req.body.estimated_resolution || ''
    });

    await newClaim.save();
    res.json(newClaim);
  } else {
    const warranty = warranties.find(w => w.id === id && w.userId === req.userId);
    if (!warranty) return res.status(404).json({ message: 'Warranty not found' });

    const newClaim = {
      id: Date.now().toString(),
      warranty_id: id,
      title: req.body.title,
      description: req.body.description || req.body.issue_description,
      date: req.body.date || new Date().toISOString(),
      status: 'pending',
      notes: req.body.notes || '',
      service_center: req.body.service_center || '',
      estimated_resolution: req.body.estimated_resolution || ''
    };

    claims.push(newClaim);
    saveData('claims.json', claims);
    res.json(newClaim);
  }
}));

app.get('/warranties/:id/claims', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (MONGODB_URI) {
    const userIds = await getUserIds(req.userId);
    const warranty = await Warranty.findOne({ _id: id, userId: { $in: userIds } });
    if (!warranty) return res.status(404).json({ message: 'Warranty not found' });
    const warrantyClaims = await Claim.find({ warranty_id: id });
    res.json(warrantyClaims);
  } else {
    const warranty = warranties.find(w => w.id === id && w.userId === req.userId);
    if (!warranty) return res.status(404).json({ message: 'Warranty not found' });
    const warrantyClaims = claims.filter(c => c.warranty_id === id);
    res.json(warrantyClaims);
  }
}));

app.get('/claims', authMiddleware, asyncHandler(async (req, res) => {
  if (MONGODB_URI) {
    const userIds = await getUserIds(req.userId);
    const userWarranties = await Warranty.find({ userId: { $in: userIds } });
    const userWarrantyIds = userWarranties.map(w => w._id.toString());
    const userClaims = await Claim.find({ warranty_id: { $in: userWarrantyIds } }).sort({ createdAt: -1 });
    res.json(userClaims);
  } else {
    const userWarrantyIds = warranties.filter(w => w.userId === req.userId).map(w => w.id);
    const userClaims = claims.filter(c => userWarrantyIds.includes(c.warranty_id));
    res.json(userClaims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }
}));

app.get('/claims/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (MONGODB_URI) {
    const userIds = await getUserIds(req.userId);
    const claim = await Claim.findById(id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const warranty = await Warranty.findOne({ _id: claim.warranty_id, userId: { $in: userIds } });
    if (!warranty) return res.status(403).json({ message: 'Access denied' });
    res.json(claim);
  } else {
    const claim = claims.find(c => c.id === id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    const warranty = warranties.find(w => w.id === claim.warranty_id && w.userId === req.userId);
    if (!warranty) return res.status(403).json({ message: 'Access denied' });
    res.json(claim);
  }
}));

app.patch('/claims/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (MONGODB_URI) {
    const userIds = await getUserIds(req.userId);
    const claim = await Claim.findById(id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const warranty = await Warranty.findOne({ _id: claim.warranty_id, userId: { $in: userIds } });
    if (!warranty) return res.status(403).json({ message: 'Access denied' });

    const updated = await Claim.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    res.json(updated);
  } else {
    const index = claims.findIndex(c => c.id === id);
    if (index !== -1) {
      const warranty = warranties.find(w => w.id === claims[index].warranty_id && w.userId === req.userId);
      if (!warranty) return res.status(403).json({ message: 'Access denied' });
      claims[index] = { ...claims[index], ...req.body };
      saveData('claims.json', claims);
      res.json(claims[index]);
    } else {
      res.status(404).json({ message: 'Claim not found' });
    }
  }
}));

// Categories
app.get('/categories', asyncHandler(async (req, res) => {
  res.json(categories);
}));

// Settings
app.get('/settings', authMiddleware, asyncHandler(async (req, res) => {
  if (MONGODB_URI) {
    const userIds = await getUserIds(req.userId);
    let userSettings = await Settings.findOne({ userId: { $in: userIds } });
    if (!userSettings) {
      userSettings = new Settings({ userId: req.userId });
      await userSettings.save();
    }
    res.json(userSettings);
  } else {
    const userSettings = settings[req.userId] || {
      alert_days_before: 30,
      email_notifications: true,
      push_notifications: false,
      theme: 'dark',
      language: 'en'
    };
    res.json(userSettings);
  }
}));

app.patch('/settings', authMiddleware, asyncHandler(async (req, res) => {
  if (MONGODB_URI) {
    const userIds = await getUserIds(req.userId);
    const updated = await Settings.findOneAndUpdate(
      { userId: { $in: userIds } },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(updated);
  } else {
    settings[req.userId] = { ...settings[req.userId], ...req.body };
    saveData('settings.json', settings);
    res.json(settings[req.userId]);
  }
}));

// OCR and Alerts (minimal routes)
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
if (!IS_PRODUCTION && !MONGODB_URI) {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IS_PRODUCTION ? '/tmp' : UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

app.get('/ocr/images/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'Image not found' });
  }
});

app.post('/ocr/scan', authMiddleware, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  res.json({
    success: true,
    data: {
      product_name: "Sample Product",
      brand: "Example Brand",
      purchase_date: new Date().toISOString().split('T')[0],
      warranty_period: "1 year",
      serial_number: "SN-" + Math.random().toString(36).substr(2, 9).toUpperCase()
    },
    imageUrl: `/api/ocr/images/${req.file.filename}`
  });
}));

app.get('/alerts', (req, res) => {
  res.json(alerts);
});

app.patch('/alerts/:id/read', (req, res) => {
  res.json({ success: true });
});

app.patch('/alerts/:id/dismiss', (req, res) => {
  res.json({ success: true });
});

app.post('/alerts/generate', (req, res) => {
  const newAlert = {
    id: Date.now().toString(),
    severity: 'WARNING',
    message: 'Mock Alert: Warranty expiring soon',
    read: false,
    date: new Date().toISOString()
  };
  alerts.push(newAlert);
  res.json(newAlert);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: IS_PRODUCTION ? 'A server error occurred' : err.message
  });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
