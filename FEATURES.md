# CoreMatrix Fitness Super App - Features Documentation

This document outlines all the features and API endpoints implemented in CoreMatrix v0.2.0.

## Table of Contents

1. [AI Dietician](#ai-dietician)
2. [Smart Supplement Engine](#smart-supplement-engine)
3. [Progress Reels & Social](#progress-reels--social)
4. [Leaderboards](#leaderboards)
5. [Fitness Challenges](#fitness-challenges)
6. [AI Health Twin](#ai-health-twin)
7. [Database Models](#database-models)

---

## AI Dietician

### Overview
Generate personalized meal plans based on user profile, goals, budget, and dietary preferences. The system recommends Indian food alternatives and provides macro breakdowns.

### API Endpoints

#### Generate Meal Plan
```
POST /api/ai/meal-plan
Authorization: Bearer <token>

Request Body:
{
  // User data is fetched from their profile
}

Response:
{
  "message": "Meal plan generated successfully",
  "mealPlan": {
    "_id": "...",
    "user_id": "...",
    "name": "Muscle Gain Plan - 2500 calories",
    "breakfast": {
      "meal_name": "Paneer Paratha",
      "quantity": "2 parathas + 1 cup curd",
      "calories": 400,
      "protein": 15,
      "carbs": 40,
      "fat": 15,
      "indian_alternatives": ["Sprouts Paratha", "Soya Chunks Curry", "...]
    },
    "lunch": {...},
    "dinner": {...},
    "snacks": [...],
    "daily_macros": {
      "protein": 150,
      "carbs": 250,
      "fat": 70,
      "calories": 2500
    },
    "estimated_monthly_cost": 6000,
    "cost_breakdown": {...},
    "ai_notes": "Focus on protein intake...",
    "created_at": "2026-06-01T..."
  }
}
```

#### Get Meal Plan
```
GET /api/ai/meal-plan/:mealPlanId
Authorization: Bearer <token>

Response:
{
  "message": "Meal plan retrieved",
  "mealPlan": {...}
}
```

### Features
- ✅ Personalized meal planning
- ✅ Indian food recommendations
- ✅ Macro tracking (protein, carbs, fats)
- ✅ Cost estimation
- ✅ Budget-aware recommendations
- ✅ Diet preference support (vegetarian, vegan, jain, non-veg)

---

## Smart Supplement Engine

### Overview
AI-powered supplement recommendations with price comparison across major Indian retailers and authenticity verification.

### API Endpoints

#### Get Recommendations
```
POST /api/supplements/recommend
Authorization: Bearer <token>

Response:
{
  "message": "Supplements recommended",
  "recommendations": [
    {
      "name": "Optimum Nutrition Gold Standard Whey",
      "category": "protein",
      "explanation": "High-quality whey protein with 24g protein per serving...",
      "dosage": "1-2 scoops post-workout",
      "timing": "post_workout",
      "benefits": ["Muscle growth", "Recovery"],
      "supplement_id": "...",
      "prices": [...],
      "lowest_verified_price": 4699,
      "lowest_price_vendor": "HealthKart",
      "rating": 4.5
    }
  ],
  "total": 6
}
```

#### Search Supplements
```
GET /api/supplements/search?query=whey&category=protein&limit=10

Response:
{
  "message": "Supplements found",
  "supplements": [...],
  "total": 8
}
```

#### Get Price Comparison
```
GET /api/supplements/:supplementId/prices

Response:
{
  "supplement_name": "Optimum Nutrition Gold Standard Whey",
  "prices": [
    {
      "vendor": "HealthKart",
      "price": 4699,
      "original_price": 5499,
      "discount": 15,
      "url": "https://healthkart.com/...",
      "in_stock": true,
      "rating": 4.6,
      "reviews_count": 5234
    },
    {
      "vendor": "Flipkart",
      "price": 4999,
      ...
    }
  ],
  "lowest_price": 4699,
  "highest_price": 5200,
  "price_difference": 501,
  "authenticity_score": 95
}
```

#### Get Authenticity Info
```
GET /api/supplements/:supplementId/authenticity

Response:
{
  "supplement_name": "Optimum Nutrition Gold Standard Whey",
  "authenticity_score": 95,
  "batch_verification_available": true,
  "qr_code_verifiable": true,
  "verified_vendors": [
    {
      "vendor": "HealthKart",
      "rating": 4.6,
      "reviews_count": 5234
    }
  ],
  "message": "Authenticity information retrieved"
}
```

### Features
- ✅ AI supplement recommendations
- ✅ Price comparison (Amazon, Flipkart, HealthKart, MuscleBlaze)
- ✅ Authenticity scoring
- ✅ Verified seller badges
- ✅ Batch verification & QR codes
- ✅ User reviews integration
- ✅ Affiliate commission tracking

---

## Progress Reels & Social

### Overview
Share fitness transformation photos, workout videos, yoga sessions, and meal posts. AI moderation ensures community standards, and smart feed shows content from similar users.

### API Endpoints

#### Create Reel
```
POST /api/reels
Authorization: Bearer <token>

Request Body:
{
  "title": "60 Day Transformation",
  "description": "Lost 8kg, gained confidence!",
  "type": "transformation", // transformation, workout, yoga, meal, journey, progress
  "media_url": "https://cloudinary.com/...",
  "media_type": "image", // image, video
  "tags": ["#fatloss", "#transformation", "#fitness"],
  "category": "weight_loss"
}

Response:
{
  "message": "Reel created successfully",
  "reel": {
    "_id": "...",
    "user_id": "...",
    "title": "60 Day Transformation",
    "likes_count": 0,
    "comments_count": 0,
    "views_count": 0,
    "moderation_status": "approved",
    "ai_checks": {
      "nudity_detected": false,
      "unrelated_content": false,
      "spam_detected": false,
      "contains_fitness_content": true
    }
  }
}
```

#### Get Feed
```
GET /api/reels?limit=20&offset=0
Authorization: Bearer <token>

Response:
{
  "message": "Feed retrieved",
  "reels": [
    {
      "_id": "...",
      "title": "Morning Yoga Session",
      "user_id": {...},
      "likes_count": 234,
      "comments_count": 45,
      "views_count": 1200,
      "tags": ["#yoga", "#morning", "#flexibility"],
      "created_at": "2026-06-01T..."
    }
  ],
  "total": 20
}
```

#### Like Reel
```
POST /api/reels/:reelId/like
Authorization: Bearer <token>

Response:
{
  "message": "Like updated",
  "likes_count": 235,
  "is_liked": true
}
```

#### Add Comment
```
POST /api/reels/:reelId/comment
Authorization: Bearer <token>

Request Body:
{
  "comment_text": "Amazing progress! Keep it up!"
}

Response:
{
  "message": "Comment added",
  "comments_count": 46
}
```

### Features
- ✅ Upload transformation photos/videos
- ✅ AI content moderation
- ✅ Smart feed (similar goals/age/city)
- ✅ Like & comment system
- ✅ Viral scoring algorithm
- ✅ Share to other platforms (future)

---

## Leaderboards

### Overview
Real-time rankings across national, city, college, and company levels. Track fat loss, muscle gain, consistency, and longest streaks.

### API Endpoints

#### Get National Leaderboard
```
GET /api/leaderboards/national/fat_loss?period=monthly&limit=50

Response:
{
  "scope": "national",
  "category": "fat_loss",
  "period": "monthly",
  "leaderboard": [
    {
      "_id": "...",
      "rank": 1,
      "username": "John Fitness",
      "score": 12.5,
      "metrics": {
        "weight_lost_kg": 12.5,
        "weight_lost_percentage": 15
      },
      "badge": "gold"
    },
    {
      "rank": 2,
      "username": "Priya Strong",
      "score": 10.8,
      ...
    }
  ],
  "total": 50
}
```

#### Get City Leaderboard
```
GET /api/leaderboards/city/Mumbai/most_consistent?period=monthly&limit=50

Response:
{
  "scope": "city",
  "city": "Mumbai",
  "category": "most_consistent",
  "period": "monthly",
  "leaderboard": [...]
}
```

#### Get College Leaderboard
```
GET /api/leaderboards/college/IIT-Bombay/muscle_gain?period=monthly&limit=50

Response:
{
  "scope": "college",
  "college": "IIT-Bombay",
  "category": "muscle_gain",
  "leaderboard": [...]
}
```

#### Get Company Leaderboard
```
GET /api/leaderboards/company/ABC-Corp/longest_streak?period=monthly&limit=50

Response:
{
  "scope": "company",
  "company": "ABC-Corp",
  "category": "longest_streak",
  "leaderboard": [...]
}
```

#### Get My Rank
```
GET /api/leaderboards/my-rank
Authorization: Bearer <token>

Response:
{
  "user_id": "...",
  "name": "John Fitness",
  "city": "Mumbai",
  "college": "IIT-Bombay",
  "company": "TCS",
  "ranks": [
    {
      "category": "fat_loss",
      "scope": "national",
      "rank": 145,
      "score": 5.2,
      "badge": "silver"
    },
    {
      "category": "most_consistent",
      "scope": "city",
      "rank": 23,
      "badge": "bronze"
    }
  ]
}
```

### Features
- ✅ National leaderboards
- ✅ City-wise rankings
- ✅ College competitions
- ✅ Corporate wellness tracking
- ✅ Multiple ranking categories
- ✅ Weekly/monthly/all-time periods
- ✅ Reward badges (gold, silver, bronze)

---

## Fitness Challenges

### Overview
Community-driven fitness challenges with viral potential. Users compete, earn rewards, and build streaks. Sponsored challenges create revenue opportunities.

### API Endpoints

#### List Active Challenges
```
GET /api/challenges?status=active&type=yoga&limit=20

Response:
{
  "message": "Challenges retrieved",
  "challenges": [
    {
      "_id": "...",
      "name": "30-Day Yoga Challenge",
      "description": "Complete a 30-minute yoga session...",
      "type": "yoga",
      "goal": 30,
      "goal_unit": "days",
      "duration_days": 30,
      "start_date": "2026-06-07T...",
      "end_date": "2026-07-07T...",
      "difficulty": "medium",
      "participants_count": 245,
      "status": "active",
      "is_sponsored": false,
      "reward_points_per_participant": 150,
      "prize_description": "Free premium yoga classes for 3 months"
    }
  ],
  "total": 8
}
```

#### Join Challenge
```
POST /api/challenges/:challengeId/join
Authorization: Bearer <token>

Response:
{
  "message": "Successfully joined challenge",
  "challenge": {...}
}
```

#### Update Progress
```
POST /api/challenges/:challengeId/update-progress
Authorization: Bearer <token>

Request Body:
{
  "progress_value": 1 // Increment progress
}

Response:
{
  "message": "Progress updated",
  "progress": 5,
  "progress_percentage": 16.67,
  "is_completed": false,
  "rank": 42
}
```

#### Get Challenge Leaderboard
```
GET /api/challenges/:challengeId/leaderboard?limit=50

Response:
{
  "challenge_name": "30-Day Yoga Challenge",
  "goal": 30,
  "goal_unit": "days",
  "leaderboard": [
    {
      "rank": 1,
      "username": "YogaQueen",
      "progress": 30,
      "progress_percentage": 100,
      "is_completed": true
    },
    {
      "rank": 2,
      "username": "FlexibilityMaster",
      "progress": 28,
      "progress_percentage": 93.33,
      "is_completed": false
    }
  ],
  "total_participants": 245
}
```

### Challenge Types
- 10k Steps Challenge
- 30-Day Yoga Challenge
- 100 Pushups Challenge
- Fat Loss Challenge
- Muscle Gain Challenge
- Consistency Challenge
- Sponsored Challenges

### Features
- ✅ Multiple challenge types
- ✅ Leaderboard tracking
- ✅ Reward system (wallet points)
- ✅ Sponsored challenges (revenue)
- ✅ Progress verification
- ✅ Automated notifications
- ✅ Challenge completion badges

---

## AI Health Twin

### Overview
Calculate personalized health scores based on fitness metrics, nutrition, recovery, and consistency. Generate actionable recommendations.

### API Endpoints

#### Calculate Health Twin
```
POST /api/ai/health-twin
Authorization: Bearer <token>

Response:
{
  "message": "Health twin scores calculated",
  "health_scores": {
    "fitness_age": 28,
    "strength_score": 72,
    "recovery_score": 68,
    "mobility_score": 65,
    "nutrition_score": 78,
    "consistency_score": 85,
    "overall_health_score": 74,
    "last_updated": "2026-06-01T..."
  },
  "recommendations": [
    "Focus on recovery - consider more sleep and active recovery days",
    "Great consistency! Keep up the 5-day workout streaks",
    "Improve mobility with daily stretching routines"
  ]
}
```

#### Get Health Twin
```
GET /api/ai/health-twin/:userId

Response:
{
  "health_scores": {
    "fitness_age": 28,
    "strength_score": 72,
    ...
  },
  "message": "Health twin scores retrieved"
}
```

### Features
- ✅ Fitness Age calculation
- ✅ Strength scoring
- ✅ Recovery intelligence
- ✅ Mobility assessment
- ✅ Nutrition scoring
- ✅ Consistency tracking
- ✅ Overall health score (0-100)
- ✅ Personalized recommendations

---

## Database Models

### User Model
Enhanced user profile with:
- Physical attributes (age, weight, height, BMI)
- Goals and preferences
- Location & language
- Health twin scores
- Streaks & achievements
- Wallet points
- Family account connection

### MealPlan Model
- Personalized meal plans (breakfast, lunch, dinner, snacks)
- Macro targets
- Cost breakdown
- Indian food alternatives
- AI-generated insights
- Duration tracking

### Supplement Model
- Supplement database with specifications
- Price tracking (multiple vendors)
- Authenticity scoring
- Batch verification
- User reviews
- Affiliate tracking

### ProgressReel Model
- User-generated content (photos/videos)
- Likes, comments, shares
- AI moderation checks
- Smart feed algorithm
- Viral scoring
- Engagement metrics

### Leaderboard Model
- Rankings (national, city, college, company)
- Multiple categories
- Time periods (weekly, monthly, all-time)
- User metrics tracking
- Reward badges

### Challenge Model
- Challenge definitions
- Participant tracking
- Leaderboard state
- Reward system
- Sponsorship info
- Progress verification

### TrainerProfile Model
- Trainer credentials
- Specializations
- Availability & pricing
- Ratings & reviews
- Payment methods
- Verification status

### Gym Model
- Gym information
- Facilities & equipment
- Operating hours
- Membership plans
- Real-time occupancy
- Crowd prediction

### Booking Model
- Session bookings
- Payment tracking
- Cancellation policies
- Reviews & feedback
- Session outcomes

### FitnessWallet Model
- Points tracking
- Earning rules
- Redemption options
- Tier/membership levels
- Transaction history

### FamilyAccount Model
- Family member tracking
- Shared features
- Privacy settings
- Family goals & analytics
- Subscription management

---

## Getting Started

### 1. Setup Environment Variables
```bash
cp backend/.env.example backend/.env
# Edit .env with your values
```

### 2. Install Dependencies
```bash
cd backend && npm install
cd ../client && npm install
```

### 3. Seed Database (Optional)
```bash
cd backend
node scripts/seedDatabase.js
```

### 4. Run Backend
```bash
cd backend
npm run dev
```

### 5. Run Frontend
```bash
cd client
npm start
```

---

## API Rate Limiting

- Default: 100 requests per 15 minutes
- Authentication endpoints: 20 requests per 15 minutes
- File upload: 10 requests per 15 minutes

---

## Error Codes

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

---

## Future Enhancements

- [ ] Video form correction with MediaPipe
- [ ] Real-time chat with trainers (Socket.io)
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] AR try-on for supplements
- [ ] Meal scanning with image recognition
- [ ] Integration with wearables (Apple Watch, Fitbit)
- [ ] Multi-language support (Hindi, Tamil, Telugu, etc.)
- [ ] Premium subscription tiers
- [ ] Affiliate marketplace

---

## Support & Documentation

For detailed API documentation, check `/docs` or visit the API explorer at `/api-explorer`.

Last updated: 2026-06-01
Version: 0.2.0
