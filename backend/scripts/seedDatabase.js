// backend/scripts/seedDatabase.js
// Initialize database with sample supplements and challenges

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Supplement = require('../models/Supplement');
const Challenge = require('../models/Challenge');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/corematrix';

// Sample supplements data
const sampleSupplements = [
  {
    name: 'Optimum Nutrition Gold Standard Whey',
    category: 'protein',
    description: 'Premium whey protein isolate with excellent amino acid profile',
    quantity: '1kg',
    servings_per_container: 33,
    serving_size: '1 scoop (30g)',
    calories: 120,
    protein: 24,
    carbs: 2,
    fat: 2,
    sugar: 1,
    ingredients: ['Whey Protein Isolate', 'Lecithin', 'Natural Vanilla Flavor'],
    benefits: ['Muscle growth', 'Recovery', 'Lean mass'],
    recommended_for: ['muscle_gain', 'recovery'],
    recommended_dosage: '1-2 scoops per serving',
    timing: 'post_workout',
    authenticity_score: 95,
    batch_verification_available: true,
    qr_code_verifiable: true,
    prices: [
      {
        vendor_name: 'Amazon',
        price: 5200,
        original_price: 6000,
        discount_percentage: 13,
        url: 'https://amazon.in',
        in_stock: true,
        rating: 4.5,
        reviews_count: 2341
      },
      {
        vendor_name: 'Flipkart',
        price: 4999,
        original_price: 5999,
        discount_percentage: 17,
        url: 'https://flipkart.com',
        in_stock: true,
        rating: 4.4,
        reviews_count: 1892
      },
      {
        vendor_name: 'HealthKart',
        price: 4699,
        original_price: 5499,
        discount_percentage: 15,
        url: 'https://healthkart.com',
        in_stock: true,
        rating: 4.6,
        reviews_count: 5234
      }
    ],
    lowest_verified_price: 4699,
    lowest_price_vendor: 'HealthKart',
    average_rating: 4.5,
    review_count: 9467,
    affiliate_commission_percentage: 5
  },
  {
    name: 'Creatine Monohydrate',
    category: 'creatine',
    description: 'Pure creatine monohydrate for strength and muscle gains',
    quantity: '500g',
    servings_per_container: 166,
    serving_size: '3g',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    ingredients: ['Creatine Monohydrate'],
    benefits: ['Strength increase', 'Muscle mass', 'Power output'],
    recommended_for: ['muscle_gain', 'strength'],
    recommended_dosage: '5g daily',
    timing: 'with_meals',
    cycle_recommendation: '8-12 weeks on, 2 weeks off',
    authenticity_score: 92,
    prices: [
      {
        vendor_name: 'MuscleBlaze',
        price: 599,
        original_price: 799,
        discount_percentage: 25,
        url: 'https://muscleblaze.com',
        in_stock: true,
        rating: 4.3,
        reviews_count: 3421
      }
    ],
    lowest_verified_price: 599,
    lowest_price_vendor: 'MuscleBlaze',
    average_rating: 4.3,
    review_count: 3421,
    affiliate_commission_percentage: 8
  },
  {
    name: 'Fish Oil Omega-3',
    category: 'fish_oil',
    description: 'Omega-3 fatty acids for heart and joint health',
    quantity: '120 capsules',
    servings_per_container: 60,
    serving_size: '2 capsules',
    calories: 20,
    protein: 0,
    carbs: 0,
    fat: 2,
    ingredients: ['Fish Oil', 'Gelatin', 'Glycerin'],
    benefits: ['Heart health', 'Joint support', 'Brain function'],
    recommended_for: ['recovery', 'health'],
    recommended_dosage: '2 capsules daily',
    timing: 'with_meals',
    authenticity_score: 88,
    prices: [
      {
        vendor_name: 'HealthKart',
        price: 1299,
        original_price: 1599,
        discount_percentage: 19,
        url: 'https://healthkart.com',
        in_stock: true,
        rating: 4.2,
        reviews_count: 1245
      }
    ],
    lowest_verified_price: 1299,
    lowest_price_vendor: 'HealthKart',
    average_rating: 4.2,
    review_count: 1245,
    affiliate_commission_percentage: 6
  }
];

// Sample challenges data
const sampleChallenges = [
  {
    name: '10,000 Steps Daily Challenge',
    description: 'Walk 10,000 steps every day for 30 days. Track your daily steps and build consistency.',
    type: 'steps',
    goal: 300000,
    goal_unit: 'steps',
    duration_days: 30,
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    end_date: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000), // 37 days from now
    difficulty: 'easy',
    recommended_for: ['beginners', 'intermediate', 'advanced'],
    is_public: true,
    allow_late_join: true,
    reward_points_per_participant: 100,
    reward_points_first_place: 500,
    reward_points_second_place: 300,
    reward_points_third_place: 200,
    prize_description: 'Winners get exclusive CoreMatrix merchandise',
    status: 'upcoming',
    rules: [
      'Log your steps daily using a fitness tracker or app',
      'Maintain consistency throughout the challenge',
      'Must hit 10,000 steps daily to progress'
    ],
    guidelines: [
      'Steps must be tracked from a verified source',
      'Indoor and outdoor steps count',
      'All ages and fitness levels welcome'
    ]
  },
  {
    name: '30-Day Yoga Challenge',
    description: 'Complete a 30-minute yoga session for 30 consecutive days. Focus on flexibility and mindfulness.',
    type: 'yoga',
    goal: 30,
    goal_unit: 'days',
    duration_days: 30,
    start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000),
    difficulty: 'medium',
    recommended_for: ['beginners', 'intermediate'],
    is_public: true,
    allow_late_join: true,
    reward_points_per_participant: 150,
    reward_points_first_place: 750,
    reward_points_second_place: 400,
    reward_points_third_place: 250,
    prize_description: 'Free premium yoga classes for 3 months',
    status: 'upcoming',
    rules: [
      'Complete at least 30 minutes of yoga daily',
      'Any style of yoga counts (Hatha, Vinyasa, Ashtanga, etc.)',
      'Post daily photos or videos (optional) for accountability'
    ],
    guidelines: [
      'Beginners should start with beginner-friendly routines',
      'Listen to your body and modify poses as needed',
      'Consistency matters more than intensity'
    ]
  },
  {
    name: '100 Pushups Challenge',
    description: 'Do 100 pushups daily for 30 days. Modify as needed to match your fitness level.',
    type: 'pushups',
    goal: 3000,
    goal_unit: 'reps',
    duration_days: 30,
    start_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 51 * 24 * 60 * 60 * 1000),
    difficulty: 'hard',
    recommended_for: ['intermediate', 'advanced'],
    is_public: true,
    allow_late_join: true,
    reward_points_per_participant: 200,
    reward_points_first_place: 1000,
    reward_points_second_place: 600,
    reward_points_third_place: 400,
    prize_description: 'Free protein supply for 2 months + merchandise',
    status: 'upcoming',
    rules: [
      'Complete 100 pushups daily',
      'Any style of pushup counts (regular, wide, narrow, decline, etc.)',
      'Must complete all reps in a single session or multiple sessions throughout the day'
    ],
    guidelines: [
      'Form matters - maintain proper chest-to-ground alignment',
      'Beginners can modify with wall pushups or knee pushups',
      'Rest days are allowed but break your streak'
    ]
  },
  {
    name: 'Corporate Wellness Challenge - ABC Corp',
    description: 'Compete with your colleagues. Track workouts, meals, and consistency.',
    type: 'fat_loss',
    goal: 100,
    goal_unit: 'percentage',
    duration_days: 60,
    start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 62 * 24 * 60 * 60 * 1000),
    difficulty: 'medium',
    is_sponsored: true,
    sponsor_name: 'ABC Corp HR',
    sponsor_product: 'Employee Wellness',
    is_public: false,
    max_participants: 500,
    reward_points_per_participant: 250,
    reward_points_first_place: 2000,
    reward_points_second_place: 1200,
    reward_points_third_place: 800,
    prize_description: 'Winner gets 1 month free gym membership + health insurance discount',
    status: 'active',
    rules: [
      'Log all workouts and meals',
      'Must maintain at least 4 workouts per week',
      'Consistency score determines ranking'
    ],
    guidelines: [
      'Company employees only',
      'Leaderboard updated weekly',
      'Winners announced at company annual event'
    ]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to preserve existing data)
    // await Supplement.deleteMany({});
    // await Challenge.deleteMany({});

    // Insert supplements
    console.log('Seeding supplements...');
    const insertedSupplements = await Supplement.insertMany(sampleSupplements, { ordered: false });
    console.log(`✓ Inserted ${insertedSupplements.length} supplements`);

    // Insert challenges
    console.log('Seeding challenges...');
    const insertedChallenges = await Challenge.insertMany(sampleChallenges, { ordered: false });
    console.log(`✓ Inserted ${insertedChallenges.length} challenges`);

    console.log('\n✓ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
}

// Run the seed
seedDatabase();
