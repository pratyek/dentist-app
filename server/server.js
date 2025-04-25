// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const setupSocket = require('./src/socket');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'dental-checkup-secret-key';
const MONGO_URL = process.env.MONGO_URL || '';

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from your React app
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Setup Socket.IO
setupSocket(io);

// Connect to MongoDB
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

// Create directory for uploads if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// ======= MONGOOSE MODELS =======

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'dentist'], default: 'patient' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Checkup Request Schema
const checkupRequestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dentist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  reason: { type: String, required: true },
  requestDate: { type: Date, default: Date.now },
  completedDate: { type: Date }
});

const CheckupRequest = mongoose.model('CheckupRequest', checkupRequestSchema);

// Checkup Result Schema
const checkupResultSchema = new mongoose.Schema({
  checkupRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'CheckupRequest', required: true },
  images: [{
    path: { type: String, required: true },
    description: { type: String }
  }],
  diagnosis: { type: String },
  recommendations: { type: String },
  date: { type: Date, default: Date.now }
});

const CheckupResult = mongoose.model('CheckupResult', checkupResultSchema);

// ======= MIDDLEWARE =======

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token verification failed, authorization denied' });
  }
};

// Role middleware
const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Not authorized' });
  }
  next();
};

// ======= ROUTES =======

// Register user
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    const savedUser = await newUser.save();

    // Create and send token
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login user
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for existing user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and send token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
app.get('/api/users/current', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all dentists
app.get('/api/dentists', async (req, res) => {
  try {
    const dentists = await User.find({ role: 'dentist' }).select('-password');
    res.json(dentists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create checkup request
app.post('/api/checkup-requests', auth, checkRole(['patient']), async (req, res) => {
  try {
    const { dentistId, reason } = req.body;

    const newRequest = new CheckupRequest({
      patient: req.user.id,
      dentist: dentistId,
      reason
    });

    const savedRequest = await newRequest.save();
    
    await savedRequest.populate('patient dentist', 'name email');
    
    res.status(201).json(savedRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get checkup requests for patient
app.get('/api/patients/checkup-requests', auth, checkRole(['patient']), async (req, res) => {
  try {
    const checkupRequests = await CheckupRequest.find({ patient: req.user.id })
      .populate('dentist', 'name email')
      .sort({ requestDate: -1 });
    
    res.json(checkupRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get checkup requests for dentist
app.get('/api/dentists/checkup-requests', auth, checkRole(['dentist']), async (req, res) => {
  try {
    const checkupRequests = await CheckupRequest.find({ dentist: req.user.id })
      .populate('patient', 'name email')
      .sort({ requestDate: -1 });
    
    res.json(checkupRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit checkup result
app.post('/api/checkup-results', auth, checkRole(['dentist']), upload.array('images', 5), async (req, res) => {
  try {
    const { checkupRequestId, diagnosis, recommendations, descriptions } = req.body;
    
    // Verify checkup request
    const checkupRequest = await CheckupRequest.findById(checkupRequestId);
    if (!checkupRequest) {
      return res.status(404).json({ message: 'Checkup request not found' });
    }
    
    if (checkupRequest.dentist.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Process descriptions (from JSON string if necessary)
    let parsedDescriptions;
    try {
      parsedDescriptions = typeof descriptions === 'string' ? JSON.parse(descriptions) : descriptions;
    } catch (e) {
      parsedDescriptions = {};
    }
    
    // Create image data array
    const imageData = req.files.map((file, index) => ({
      path: file.path,
      description: parsedDescriptions[index] || ''
    }));
    
    // Create new checkup result
    const newResult = new CheckupResult({
      checkupRequest: checkupRequestId,
      images: imageData,
      diagnosis,
      recommendations
    });
    
    const savedResult = await newResult.save();
    
    // Update checkup request status
    checkupRequest.status = 'completed';
    checkupRequest.completedDate = Date.now();
    await checkupRequest.save();
    
    res.status(201).json(savedResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get checkup result for a specific request
app.get('/api/checkup-results/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Find the checkup request
    const checkupRequest = await CheckupRequest.findById(requestId);
    if (!checkupRequest) {
      return res.status(404).json({ message: 'Checkup request not found' });
    }
    
    // Check authorization
    if (
      checkupRequest.patient.toString() !== req.user.id && 
      checkupRequest.dentist.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get the result
    const result = await CheckupResult.findOne({ checkupRequest: requestId });
    if (!result) {
      return res.status(404).json({ message: 'No result found for this checkup' });
    }
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});