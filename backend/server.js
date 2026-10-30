require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

const app = express();

// Connect to Database
connectDB();

// Global Middlewares
app.use(cors({
  origin: ['http://localhost:19006', 'http://localhost:8081', 'http://172.20.10.2:19006', 'http://172.20.10.2:8081', 'exp://172.20.10.2:19000', 'exp://172.20.10.2:19001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  const limit = req.path.startsWith('/api/uploads/') ? '12mb' : '100kb';
  express.json({ limit })(req, res, next);
});

// Basic test route
app.get('/', (req, res) => {
  res.send('SmartCampus Backend is running!');
});

// Auth Routes
app.use('/api/auth', require('./src/routes/authRoutes'));

// Profile Routes
app.use('/api/profile', require('./src/routes/profileRoutes'));

// Upload & Admin Routes
app.use('/api/uploads', require('./src/routes/uploadRoutes'));
app.use('/api/admin/listings', require('./src/routes/adminListingRoutes'));

// Error Handling Middleware (must be after all routes)
app.use(notFound);
app.use(errorHandler);

// Port configuration and server listening
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
