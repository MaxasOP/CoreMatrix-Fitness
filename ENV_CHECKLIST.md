# CoreMatrix - Environment Variables Checklist

## 📋 All Environment Variables You Need to Set

Copy this checklist and check off each variable as you configure it. Total: **70+ variables** organized by category.

---

## 🎯 CRITICAL Variables (MUST SET)

These are required for the app to function at all.

### Database (3 variables)
- [ ] `MONGO_URI` - MongoDB connection string
- [ ] `REDIS_HOST` - Redis host (default: localhost)
- [ ] `REDIS_PORT` - Redis port (default: 6379)

### Authentication (2 variables)
- [ ] `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- [ ] `NODE_ENV` - development or production

### Server (1 variable)
- [ ] `PORT` - Backend port (default: 4000)

### Frontend (2 variables)
- [ ] `FRONTEND_URL` - Frontend URL (http://localhost:3000)
- [ ] `REACT_APP_API_URL` - API URL (http://localhost:4000/api)

---

## 💳 Payment Gateways (Choose at least one)

### Razorpay (Recommended for India) - 2 variables
- [ ] `RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`

### Stripe (For International) - 2 variables
- [ ] `STRIPE_PUBLIC_KEY`
- [ ] `STRIPE_SECRET_KEY`

---

## 📧 Email Service (Required)

### SendGrid - 2 variables
- [ ] `SENDGRID_API_KEY`
- [ ] `SENDGRID_FROM_EMAIL`

---

## 📱 SMS Service (Required)

### Twilio - 3 variables
- [ ] `TWILIO_ACCOUNT_SID`
- [ ] `TWILIO_AUTH_TOKEN`
- [ ] `TWILIO_PHONE_NUMBER`

---

## 🤖 AI Services (For AI Features)

### OpenAI - 2 variables
- [ ] `OPENAI_API_KEY`
- [ ] `OPENAI_MODEL` (gpt-4 or gpt-3.5-turbo)

### Python Microservice - 1 variable
- [ ] `PYTHON_SERVICE_URL` (http://localhost:5000)

---

## 📸 Media Storage (Choose one)

### AWS S3 - 4 variables
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_REGION` (e.g., ap-south-1)
- [ ] `AWS_S3_BUCKET`

### Cloudinary - 3 variables
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

---

## 🔔 Push Notifications

### Firebase - 5 variables
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_PRIVATE_KEY_ID`
- [ ] `FIREBASE_PRIVATE_KEY`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_CLIENT_ID`

---

## 📊 Monitoring & Error Tracking

### Sentry - 1 variable
- [ ] `SENTRY_DSN`

### Google Analytics - 1 variable
- [ ] `GOOGLE_ANALYTICS_ID`

---

## 🗺️ Maps & Location

### Google Maps - 2 variables
- [ ] `GOOGLE_MAPS_API_KEY`
- [ ] `GOOGLE_PLACE_API_KEY`

### Mapbox (Optional) - 1 variable
- [ ] `MAPBOX_API_KEY`

---

## 🛍️ External APIs for Pricing

### Supplement Vendors - 4 variables
- [ ] `AMAZON_API_KEY`
- [ ] `AMAZON_SECRET_KEY`
- [ ] `FLIPKART_API_KEY`
- [ ] `HEALTHKART_API_KEY`

### Grocery Partners - 3 variables
- [ ] `BLINKIT_API_KEY`
- [ ] `SWIGGY_API_KEY`
- [ ] `BIGBASKET_API_KEY`

---

## 🔒 Security & CORS

### CORS Configuration - 2 variables
- [ ] `CORS_ORIGIN` (comma-separated URLs)
- [ ] `CORS_CREDENTIALS` (true/false)

### Rate Limiting - 2 variables
- [ ] `RATE_LIMIT_WINDOW_MS` (in milliseconds)
- [ ] `RATE_LIMIT_MAX_REQUESTS`

### Internal Security - 1 variable
- [ ] `INTERNAL_API_KEY`

---

## 📦 Deployment

### Docker - 2 variables
- [ ] `DOCKER_IMAGE_NAME`
- [ ] `DOCKER_IMAGE_TAG`

### GitHub - 2 variables
- [ ] `GITHUB_TOKEN`
- [ ] `GITHUB_REPOSITORY`

### Deployment URL - 1 variable
- [ ] `DEPLOYMENT_URL`

---

## 📱 Mobile App

### App Configuration - 2 variables
- [ ] `IOS_APP_ID`
- [ ] `ANDROID_APP_ID`

### App Versioning - 2 variables
- [ ] `APP_VERSION`
- [ ] `BUILD_NUMBER`

---

## 🔧 Optional but Recommended

### Logging - 1 variable
- [ ] `LOG_LEVEL` (error, warn, info, debug)

### Debug Mode - 1 variable
- [ ] `DEBUG` (true/false)

### Database Backup - 2 variables
- [ ] `DB_BACKUP_ENABLED`
- [ ] `DB_BACKUP_FREQUENCY`

---

## 📊 Summary

| Category | Count | Required |
|----------|-------|----------|
| Database | 3 | ✅ Yes |
| Auth | 2 | ✅ Yes |
| Server | 1 | ✅ Yes |
| Frontend | 2 | ✅ Yes |
| Payments | 2-4 | ✅ Yes |
| Email | 2 | ✅ Yes |
| SMS | 3 | ✅ Yes |
| AI | 2-3 | ✅ (for features) |
| Media | 3-4 | ✅ (for uploads) |
| Push | 5 | ❌ Optional |
| Monitoring | 2 | ❌ Optional |
| Maps | 2-3 | ❌ Optional |
| External APIs | 7 | ❌ Optional |
| Security | 5 | ✅ Yes |
| Deployment | 5 | ❌ (for prod) |
| Mobile | 4 | ❌ Optional |
| Optional | 4 | ❌ Optional |
| **TOTAL** | **70+** | |

---

## 🎯 Setup by Use Case

### Minimum Setup (Development)
- [ ] MONGO_URI
- [ ] JWT_SECRET
- [ ] NODE_ENV=development
- [ ] PORT
- [ ] FRONTEND_URL
- [ ] REACT_APP_API_URL
- [ ] OPENAI_API_KEY (for AI)
- [ ] SENDGRID_API_KEY (for email)
- [ ] RAZORPAY_KEY_ID & SECRET (for payments)

**Total: 9 variables**

### Full Development Setup
All critical + optional variables
**Total: 40-50 variables**

### Production Setup
All critical + all security + monitoring + deployment
**Total: 60-70 variables**

---

## 🚀 How to Get Each Key

### MongoDB
1. Visit https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string

### JWT Secret
```bash
openssl rand -base64 32
```

### Razorpay
1. https://dashboard.razorpay.com/
2. Settings → API Keys
3. Copy Key ID and Secret

### Stripe
1. https://dashboard.stripe.com/apikeys
2. Copy Publishable and Secret keys

### SendGrid
1. https://app.sendgrid.com/settings/api_keys
2. Create new API key

### Twilio
1. https://www.twilio.com/console
2. Find Account SID and Auth Token
3. Get phone number

### OpenAI
1. https://platform.openai.com/api-keys
2. Create new secret key

### AWS S3
1. https://console.aws.amazon.com/iam/
2. Create access keys
3. Create S3 bucket

### Firebase
1. https://console.firebase.google.com/
2. Create project
3. Generate private key

### Cloudinary
1. https://cloudinary.com/console/
2. Dashboard has API credentials

### Google Maps
1. https://console.cloud.google.com/
2. Enable Maps API
3. Create API key

### Sentry
1. https://sentry.io/
2. Create project
3. Get DSN

---

## ✅ Quick Copy-Paste Template

```env
# Database
MONGO_URI=mongodb://localhost:27017/corematrix
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Auth
JWT_SECRET=your_random_32_char_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
PORT=4000

# Frontend
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:4000/api

# Payments
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
STRIPE_SECRET_KEY=your_stripe_secret

# Email
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@corematrix.com

# SMS
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# AI
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4
PYTHON_SERVICE_URL=http://localhost:5000

# Media
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-south-1
AWS_S3_BUCKET=corematrix-storage

# Notifications
FIREBASE_PROJECT_ID=your_firebase_project

# Monitoring
SENTRY_DSN=your_sentry_dsn

# Maps
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📝 Checklist: Before Going Live

- [ ] All critical variables set
- [ ] All API keys in production mode
- [ ] Database backup configured
- [ ] SSL/HTTPS enabled
- [ ] Environment variables stored securely
- [ ] No secrets in source code
- [ ] CORS_ORIGIN updated for production
- [ ] Database indexes created
- [ ] Redis memory limits set
- [ ] Error monitoring active
- [ ] Email templates tested
- [ ] Payment gateway tested (live mode)
- [ ] SMS templates tested
- [ ] Push notifications tested
- [ ] Analytics tracking working

---

## 🆘 Help & Support

If you're stuck on any variable:
1. Check `ENV_VARIABLES_SETUP.md` for detailed instructions
2. Visit the service provider's documentation
3. Check project `.env.example` file
4. Read the comment next to each variable

---

**Status**: Complete Build with 70+ Environment Variables
**Version**: 1.0.0
**Last Updated**: December 2024
