# StumpScore - Quick Start Guide

## 🚀 Your Application is Production Ready!

The StumpScore application has been fully configured for production deployment with enterprise-grade security, monitoring, and reliability features.

## ⚡ Quick Start (5 Minutes)

### Step 1: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and fill in your values
nano .env  # or use your preferred editor
```

**Required Variables**:
- `MONGO_URI` or `MONGO_ATLAS_URI` - Your MongoDB connection string
- `JWT_SECRET` - A strong random secret (generate with: `openssl rand -base64 32`)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `SMTP_USER`, `SMTP_PASS` - Email credentials

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Choose Your Deployment Method

#### Option A: Local Development
```bash
npm run dev
```
Access at: http://localhost:5000

#### Option B: Production with PM2
```bash
# Build frontend
npm run build

# Start with PM2
npm run pm2:start

# Monitor
npm run pm2:monit
```

#### Option C: Docker
```bash
# Build image
docker build -t stumpscore .

# Run container
docker run -d -p 5000:5000 --env-file .env stumpscore
```

#### Option D: Automated Deployment
```bash
# Make script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

### Step 4: Verify Deployment

```bash
# Check health
curl http://localhost:5000/health

# Expected response:
# {"status":"healthy","checks":{"database":{"status":"connected"}}}
```

## 📋 What's Been Implemented

### ✅ Core Features
- Environment configuration with validation
- Robust database connection with auto-retry
- Comprehensive logging system
- Error handling middleware
- Health check endpoints

### ✅ Security
- Rate limiting on all API endpoints
- CORS with origin validation
- Input sanitization and validation
- NoSQL injection prevention
- Security headers (HSTS, CSP, etc.)
- Webhook signature verification

### ✅ Production Features
- PM2 process management
- Docker containerization
- Static asset optimization
- Graceful shutdown handling
- Request logging with timing

### ✅ Deployment Support
- Vercel configuration
- Heroku configuration
- Docker configuration
- Automated deployment scripts

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide with troubleshooting
- **[PRODUCTION-READY.md](./PRODUCTION-READY.md)** - Production readiness checklist
- **[IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md)** - Technical implementation details

## 🔧 Common Commands

### Development
```bash
npm run dev              # Start development server
npm run dev:full         # Start both backend and frontend
npm test                 # Run tests
```

### Production
```bash
npm run build            # Build frontend for production
npm run pm2:start        # Start with PM2
npm run pm2:stop         # Stop PM2 process
npm run pm2:restart      # Restart PM2 process
npm run pm2:logs         # View logs
npm run pm2:monit        # Monitor application
```

### Docker
```bash
docker build -t stumpscore .                    # Build image
docker run -d -p 5000:5000 stumpscore          # Run container
docker logs -f stumpscore                       # View logs
docker exec -it stumpscore sh                   # Access container
```

## 🏥 Health Checks

```bash
# Main health check
curl http://localhost:5000/health

# Readiness check (for Kubernetes)
curl http://localhost:5000/health/ready

# Liveness check
curl http://localhost:5000/health/live

# Detailed status
curl http://localhost:5000/health/status
```

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change all default secrets in `.env`
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Configure MongoDB Atlas with IP whitelist
- [ ] Set up Razorpay webhooks with correct URL
- [ ] Update ALLOWED_ORIGINS for your domain
- [ ] Enable HTTPS (via reverse proxy or platform)
- [ ] Configure firewall rules
- [ ] Set up automated backups

## 🐛 Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs stumpscore-api

# Common issues:
# - Missing environment variables
# - Database connection failure
# - Port already in use
```

### Database connection errors
```bash
# Test MongoDB connection
mongosh "your-connection-string"

# Check if MongoDB is running
systemctl status mongod  # Linux
```

### Port already in use
```bash
# Find process using port 5000
lsof -i :5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

## 📊 Monitoring

### PM2 Dashboard
```bash
pm2 monit  # Real-time monitoring
pm2 status # Process status
pm2 logs   # View logs
```

### Application Metrics
- Health endpoint: `/health`
- Memory usage: Included in health response
- Response times: Logged for each request
- Error rates: Check logs

## 🚢 Deployment Platforms

### Vercel
```bash
vercel --prod
```

### Heroku
```bash
git push heroku main
```

### AWS/DigitalOcean
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions

## 📞 Need Help?

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Review application logs: `pm2 logs` or `docker logs`
3. Check health endpoints
4. Verify environment variables are set correctly

## 🎯 Next Steps

1. ✅ Configure environment variables
2. ✅ Test locally
3. ✅ Deploy to staging (optional)
4. ✅ Deploy to production
5. ✅ Set up monitoring
6. ✅ Configure automated backups
7. ✅ Set up CI/CD (optional)

---

**Status**: 🟢 Production Ready

**Need more details?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive documentation.
