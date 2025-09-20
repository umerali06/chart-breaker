const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const bcrypt = require('bcryptjs');
const envPath = path.join(__dirname,  '.env');
console.log('Looking for .env at:', envPath);

require('dotenv').config({ path: envPath });
console.log('Loaded ENV:', {
  DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
  CLIENT_URL: process.env.CLIENT_URL || 'NOT SET'
});


const nodemailer = require('nodemailer');

async function verifySMTP() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ SMTP configuration is valid, ready to send emails");
  } catch (err) {
    console.error("❌ SMTP verification failed:", err.message);
  }
}

verifySMTP();


// Initialize database connection after environment variables are loaded
const prisma = require('./database');

async function ensureAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@chartbreaker.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  try {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log(`✅ Admin ensured: ${adminEmail}`);
  } catch (err) {
    console.error('❌ Failed to ensure admin user:', err.message);
  }
}

const authRoutes = require('./routes/auth');
const authVerificationRoutes = require('./routes/auth-verification');
const patientRoutes = require('./routes/patients');
const episodeRoutes = require('./routes/episodes');
const assessmentRoutes = require('./routes/assessments');
const visitRoutes = require('./routes/visits');
const scheduleRoutes = require('./routes/schedules');
const billingRoutes = require('./routes/billing');
const qaRoutes = require('./routes/qa');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const referralRoutes = require('./routes/referrals');
const physicianRoutes = require('./routes/physicians');
const documentRoutes = require('./routes/documents');

const app = express();
const PORT = process.env.PORT || 5000;

// Respect proxy headers on Render/Heroku/NGINX so req.ip is correct
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Basic rate limiting on auth and verification routes
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);
app.use('/api/auth-verification', authLimiter);

// CORS configuration for port 5000
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth-verification', authVerificationRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/qa', qaRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/physicians', physicianRoutes);
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      timestamp: new Date().toISOString()
    }
  });
});

app.listen(PORT, async () => {
  await ensureAdminUser();
  console.log(`Chart Breaker EHR Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
