# CoreMatrix Fitness Super App - Setup Guide

Welcome to CoreMatrix v0.2.0! This guide will help you set up the complete development environment.

## Quick Start (5 minutes)

### Prerequisites
- Node.js 16+ 
- npm or yarn
- MongoDB (local or Atlas)
- Git

### 1. Clone & Navigate
```bash
git clone https://github.com/your-repo/CoreMatrix-Fitness.git
cd CoreMatrix-Fitness
```

### 2. Setup Backend
```bash
cd backend

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend will start at `http://localhost:4000`

### 3. Setup Frontend (new terminal)
```bash
cd client

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will open at `http://localhost:3000`

---

## Detailed Setup

### Backend Configuration

#### Environment Variables (.env)

**Essential Variables:**
```env
# Database
MONGO_URI=mongodb://localhost:27017/corematrix
JWT_SECRET=your_super_secret_key_change_this

# Server
PORT=4000
NODE_ENV=development

# AI Services (required for meal plans)
OPENAI_API_KEY=sk-your_key_here
```

**Optional (but recommended):**
```env
# Cloudinary (for image/video uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (SendGrid)
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=noreply@corematrix.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### Database Setup

**Option 1: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Linux
sudo apt-get install mongodb
sudo systemctl start mongod

# Windows
# Download from https://www.mongodb.com/try/download/community
```

**Option 2: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account & cluster
3. Get connection string
4. Add to `.env` as `MONGO_URI`

#### Initialize Database

```bash
cd backend

# Seed initial data (supplements, challenges)
node scripts/seedDatabase.js

# Expected output:
# ✓ Inserted 3 supplements
# ✓ Inserted 4 challenges
# ✓ Database seeded successfully!
```

#### Verify Backend

```bash
curl http://localhost:4000/api/health

# Expected response:
# {"status":"ok","message":"CoreMatrix MERN backend running","version":"0.2.0"}
```

---

### Frontend Configuration

#### Environment Variables (.env.local)

```env
REACT_APP_API_URL=http://localhost:4000/api
```

#### Install Dependencies

```bash
cd client
npm install
```

#### Start Development Server

```bash
npm start

# Should open browser at http://localhost:3000
```

---

## Project Structure

```
CoreMatrix-Fitness/
├── backend/
│   ├── models/              # MongoDB schemas
│   │   ├── User.js
│   │   ├── Workout.js
│   │   ├── Meal.js
│   │   ├── MealPlan.js
│   │   ├── Supplement.js
│   │   ├── ProgressReel.js
│   │   ├── Leaderboard.js
│   │   ├── Challenge.js
│   │   ├── TrainerProfile.js
│   │   ├── Gym.js
│   │   ├── Booking.js
│   │   ├── FitnessWallet.js
│   │   ├── FamilyAccount.js
│   │   ├── Review.js
│   │   └── Notification.js
│   ├── routes/              # API endpoints
│   │   ├── auth.js
│   │   ├── fitness.js
│   │   ├── ai.js
│   │   ├── supplements.js
│   │   ├── leaderboards.js
│   │   ├── challenges.js
│   │   └── reels.js
│   ├── controllers/         # Business logic
│   ├── middleware/          # Authentication, validation
│   ├── services/            # External services (AI, email)
│   ├── scripts/
│   │   └── seedDatabase.js
│   ├── server.js            # Main entry point
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── api.js           # API wrapper
│   │   ├── App.js           # Main app
│   │   └── index.js
│   └── package.json
├── FEATURES.md              # Feature documentation
├── README.md                # Original README
└── docker-compose.yml       # Docker configuration
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get profile

### Workouts
- `GET /api/workouts` - List workouts
- `POST /api/workouts` - Log workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Meals
- `GET /api/meals` - List meals
- `POST /api/meals` - Log meal
- `PUT /api/meals/:id` - Update meal

### AI Features
- `POST /api/ai/meal-plan` - Generate meal plan
- `GET /api/ai/meal-plan/:id` - Get meal plan
- `POST /api/ai/health-twin` - Calculate health scores
- `GET /api/ai/health-twin/:userId` - Get health twin
- `POST /api/ai/analyze-meal` - Analyze restaurant meal

### Supplements
- `POST /api/supplements/recommend` - Get recommendations
- `GET /api/supplements/search` - Search supplements
- `GET /api/supplements/:id` - Get supplement details
- `GET /api/supplements/:id/prices` - Compare prices
- `GET /api/supplements/:id/authenticity` - Get authenticity info

### Leaderboards
- `GET /api/leaderboards/national/:category` - National rankings
- `GET /api/leaderboards/city/:city/:category` - City rankings
- `GET /api/leaderboards/college/:college/:category` - College rankings
- `GET /api/leaderboards/company/:company/:category` - Company rankings
- `GET /api/leaderboards/my-rank` - Get your rank

### Challenges
- `GET /api/challenges` - List challenges
- `GET /api/challenges/:id` - Get challenge details
- `POST /api/challenges/:id/join` - Join challenge
- `POST /api/challenges/:id/update-progress` - Log progress
- `GET /api/challenges/:id/leaderboard` - Get leaderboard

### Progress Reels
- `POST /api/reels` - Create reel
- `GET /api/reels` - Get feed
- `GET /api/reels/:id` - Get reel details
- `POST /api/reels/:id/like` - Like reel
- `POST /api/reels/:id/comment` - Add comment

---

## Common Issues & Solutions

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

### Port Already in Use
```
Error: listen EADDRINUSE :::4000
```

**Solution:**
```bash
# Kill process on port 4000
# macOS/Linux
lsof -ti:4000 | xargs kill -9

# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Or change PORT in .env
```

### OpenAI API Errors
```
Error: 401 Unauthorized
```

**Solution:**
- Check `OPENAI_API_KEY` in `.env`
- Verify key is valid at https://platform.openai.com/account/api-keys
- Ensure key has sufficient credits

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Verify `FRONTEND_URL` in backend `.env`
- Check CORS configuration in `server.js`
- Ensure frontend is using correct `REACT_APP_API_URL`

---

## Development Tips

### Hot Reload
- Backend: Nodemon automatically restarts on file changes
- Frontend: Create React App has hot reload built-in

### Debug Mode
```bash
# Backend with debug logs
DEBUG=* npm run dev

# Frontend console logs
console.log() works in browser DevTools
```

### Testing APIs
```bash
# Using curl
curl -X GET http://localhost:4000/api/health

# Using Postman
# Import API collection from docs

# Using Thunder Client (VS Code)
# Install extension and import collection
```

---

## Production Deployment

### Backend Deployment (Render, Heroku, Railway)

1. **Prepare for deployment:**
```bash
# Ensure all env vars are set
# Database should be MongoDB Atlas (not local)
# Add production URL to FRONTEND_URL
```

2. **Deploy to Render:**
```bash
# Connect GitHub repo
# Set environment variables
# Deploy from main branch
```

3. **Verify deployment:**
```bash
curl https://your-backend-url.com/api/health
```

### Frontend Deployment (Vercel, Netlify)

1. **Set production env vars:**
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

2. **Deploy to Vercel:**
```bash
npm install -g vercel
vercel --prod
```

3. **Configure custom domain:**
- Add domain in Vercel dashboard
- Update DNS records

---

## Docker Deployment

```bash
# Build image
docker build -t corematrix:latest .

# Run container
docker run -p 4000:4000 \
  -e MONGO_URI="mongodb+srv://..." \
  -e JWT_SECRET="your-secret" \
  corematrix:latest
```

---

## Monitoring & Logs

### Backend Logs
```bash
# View logs
npm run dev

# With timestamps
npm run dev 2>&1 | tee app.log
```

### Database Monitoring
```bash
# MongoDB Atlas dashboard
# View collections, indexes, performance

# Local MongoDB
mongosh
use corematrix
db.users.find()
```

---

## Next Steps

1. ✅ Complete backend setup
2. ✅ Complete frontend setup
3. 🔄 Create admin dashboard
4. 🔄 Build trainer profile features
5. 🔄 Build gym marketplace
6. 🔄 Integrate real-time features (Socket.io)
7. 🔄 Add payment integration (Stripe)
8. 🔄 Launch beta

---

## Getting Help

- 📖 Check FEATURES.md for detailed API docs
- 💬 Review README.md for project overview
- 🐛 Open an issue on GitHub
- 📧 Email: support@corematrix.com

---

## Version Information

- **Version:** 0.2.0 (Initial Release)
- **Last Updated:** 2026-06-01
- **Node:** 16+
- **MongoDB:** 4.0+
- **React:** 18.2+

Happy building! 🚀
