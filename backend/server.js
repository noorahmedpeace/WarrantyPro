const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Helper to load data
const loadData = (filename, defaultData) => {
  const filePath = path.join(DATA_DIR, filename);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return defaultData;
};

// Helper to save data
const saveData = (filename, data) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving ${filename}:`, error);
  }
};
const JWT_SECRET = 'warranty-pro-secret-key-change-in-production'; // In production, use environment variable

// Root route for health check
app.get('/', (req, res) => {
  res.send('WarrantyPro Backend is running successfully!');
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
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes

// Authentication
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    console.log('Registering user:', email);

    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      provider: 'local',
      createdAt: new Date().toISOString()
    };

    users.push(user);
    saveData('users.json', users);

    // Create token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name
  });
});

// Routes

// Warranties
app.get('/warranties', authMiddleware, (req, res) => {
  const userWarranties = warranties.filter(w => w.userId === req.userId);
  res.json(userWarranties);
});

app.get('/warranties/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const warranty = warranties.find(w => w.id === id && w.userId === req.userId);
  if (!warranty) {
    return res.status(404).json({ message: 'Warranty not found' });
  }
  res.json(warranty);
});

app.post('/warranties', authMiddleware, (req, res) => {
  const newWarranty = {
    id: Date.now().toString(),
    userId: req.userId,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  warranties.push(newWarranty);
  saveData('warranties.json', warranties);
  res.json(newWarranty);
});

app.patch('/warranties/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const index = warranties.findIndex(w => w.id === id && w.userId === req.userId);
  if (index !== -1) {
    warranties[index] = { ...warranties[index], ...req.body };
    saveData('warranties.json', warranties);
    res.json(warranties[index]);
  } else {
    res.status(404).json({ message: 'Warranty not found' });
  }
});

app.delete('/warranties/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const initialLength = warranties.length;
  warranties = warranties.filter(w => !(w.id === id && w.userId === req.userId));
  if (warranties.length === initialLength) {
    return res.status(404).json({ message: 'Warranty not found' });
  }
  res.json({ message: 'Warranty deleted' });
  saveData('warranties.json', warranties);
});

// Claims
app.post('/warranties/:id/claims', authMiddleware, (req, res) => {
  const { id } = req.params;
  const warranty = warranties.find(w => w.id === id && w.userId === req.userId);
  if (!warranty) {
    return res.status(404).json({ message: 'Warranty not found' });
  }

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
});

app.get('/warranties/:id/claims', authMiddleware, (req, res) => {
  const { id } = req.params;
  const warranty = warranties.find(w => w.id === id && w.userId === req.userId);
  if (!warranty) {
    return res.status(404).json({ message: 'Warranty not found' });
  }
  const warrantyClaims = claims.filter(c => c.warranty_id === id);
  res.json(warrantyClaims);
});

app.get('/claims', authMiddleware, (req, res) => {
  const userWarrantyIds = warranties.filter(w => w.userId === req.userId).map(w => w.id);
  const userClaims = claims.filter(c => userWarrantyIds.includes(c.warranty_id));
  res.json(userClaims);
});

app.get('/claims/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const claim = claims.find(c => c.id === id);
  if (!claim) {
    return res.status(404).json({ message: 'Claim not found' });
  }
  // Verify claim belongs to user's warranty
  const warranty = warranties.find(w => w.id === claim.warranty_id && w.userId === req.userId);
  if (!warranty) {
    return res.status(403).json({ message: 'Access denied' });
  }
  res.json(claim);
});

app.patch('/claims/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const index = claims.findIndex(c => c.id === id);
  if (index !== -1) {
    // Verify claim belongs to user's warranty
    const warranty = warranties.find(w => w.id === claims[index].warranty_id && w.userId === req.userId);
    if (!warranty) {
      return res.status(403).json({ message: 'Access denied' });
    }
    claims[index] = { ...claims[index], ...req.body };
    saveData('claims.json', claims);
    res.json(claims[index]);
  } else {
    res.status(404).json({ message: 'Claim not found' });
  }
});

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
app.get('/settings', authMiddleware, (req, res) => {
  const userSettings = settings[req.userId] || {
    alert_days_before: 30,
    email_notifications: true,
    push_notifications: false,
    theme: 'dark',
    language: 'en'
  };
  res.json(userSettings);
});

app.patch('/settings', authMiddleware, (req, res) => {
  settings[req.userId] = { ...settings[req.userId], ...req.body };
  saveData('settings.json', settings);
  res.json(settings[req.userId]);
});

// File Upload Configuration
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

// Serve static files (uploads)
app.use('/uploads', express.static(UPLOADS_DIR));

// OCR (Mock)
app.post('/ocr/scan', upload.single('file'), (req, res) => {
  // Return random mock data for demonstration
  const mockData = {
    product_name: 'Scanned Product ' + Math.floor(Math.random() * 100),
    brand: 'Mock Brand',
    purchase_date: new Date().toISOString().split('T')[0],
    warranty_duration_months: 12
  };
  setTimeout(() => res.json(mockData), 1500); // Simulate delay
});

// File Upload Endpoint
app.post('/warranties/:id/files', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { id } = req.params;
  const warranty = warranties.find(w => w.id === id && w.userId === req.userId);

  if (!warranty) {
    // Clean up file if warranty not found
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ message: 'Warranty not found' });
  }

  // Save file path to warranty (optional, or just return path)
  // Here we just return the path so frontend can add it to warranty via PATCH if needed, 
  // or we can append it here.
  // Let's assume frontend will use the returned path.

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ message: 'File uploaded successfully', fileUrl: fileUrl });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
