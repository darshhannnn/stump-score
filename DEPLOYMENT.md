# StumpScore Deployment Guide

This guide provides step-by-step instructions for deploying StumpScore to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Deployment Options](#deployment-options)
4. [Pre-Deployment Checklist](#pre-deployment-checklist)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Rollback Procedure](#rollback-procedure)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18.x or higher
- MongoDB 5.0 or higher (Atlas recommended for production)
- npm or yarn package manager
- Git
- PM2 (for process management) or Docker

## Environment Variables

### Required Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Environment
NODE_ENV=production

# Server
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/stumpscore
MONGO_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/stumpscore

# Authentication
JWT_SECRET=your-secure-jwt-secret-key-change-this

# Razorpay Payment Integration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=StumpScore <noreply@stumpscore.com>

# Frontend URL
CLIENT_URL=https://yourdomain.com

# External APIs
CRICKET_API_KEY=your-cricket-api-key

# CORS (comma-separated list)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Security Notes

- **Never commit `.env` files to version control**
- Use strong, randomly generated secrets for `JWT_SECRET`
- Store sensitive credentials in a secure secret management system
- Rotate secrets regularly

## Deployment Options

### Option 1: Docker Deployment

```bash
# Build Docker image
docker build -t stumpscore:latest .

# Run container
docker run -d \
  --name stumpscore \
  -p 5000:5000 \
  --env-file .env \
  stumpscore:latest

# Check logs
docker logs -f stumpscore
```

### Option 2: PM2 Deployment

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Start with PM2
npm run pm2:start

# Monitor
npm run pm2:monit

# View logs
npm run pm2:logs
```

### Option 3: Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
# ... set all other required variables

# Deploy
git push heroku main

# Open app
heroku open
```

### Option 4: Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

## Pre-Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] MongoDB Atlas connection string updated
- [ ] Razorpay webhook URL configured
- [ ] CORS allowed origins updated
- [ ] SSL/TLS certificates configured
- [ ] DNS records updated
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented

## Deployment Steps

### Step 1: Prepare the Application

```bash
# Clone repository
git clone https://github.com/yourusername/stumpscore.git
cd stumpscore

# Checkout production branch
git checkout main

# Pull latest changes
git pull origin main
```

### Step 2: Install Dependencies

```bash
# Install production dependencies
npm ci --production
```

### Step 3: Build Frontend

```bash
# Build optimized frontend
npm run build

# Verify build directory exists
ls -la build/
```

### Step 4: Database Setup

```bash
# Ensure MongoDB is running and accessible
# Run any pending migrations (if applicable)
# npm run migrate:production
```

### Step 5: Start Application

#### Using PM2:

```bash
# Start application
npm run pm2:start

# Check status
pm2 status

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

#### Using Docker:

```bash
# Build and run
docker-compose up -d

# Check status
docker-compose ps
```

### Step 6: Configure Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
}
```

## Post-Deployment Verification

### 1. Health Check

```bash
curl https://yourdomain.com/health
```

Expected response:
```json
{
  "uptime": 123.456,
  "timestamp": 1234567890,
  "status": "healthy",
  "checks": {
    "database": {
      "status": "connected"
    }
  }
}
```

### 2. API Endpoints

```bash
# Test API endpoints
curl https://yourdomain.com/api/users
curl https://yourdomain.com/api/payments
```

### 3. Frontend

- Open https://yourdomain.com in browser
- Verify all pages load correctly
- Test user registration and login
- Test payment flow (in test mode)

### 4. Monitor Logs

```bash
# PM2 logs
pm2 logs stumpscore-api

# Docker logs
docker logs -f stumpscore

# System logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 5. Performance Check

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com

# Load test (optional)
# ab -n 1000 -c 10 https://yourdomain.com/
```

## Rollback Procedure

If issues are detected after deployment:

### Step 1: Stop Current Deployment

```bash
# PM2
pm2 stop stumpscore-api

# Docker
docker-compose down
```

### Step 2: Restore Previous Version

```bash
# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild
npm ci --production
npm run build
```

### Step 3: Restore Database (if needed)

```bash
# Restore from backup
mongorestore --uri="mongodb://..." --archive=backup.archive
```

### Step 4: Restart Application

```bash
# PM2
pm2 restart stumpscore-api

# Docker
docker-compose up -d
```

### Step 5: Verify

```bash
curl https://yourdomain.com/health
```

## Troubleshooting

### Application Won't Start

**Check logs:**
```bash
pm2 logs stumpscore-api --lines 100
```

**Common issues:**
- Missing environment variables
- Database connection failure
- Port already in use
- Insufficient permissions

**Solutions:**
- Verify `.env` file exists and contains all required variables
- Test database connection manually
- Check if port 5000 is available: `lsof -i :5000`
- Ensure proper file permissions

### Database Connection Errors

**Check MongoDB status:**
```bash
# Local MongoDB
systemctl status mongod

# MongoDB Atlas
# Check connection string and network access settings
```

**Test connection:**
```bash
mongosh "mongodb://..."
```

### High Memory Usage

**Check memory:**
```bash
pm2 monit
```

**Restart application:**
```bash
pm2 restart stumpscore-api
```

**Adjust PM2 memory limit:**
```javascript
// In ecosystem.config.js
max_memory_restart: '2G'
```

### Slow Response Times

**Check:**
- Database query performance
- Network latency
- Server resources (CPU, memory)
- Number of PM2 instances

**Optimize:**
- Add database indexes
- Enable caching
- Increase PM2 instances
- Use CDN for static assets

### SSL/TLS Certificate Issues

**Renew certificate:**
```bash
# Let's Encrypt
certbot renew

# Reload Nginx
nginx -s reload
```

### Payment Webhook Not Working

**Verify:**
- Webhook URL is correct in Razorpay dashboard
- Webhook secret matches environment variable
- Server is accessible from internet
- Firewall allows incoming connections

**Test webhook:**
```bash
curl -X POST https://yourdomain.com/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: test" \
  -d '{"event":"payment.captured"}'
```

## Monitoring and Maintenance

### Daily Tasks

- Check application logs for errors
- Monitor response times
- Verify database backups

### Weekly Tasks

- Review error rates
- Check disk space
- Update dependencies (security patches)

### Monthly Tasks

- Review and rotate secrets
- Analyze performance metrics
- Update documentation

## Support

For issues or questions:
- Check logs first
- Review this documentation
- Contact development team
- Create GitHub issue

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
