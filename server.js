const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Routes
const userRoutes = require('./server/routes/userRoutes');
const paymentRoutes = require('./server/routes/paymentRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
// Use the complete connection string from .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas connected successfully'))
  .catch(err => {
    console.error('MongoDB Atlas connection error:', err);
    console.log('Attempting to connect to local MongoDB...');
    
    // Fallback to local MongoDB if Atlas connection fails
    mongoose.connect('mongodb://localhost:27017/stumpscore')
      .then(() => console.log('Connected to local MongoDB successfully'))
      .catch(localErr => console.error('Local MongoDB connection error:', localErr));
  });

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Unknown API routes return JSON 404 instead of the SPA shell
app.use('/api', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, 'build')));

  // Terminal middleware (Express 5 removed the '*' wildcard route syntax)
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
