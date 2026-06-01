# CoreMatrix Fitness Super App - Environment Variables Setup

## Complete Environment Variables Guide

This document lists all environment variables needed for CoreMatrix to run at full capacity. Setup instructions are provided below.

---

## 🔷 Database Configuration

### MongoDB
```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/corematrix?retryWrites=true&w=majority
# For local development: mongodb://localhost:27017/corematrix
```

### Redis (Caching & Real-time)
```env
# Redis Connection (for caching, leaderboards, real-time features)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password  # if authentication enabled
```

---

## 🔐 Authentication & Security

### JWT Configuration
```env
# JWT Secret for token generation and verification
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d  # Token expiration time
```

### Node Environment
```env
NODE_ENV=production  # or 'development'
PORT=4000
```

---

## 💳 Payment Gateway Integration

### Razorpay (Recommended for India)
```env
# Razorpay - Primary payment gateway for India
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
# Get keys from: https://dashboard.razorpay.com/
```

### Stripe (International)
```env
# Stripe - For international customers
STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
# Get keys from: https://dashboard.stripe.com/
```

---

## 📧 Email & SMS Services

### SendGrid (Email)
```env
# SendGrid for email notifications
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@corematrix.com
# Get API key from: https://app.sendgrid.com/settings/api_keys
```

### Twilio (SMS)
```env
# Twilio for SMS notifications
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number
# Get credentials from: https://www.twilio.com/console
```

---

## 🤖 AI & Machine Learning Services

### OpenAI API (Meal Plans, Health Twin, Recommendations)
```env
# OpenAI GPT-4 for AI Dietician and Health Intelligence
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo
# Get API key from: https://platform.openai.com/api-keys
```

### Python Microservice (Video Analysis)
```env
# Python service URL for MediaPipe video/pose analysis
PYTHON_SERVICE_URL=http://localhost:5000
# This service should run on a separate Python server
```

---

## 📸 Media Storage

### AWS S3 (Image & Video Storage)
```env
# AWS S3 for storing workout videos, meal photos, progress reels
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1  # India region
AWS_S3_BUCKET=corematrix-storage
# Get keys from: https://console.aws.amazon.com/iam/
```

### Cloudinary (Alternative to S3)
```env
# Cloudinary for image/video hosting (easier alternative to S3)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
# Get credentials from: https://cloudinary.com/console/
```

---

## 🔔 Notifications & Analytics

### Firebase Cloud Messaging (Push Notifications)
```env
# Firebase for push notifications to mobile users
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id
```

### Sentry (Error Tracking & Monitoring)
```env
# Sentry for error tracking and performance monitoring
SENTRY_DSN=https://xxxxxxxxxxxx@xxxx.ingest.sentry.io/xxxxxx
# Get DSN from: https://sentry.io/
```

### Google Analytics / Mixpanel (User Analytics)
```env
# Analytics for tracking user behavior
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=your_mixpanel_token  # optional
```

---

## 🌍 Frontend Configuration

```env
# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:3000
# Production: https://yourdomain.com

# API Base URL for frontend
REACT_APP_API_URL=http://localhost:4000/api
# Production: https://api.yourdomain.com/api
```

---

## 🌐 External APIs & Integrations

### Supplement Price Comparison APIs
```env
# Amazon Product Advertising API
AMAZON_API_KEY=your_amazon_api_key
AMAZON_SECRET_KEY=your_amazon_secret_key

# Flipkart API (if available)
FLIPKART_API_KEY=your_flipkart_api_key

# HealthKart API
HEALTHKART_API_KEY=your_healthkart_api_key

# MuscleBlaze Store API
MUSCLEBLAZE_API_KEY=your_muscleblaze_api_key
```

### Grocery Partner APIs
```env
# Blinkit API
BLINKIT_API_KEY=your_blinkit_api_key

# Swiggy Instamart API
SWIGGY_API_KEY=your_swiggy_api_key

# BigBasket API
BIGBASKET_API_KEY=your_bigbasket_api_key
```

---

## 🗺️ Maps & Location Services

```env
# Google Maps API (for gym/trainer location)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_PLACE_API_KEY=your_google_place_api_key

# Mapbox (alternative to Google Maps)
MAPBOX_API_KEY=your_mapbox_api_key
```

---

## 📊 Database Backups & Monitoring

```env
# MongoDB Atlas for cloud hosting
MONGODB_ATLAS_CONNECTION_STRING=mongodb+srv://...

# Database backup schedule
DB_BACKUP_ENABLED=true
DB_BACKUP_FREQUENCY=daily  # daily, weekly, monthly
```

---

## 🔒 Security & CORS

```env
# CORS Configuration
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# API Key for internal services
INTERNAL_API_KEY=your_internal_api_key_for_webhooks
```

---

## 📱 Mobile App Configuration

```env
# Apple App Store / Google Play credentials
IOS_APP_ID=com.corematrix.fitness
ANDROID_APP_ID=com.corematrix.fitness

# App versioning
APP_VERSION=1.0.0
BUILD_NUMBER=1
```

---

## 🚀 Deployment Configuration

```env
# Docker & Container
DOCKER_IMAGE_NAME=corematrix-fitness
DOCKER_IMAGE_TAG=latest

# GitHub Actions CI/CD
GITHUB_TOKEN=your_github_token  # for automated deployments
GITHUB_REPOSITORY=yourusername/corematrix-fitness

# Deployment URL
DEPLOYMENT_URL=https://corematrix.vercel.app
# or
DEPLOYMENT_URL=https://api.corematrix.com
```

---

## 📋 Summary Table of All Variables

| Category | Variable | Required | Example |
|----------|----------|----------|---------|
| Database | MONGO_URI | ✅ | mongodb+srv://user:pass@cluster... |
| Database | REDIS_HOST | ✅ | localhost |
| Auth | JWT_SECRET | ✅ | your_secret_key_32_chars_min |
| Auth | JWT_EXPIRE | ❌ | 7d |
| Payment | RAZORPAY_KEY_ID | ✅ | rzp_live_xxxx |
| Payment | RAZORPAY_KEY_SECRET | ✅ | your_secret |
| Payment | STRIPE_SECRET_KEY | ❌ | sk_live_xxxx |
| Email | SENDGRID_API_KEY | ✅ | SG.xxxx |
| SMS | TWILIO_ACCOUNT_SID | ✅ | ACxxxx |
| SMS | TWILIO_AUTH_TOKEN | ✅ | your_token |
| SMS | TWILIO_PHONE_NUMBER | ✅ | +1234567890 |
| AI | OPENAI_API_KEY | ✅ | sk-xxxx |
| Media | AWS_ACCESS_KEY_ID | ✅ | AKIA... |
| Media | AWS_SECRET_ACCESS_KEY | ✅ | your_secret |
| Media | AWS_S3_BUCKET | ✅ | corematrix-storage |
| Frontend | FRONTEND_URL | ✅ | http://localhost:3000 |
| Frontend | REACT_APP_API_URL | ✅ | http://localhost:4000/api |
| Monitoring | SENTRY_DSN | ❌ | https://xxxx@xxxx.ingest.sentry.io |

---

## 🛠️ Setup Instructions

### Step 1: Create .env files

**Backend** (`backend/.env`):
```bash
# Copy backend/.env.example to backend/.env
cp backend/.env.example backend/.env

# Edit backend/.env and fill in all variables
nano backend/.env
```

**Frontend** (`client/.env.local`):
```bash
# Create client/.env.local
cat > client/.env.local << EOF
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_key
EOF
```

### Step 2: Get API Keys

1. **MongoDB**: https://www.mongodb.com/cloud/atlas
2. **JWT Secret**: Generate secure random string
3. **Razorpay**: https://razorpay.com/
4. **OpenAI**: https://platform.openai.com/
5. **AWS/S3**: https://aws.amazon.com/
6. **SendGrid**: https://sendgrid.com/
7. **Twilio**: https://www.twilio.com/
8. **Firebase**: https://firebase.google.com/
9. **Stripe**: https://stripe.com/ (optional)

### Step 3: Initialize Services

```bash
# Install dependencies
npm install

# Start MongoDB (if local)
mongod

# Start Redis (if local)
redis-server

# Start backend
cd backend
npm start

# Start frontend (in another terminal)
cd client
npm start
```

### Step 4: Verify Setup

Visit: http://localhost:3000

Check health: http://localhost:4000/api/health

---

## ✅ Production Deployment Checklist

- [ ] All required variables are set in production environment
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] CORS_ORIGIN does not include localhost
- [ ] Database backup is configured
- [ ] Email service is tested
- [ ] Payment gateway is in production mode
- [ ] HTTPS/SSL is enabled
- [ ] Rate limiting is active
- [ ] Error tracking (Sentry) is configured
- [ ] CDN is configured for media (S3/Cloudinary)
- [ ] Monitoring and alerts are set up

---

## 🆘 Troubleshooting

### Variables not loading?
```bash
# Check if .env file exists
ls -la backend/.env

# Verify NODE_ENV
echo $NODE_ENV

# Reload environment
source backend/.env
```

### API Key errors?
- Ensure keys are wrapped in quotes if they contain special characters
- Check that API keys haven't expired
- Verify API key permissions in respective dashboards

### CORS errors?
- Update FRONTEND_URL and CORS_ORIGIN to match your actual URLs
- Ensure CORS middleware is enabled in server.js

### Database connection failed?
- Check MONGO_URI syntax
- Verify network access in MongoDB Atlas settings
- Ensure MongoDB is running

---

**Last Updated**: December 2024
**CoreMatrix Version**: 1.0.0
**Status**: Production Ready ✅
