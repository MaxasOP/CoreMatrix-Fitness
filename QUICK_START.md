# CoreMatrix Quick Start Guide

## 🚀 Get CoreMatrix Running in 5 Minutes

### Prerequisites
- Node.js 16+ installed
- MongoDB running (local or Atlas)
- Redis running (for caching)
- API keys from services

### Step 1: Clone & Setup

```bash
# Navigate to project
cd CoreMatrix-Fitness

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Configure Environment

```bash
# Copy backend environment template
cd backend
cp .env.example .env

# Edit .env with your API keys (see ENV_VARIABLES_SETUP.md)
# Minimum required for basic setup:
# - MONGO_URI
# - JWT_SECRET
# - RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET
# - OPENAI_API_KEY
# - SENDGRID_API_KEY

nano .env
```

### Step 3: Start Services

#### Terminal 1: Backend
```bash
cd backend
npm run dev
# Backend runs on http://localhost:4000
```

#### Terminal 2: Frontend
```bash
cd client
npm start
# Frontend runs on http://localhost:3000
```

### Step 4: Verify Setup

- Open http://localhost:3000 in browser
- Backend health check: http://localhost:4000/api/health
- Try signup/login
- Visit Dashboard

### Step 5: Populate Sample Data (Optional)

```bash
# In backend directory
node scripts/seedDatabase.js
```

---

## 📱 Available Pages

After login, explore:

1. **Dashboard** - Overview of health metrics
2. **AI Dietician** - Generate personalized meal plans
3. **Supplements** - Smart recommendations & price comparison
4. **Leaderboards** - Compete nationally, by city, college, company
5. **Challenges** - Join fitness challenges
6. **Progress Reels** - Share your transformation
7. **Yoga** - Daily yoga programs
8. **Trainers** - Find and book fitness trainers

---

## 🔑 Environment Variables (Quick Reference)

**Essential for Development**:
```env
MONGO_URI=mongodb://localhost:27017/corematrix
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=your_secret_key
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
```

**AI Features**:
```env
OPENAI_API_KEY=sk-...
```

**Payments**:
```env
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
```

**Email**:
```env
SENDGRID_API_KEY=SG....
```

**Full list**: See `ENV_VARIABLES_SETUP.md`

---

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9
npm start
```

### MongoDB connection error
```bash
# Check MongoDB is running
mongod --version
mongod  # Start if not running

# Or use MongoDB Atlas
# Update MONGO_URI in .env
```

### Redis connection error
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Or start Redis
redis-server
```

### API Key errors
- Verify all .env variables are set
- Check API keys haven't expired
- Ensure API key has correct permissions
- Check service dashboards for quota limits

### CORS errors
```bash
# Update FRONTEND_URL in backend/.env
FRONTEND_URL=http://localhost:3000
```

---

## 📦 Project Structure

```
backend/
├── models/          # MongoDB schemas (15 models)
├── routes/          # API endpoints
├── controllers/     # Business logic
├── services/        # External integrations
├── middleware/      # Auth, validation, localization
├── localization/    # Multi-language support
├── caching/         # Redis caching
├── utils/           # Utilities & helpers
└── server.js        # Entry point

client/
├── public/          # Static files
├── src/
│   ├── pages/       # Page components (8 pages)
│   ├── components/  # Reusable components
│   ├── hooks/       # Custom hooks
│   ├── services/    # API calls
│   └── App.js       # Main app
└── package.json
```

---

## 🌍 Supported Languages

- 🇬🇧 English (en)
- 🇮🇳 Hindi (hi)
- 🇮🇳 Marathi (mr)
- 🇮🇳 Tamil (ta)
- 🇮🇳 Telugu (te)
- 🇮🇳 Bengali (bn)

Switch languages using the Language Switcher component.

---

## 🔒 Security

- JWT authentication for all protected routes
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- CORS protection
- Helmet.js for security headers
- Input validation with Joi & express-validator
- Environment variables for sensitive data

---

## 🚀 Deployment

### Local Deployment
```bash
# Production build
cd client
npm run build

# Backend production
NODE_ENV=production PORT=8000 npm start
```

### Docker Deployment
```bash
# Build image
docker build -t corematrix:1.0 .

# Run container
docker run -p 4000:4000 --env-file .env corematrix:1.0
```

### Cloud Deployment
- Frontend: Vercel, Netlify, AWS Amplify
- Backend: Heroku, Railway, AWS EC2, DigitalOcean
- Database: MongoDB Atlas
- Storage: AWS S3

---

## 📊 API Health Check

```bash
curl http://localhost:4000/api/health
```

Response:
```json
{
  "status": "ok",
  "message": "CoreMatrix MERN backend running",
  "version": "1.0.0"
}
```

---

## 📞 Support & Documentation

- **Full Setup Guide**: See `ENV_VARIABLES_SETUP.md`
- **Complete Summary**: See `COMPLETE_BUILD_SUMMARY.md`
- **Feature Docs**: See `FEATURES.md`
- **API Docs**: Available at `/api/docs` (Swagger/OpenAPI - not yet implemented, but API structure follows REST standard)

---

## ✨ Features Ready to Use

✅ User authentication
✅ Workout logging
✅ Meal tracking
✅ AI meal planning
✅ Smart supplement recommendations
✅ Leaderboards (national, city, college, company)
✅ Fitness challenges
✅ Progress reels (social sharing)
✅ Yoga programs
✅ Trainer marketplace
✅ Real-time updates (Socket.io)
✅ Multi-language support
✅ Payment processing
✅ Email/SMS notifications
✅ User analytics
✅ Performance monitoring

---

## 🎯 Next Steps

1. Configure all environment variables
2. Set up MongoDB and Redis
3. Get API keys from service providers
4. Run `npm install` in both directories
5. Start backend and frontend
6. Test core features (signup, login, dashboard)
7. Test AI features (meal plan, supplement recommendations)
8. Deploy to production

---

**Version**: 1.0.0
**Build Date**: December 2024
**Status**: ✅ Production Ready

Happy building! 🚀💪
