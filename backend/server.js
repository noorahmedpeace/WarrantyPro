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

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
      console.error('❌ CRITICAL: MongoDB connection error:', err);
      if (IS_PRODUCTION) {
        console.error('Terminating due to database connection failure in production.');
        process.exit(1);
      }
    });
} else if (IS_PRODUCTION) {
  console.error('❌ FATAL ERROR: MONGODB_URI is missing!');
  console.error('Production deployment REQUIRE a cloud database. Ephemeral memory fallback is disabled.');
  // In serverless, we can't always process.exit(1) effectively to block start,
  // but we can throw an error to block the request.
  throw new Error('MONGODB_URI environment variable is required in production.');
} else {
  console.warn('⚠️ WARNING: MONGODB_URI not found. Running in LOCAL mode (Data will be lost on restart).');
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

// Global error handler for JSON responses (PREVENTS HTML ERROR PAGES)
const errorHandler = (err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: IS_PRODUCTION ? 'A server error occurred' : err.message
  });
};

// Root route for health check
app.get('/', (req, res) => {
  res.json({ message: 'WarrantyPro Backend is running', status: 'online', mode: MONGODB_URI ? 'cloud' : 'local' });
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock Data
// Load Data
let users = loadData('users.json', []);
let warranties = loadData('warranties.json', []);
let claims = loadData('claims.json', []);
let settings = loadData('settings.json', {
  'temp-user-id': {
    email_notifications: true,
    alert_days_before: 30
  }
});

let categories = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Furniture' },
  { id: '3', name: 'Appliances' },
  { id: '4', name: 'Vehicles' },
  { id: '5', name: 'Other' }
];
let alerts = [];

// Utility: Global Async Error Handler (Prevents unhandled promise rejections)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware: Database Readiness Check
const dbCheck = (req, res, next) => {
  if (mongoose.connection.readyState !== 1 && IS_PRODUCTION) {
    console.warn(`⚠️ Database not ready (State: ${mongoose.connection.readyState}). Waiting...`);
    // In serverless, we might just want to wait a bit or return 503
    return res.status(503).json({
      message: 'Database is still connecting. Please refresh in a moment.',
      retryAfter: 2
    });
  }
  next();
};

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

// Global Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(dbCheck); // Ensure DB is ready for all subsequent routes

// Helper to normalize email
const normalizeEmail = (email) => email ? email.trim().toLowerCase() : '';

// Routes

// Authentication
app.post('/auth/register', asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const normalizedEmail = normalizeEmail(email);

  console.log('Registering user:', normalizedEmail);

  // Check if user exists (Case-insensitive)
  let existingUser;
  if (MONGODB_URI) {
    existingUser = await User.findOne({ email: normalizedEmail });
  } else {
    existingUser = users.find(u => normalizeEmail(u.email) === normalizedEmail);
  }

  if (existingUser) {
    return res.status(400).json({ message: 'Account already exists. Please log in.' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user object
  let user;
  if (MONGODB_URI) {
    user = new User({ email: normalizedEmail, password: hashedPassword, name });
    await user.save();
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

  // Create token
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

  // Find user (Case-insensitive)
  let user;
  if (MONGODB_URI) {
    user = await User.findOne({ email: normalizedEmail });
  } else {
    user = users.find(u => normalizeEmail(u.email) === normalizedEmail);
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Check password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Create token
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

// Routes

// Warranties
app.get('/warranties', authMiddleware, asyncHandler(async (req, res) => {
  if (MONGODB_URI) {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userIds = [req.userId];
    // CRITICAL: Handle the legacy JSON 'id' field that was migrated into the User document
    if (user.id && user.id !== req.userId && user.id.length < 20) {
      userIds.push(user.id);
    }
    // Also check the user metadata field for safety
    if (user._doc && user._doc.id && !userIds.includes(user._doc.id)) {
      userIds.push(user._doc.id);
    }

    console.log(`Fetching warranties for user IDs: ${userIds.join(', ')}`);
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
    const user = await User.findById(req.userId);
    const userIds = [req.userId];
    if (user && user._doc && user._doc.id && user._doc.id !== req.userId) {
      userIds.push(user._doc.id);
    }
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
    const updated = await Warranty.findOneAndUpdate(
      { _id: id, userId: req.userId },
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
    const result = await Warranty.deleteOne({ _id: id, userId: req.userId });
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
    const warranty = await Warranty.findOne({ _id: id, userId: req.userId });
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
    const warranty = await Warranty.findOne({ _id: id, userId: req.userId });
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
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userIds = [req.userId];
    if (user.id && user.id !== req.userId && user.id.length < 20) {
      userIds.push(user.id);
    }
    if (user._doc && user._doc.id && !userIds.includes(user._doc.id)) {
      userIds.push(user._doc.id);
    }

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
    const claim = await Claim.findById(id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    const warranty = await Warranty.findOne({ _id: claim.warranty_id, userId: req.userId });
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
    const claim = await Claim.findById(id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    const warranty = await Warranty.findOne({ _id: claim.warranty_id, userId: req.userId });
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
app.get('/categories', (req, res) => {
  res.json(categories);
});

// Alerts
app.get('/alerts', (req, res) => {
  res.json(alerts);
});

app.patch('/alerts/:id/read', (req, res) => {
  // Mock implementation
  res.json({ success: true });
});

app.patch('/alerts/:id/dismiss', (req, res) => {
  // Mock implementation
  res.json({ success: true });
});

app.post('/alerts/generate', (req, res) => {
  // Mock implementation to generate some alerts
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


// Settings / User Preferences
app.get('/settings', authMiddleware, asyncHandler(async (req, res) => {
  if (MONGODB_URI) {
    let userSettings = await Settings.findOne({ userId: req.userId });
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
    const updated = await Settings.findOneAndUpdate(
      { userId: req.userId },
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

// File Upload Configuration
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
if (!IS_PRODUCTION && !MONGODB_URI) {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // On Vercel, we can only write to /tmp
    cb(null, IS_PRODUCTION ? '/tmp' : UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

// Serve static files (uploads)
if (!IS_PRODUCTION) {
  app.use('/uploads', express.static(UPLOADS_DIR));
}

// ... OCR and other routes ...

// FINAL ERROR HANDLER (MUST BE LAST)
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
