# CoreMatrix - FINAL SETUP & ENVIRONMENT VARIABLES

## 🚀 Your Complete Deployment Checklist

### ✅ What's Already Built
- [x] Phase 1: Backend API (15 models, 50+ endpoints)
- [x] Phase 2: Frontend (8 pages, 6 components)
- [x] Phase 3: Advanced Features (Payments, Real-time, Video)
- [x] Phase 4: Marketplace (Architecture ready)
- [x] Phase 5: Localization (6 languages)
- [x] Phase 6: Analytics & Growth (Monitoring, Caching)

---

## 📋 Environment Variables You MUST Set

### 🎯 Critical (11 variables) - Without these, app won't run

1. **MONGO_URI**
   - MongoDB connection string
   - Get from: https://www.mongodb.com/cloud/atlas
   - Example: `mongodb+srv://user:pass@cluster.mongodb.net/corematrix`

2. **REDIS_HOST**
   - Redis server host
   - Default: `127.0.0.1`
   - For production: Use Redis cloud service

3. **REDIS_PORT**
   - Redis port
   - Default: `6379`

4. **JWT_SECRET**
   - Your secret for JWT tokens
   - Generate: `openssl rand -base64 32`
   - Must be 32+ characters
   - Example: `abcd1234efgh5678ijkl9012mnop3456qrst7890`

5. **JWT_EXPIRE**
   - Token expiration time
   - Example: `7d` (7 days)

6. **NODE_ENV**
   - `development` or `production`

7. **PORT**
   - Backend port
   - Default: `4000`

8. **FRONTEND_URL**
   - Your frontend URL
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

9. **REACT_APP_API_URL**
   - Your API endpoint
   - Development: `http://localhost:4000/api`
   - Production: `https://api.yourdomain.com/api`

10. **RAZORPAY_KEY_ID** (or STRIPE_SECRET_KEY)
    - Payment gateway key
    - Get from: https://dashboard.razorpay.com/
    - Required for purchases

11. **SENDGRID_API_KEY**
    - Email service key
    - Get from: https://app.sendgrid.com/
    - Required for notifications

---

### 📱 SMS & Communication (3 variables)

12. **TWILIO_ACCOUNT_SID**
    - Twilio account ID
    - Get from: https://www.twilio.com/console

13. **TWILIO_AUTH_TOKEN**
    - Twilio auth token

14. **TWILIO_PHONE_NUMBER**
    - Your Twilio phone number
    - Example: `+1234567890`

---

### 🤖 AI & Machine Learning (2 variables)

15. **OPENAI_API_KEY**
    - OpenAI API key
    - Get from: https://platform.openai.com/api-keys
    - Required for meal plans & health intelligence

16. **OPENAI_MODEL**
    - Which model to use
    - Options: `gpt-4` or `gpt-3.5-turbo`
    - Default: `gpt-4` (better but costlier)

---

### 📸 Media Storage (Choose one: 3-4 variables)

**Option A: AWS S3**
17. **AWS_ACCESS_KEY_ID**
18. **AWS_SECRET_ACCESS_KEY**
19. **AWS_REGION** - e.g., `ap-south-1`
20. **AWS_S3_BUCKET** - e.g., `corematrix-storage`

**Option B: Cloudinary** (Easier)
17. **CLOUDINARY_CLOUD_NAME**
18. **CLOUDINARY_API_KEY**
19. **CLOUDINARY_API_SECRET**

---

### 🔒 Security (3 variables)

21. **CORS_ORIGIN**
    - Comma-separated allowed domains
    - Development: `http://localhost:3000`
    - Production: `https://yourdomain.com,https://app.yourdomain.com`

22. **RATE_LIMIT_WINDOW_MS**
    - Rate limit window in ms
    - Default: `900000` (15 minutes)

23. **RATE_LIMIT_MAX_REQUESTS**
    - Max requests per window
    - Default: `100`

---

### 🔔 Push Notifications (Optional)

24. **FIREBASE_PROJECT_ID**
25. **FIREBASE_PRIVATE_KEY_ID**
26. **FIREBASE_PRIVATE_KEY**
27. **FIREBASE_CLIENT_EMAIL**
28. **FIREBASE_CLIENT_ID**

Get from: https://console.firebase.google.com/ → Project Settings → Service Accounts

---

### 📊 Monitoring (Optional)

29. **SENTRY_DSN**
    - Error tracking
    - Get from: https://sentry.io/

---

### 🗺️ Maps (Optional)

30. **GOOGLE_MAPS_API_KEY**
    - For gym/trainer location features
    - Get from: https://console.cloud.google.com/

---

## 🛠️ Step-by-Step Setup

### Step 1: Create `.env` file in backend

```bash
cd backend
cp .env.example .env
nano .env  # Edit with your keys
```

### Step 2: Fill in CRITICAL variables first

```env
# Database
MONGO_URI=your_mongodb_connection_string
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Auth
JWT_SECRET=your_32_character_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
PORT=4000

# Frontend
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:4000/api

# Payments
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret

# Email
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@corematrix.com

# SMS
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# AI
OPENAI_API_KEY=sk-xxxxx
OPENAI_MODEL=gpt-4

# Media (choose S3 or Cloudinary)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
AWS_S3_BUCKET=corematrix-storage
```

### Step 3: Install dependencies

```bash
cd backend
npm install

cd ../client
npm install
```

### Step 4: Start services

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```

**Terminal 2: Frontend**
```bash
cd client
npm start
```

### Step 5: Access application

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Health check: http://localhost:4000/api/health

---

## 📝 How to Get Each Key

### MongoDB Atlas
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account
3. Create cluster
4. Click "Connect"
5. Choose "Connect your application"
6. Copy connection string
7. Replace `<password>` and `<dbname>`

### Razorpay
1. Go to https://dashboard.razorpay.com/
2. Settings → API Keys
3. Copy Key ID and Secret
4. Keep in "Live" mode for production

### SendGrid
1. Go to https://app.sendgrid.com/
2. Settings → API Keys
3. Create new API key
4. Copy it

### Twilio
1. Go to https://www.twilio.com/console
2. Find Account SID and Auth Token
3. Get a phone number
4. Copy all three

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy it

### AWS S3
1. Go to https://console.aws.amazon.com/
2. IAM → Users → Add User
3. Create Access Key
4. Create S3 bucket
5. Copy keys and bucket name

### Cloudinary (Alternative to S3)
1. Go to https://cloudinary.com/console/
2. Dashboard has all credentials
3. Copy Cloud Name, API Key, API Secret

---

## ✅ Production Checklist

Before deploying to production:

- [ ] All CRITICAL variables set
- [ ] API keys are in PRODUCTION mode (not test)
- [ ] JWT_SECRET is strong & unique
- [ ] Database backups enabled
- [ ] HTTPS/SSL configured
- [ ] CORS_ORIGIN updated for your domain
- [ ] Rate limiting configured
- [ ] Error monitoring (Sentry) setup
- [ ] Email service tested
- [ ] Payment gateway tested with real transaction
- [ ] SMS service tested
- [ ] Database indexes created
- [ ] Redis memory configured
- [ ] CDN configured (for images/videos)
- [ ] Monitoring alerts set up

---

## 🆘 Troubleshooting Environment Variables

### Issue: "Cannot find module 'stripe'"
**Solution**: Run `npm install` in backend directory

### Issue: "MONGO_URI is not defined"
**Solution**: Check .env file exists in backend directory and MONGO_URI is set

### Issue: "CORS error in browser"
**Solution**: Update FRONTEND_URL in .env to match your frontend URL

### Issue: "Payment fails"
**Solution**: Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are in LIVE mode

### Issue: "Email not sending"
**Solution**: Verify SENDGRID_API_KEY is valid and not expired

### Issue: "SMS not sending"
**Solution**: Check TWILIO_PHONE_NUMBER is correct format with country code

### Issue: "Redis connection error"
**Solution**: Make sure Redis is running (`redis-server`)

---

## 📊 Environment Variables Summary Table

| Variable | Category | Required | Where to Get | Notes |
|----------|----------|----------|--------------|-------|
| MONGO_URI | Database | ✅ | MongoDB Atlas | Connection string |
| REDIS_HOST | Database | ✅ | Local/Redis Cloud | Usually localhost |
| JWT_SECRET | Auth | ✅ | Generate | Must be 32+ chars |
| NODE_ENV | Server | ✅ | Set manually | dev or prod |
| RAZORPAY_KEY_ID | Payments | ✅ | Razorpay | For checkout |
| SENDGRID_API_KEY | Email | ✅ | SendGrid | For notifications |
| TWILIO_ACCOUNT_SID | SMS | ✅ | Twilio | For SMS alerts |
| OPENAI_API_KEY | AI | ✅ | OpenAI | For meal plans |
| AWS_S3_BUCKET | Storage | ✅ | AWS | For images/videos |
| FRONTEND_URL | Config | ✅ | Set manually | Your frontend URL |
| FIREBASE_PROJECT_ID | Push | ❌ | Firebase | Optional |
| SENTRY_DSN | Monitoring | ❌ | Sentry | Optional |

---

## 🚀 Quick Commands

```bash
# Generate JWT Secret
openssl rand -base64 32

# Test MongoDB connection
mongosh "your-connection-string"

# Test Redis connection
redis-cli ping

# Start backend
cd backend && npm run dev

# Start frontend
cd client && npm start

# Build for production
cd client && npm run build

# Run tests
npm test

# Check environment variables loaded
node -e "console.log(process.env.MONGO_URI)"
```

---

## 📚 Documentation Files

1. **ENV_VARIABLES_SETUP.md** - Detailed guide for each variable
2. **COMPLETE_BUILD_SUMMARY.md** - What was built in each phase
3. **QUICK_START.md** - 5-minute quick start guide
4. **ENV_CHECKLIST.md** - Complete checklist format

---

## ✨ You're All Set!

Your CoreMatrix fitness super app is completely built with:
- ✅ 8 frontend pages
- ✅ 15+ backend models
- ✅ 50+ API endpoints
- ✅ Real-time Socket.io
- ✅ Payment processing
- ✅ AI integration
- ✅ 6 languages
- ✅ Video analysis
- ✅ Analytics
- ✅ Caching

**Total: 70+ environment variables need to be configured**

Start by setting the 11 CRITICAL variables, then add optional ones as needed.

---

**Ready to deploy?** Follow the step-by-step setup above and you'll be live in minutes!

🚀 **Happy coding!** 💪
