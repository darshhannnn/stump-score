// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Request logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// MongoDB connection with improved error handling
const connectDB = async () => {
    const maxRetries = 5;
    let retries = 0;

    const tryConnect = async () => {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log('MongoDB connected successfully');
        } catch (error) {
            console.error(`MongoDB connection attempt ${retries + 1} failed:`, error);
            retries++;
            
            if (retries < maxRetries) {
                console.log(`Retrying connection in 5 seconds... (${retries}/${maxRetries})`);
                setTimeout(tryConnect, 5000);
            } else {
                console.error('Max retries reached. Could not connect to MongoDB');
                process.exit(1);
            }
        }
    };

    await tryConnect();
};

// Initialize database connection
connectDB();

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// External API proxy routes
const externalRoutes = require('./routes/external');
app.use('/api', externalRoutes);

// Serve frontend static files
const path = require('path');
app.use(express.static(path.join(__dirname, '../stump-score-frontend')));

// Improved catch-all: serve static file if exists, else index.html (for SPA)
const fs = require('fs');
const staticPath = path.join(__dirname, '../stump-score-frontend');
app.get(/^\/(?!api).*/, (req, res) => {
    const reqPath = req.path === '/' ? '/index.html' : req.path;
    const filePath = path.join(staticPath, reqPath);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.sendFile(path.join(staticPath, 'index.html'));
        } else {
            res.sendFile(filePath);
        }
    });
});

// Basic route
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'StumpScore API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    };
    res.json(health);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        path: req.path
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    
    const statusCode = err.statusCode || 500;
    const response = {
        success: false,
        error: err.message || 'Internal Server Error',
        path: req.path
    };
    
    if (process.env.NODE_ENV === 'development') {
        response.details = {
            stack: err.stack,
            name: err.name
        };
    }
    
    res.status(statusCode).json(response);
});

// Server startup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`MongoDB URI: ${process.env.MONGO_URI ? 'Configured' : 'Not configured'}`);
});

// Graceful shutdown
let isShuttingDown = false;
const shutdown = async () => {
    if (isShuttingDown) return; // Prevent multiple calls
    isShuttingDown = true;
    console.log('Shutting down gracefully...');
    
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false).then(() => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });

    // Force close after 10 seconds
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.message);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error.'
    });
});

// Uncaught exception handler
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    shutdown();
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown();
});
