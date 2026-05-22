// Migration script: MySQL -> MongoDB
// Usage: set MySQL env vars and MONGO_URI, then run `node migrate_mysql_to_mongo.js`

const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');

async function main() {
  const mysqlConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'corematrix_db',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  };

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/corematrix';

  console.log('Connecting to MongoDB:', mongoUri);
  await mongoose.connect(mongoUri, { autoIndex: true });

  console.log('Connecting to MySQL with config:', { host: mysqlConfig.host, user: mysqlConfig.user, database: mysqlConfig.database });
  const conn = await mysql.createConnection(mysqlConfig);

  try {
    // --- Users ---
    const [users] = await conn.execute(`SELECT id, name, email, password, goal, weight_kg, height_cm, age_years, activity_level, bmi, calorie_goal, protein_goal, target_weight, created_at FROM users`);
    console.log(`Found ${users.length} users in MySQL`);

    const idMap = new Map(); // mysql id -> mongo ObjectId

    for (const u of users) {
      try {
        const email = (u.email || '').toLowerCase().trim();
        let existing = await User.findOne({ email });
        if (existing) {
          console.log('Skipping existing user:', email);
          idMap.set(u.id, existing._id);
          continue;
        }

        const newUser = new User({
          name: u.name,
          email: email,
          password: u.password, // preserve existing hashed password
          goal: u.goal || 'Build Muscle',
          weight_kg: u.weight_kg,
          height_cm: u.height_cm,
          age_years: u.age_years,
          activity_level: u.activity_level,
          bmi: u.bmi,
          calorie_goal: u.calorie_goal,
          protein_goal: u.protein_goal,
          target_weight: u.target_weight,
          created_at: u.created_at
        });
        await newUser.save();
        idMap.set(u.id, newUser._id);
      } catch (err) {
        console.error('User import error for id', u.id, err.message);
      }
    }

    // --- Workouts ---
    const [workouts] = await conn.execute(`SELECT id, user_id, name, category, sets, reps, weight, intensity, log_date, created_at FROM workouts`);
    console.log(`Found ${workouts.length} workouts in MySQL`);
    let importedW = 0;
    for (const w of workouts) {
      try {
        const mappedUser = idMap.get(w.user_id);
        if (!mappedUser) { console.warn('No mapped user for workout id', w.id, 'skipping'); continue; }
        const doc = new Workout({
          user_id: mappedUser,
          name: w.name,
          category: w.category,
          sets: w.sets,
          reps: w.reps,
          weight: w.weight,
          intensity: w.intensity,
          log_date: w.log_date,
          created_at: w.created_at
        });
        await doc.save();
        importedW++;
      } catch (err) {
        console.error('Workout import error for id', w.id, err.message);
      }
    }
    console.log(`Imported ${importedW} workouts`);

    // --- Meals ---
    const [meals] = await conn.execute(`SELECT id, user_id, name, type, calories, protein, carbs, fat, log_date, created_at FROM meals`);
    console.log(`Found ${meals.length} meals in MySQL`);
    let importedM = 0;
    for (const m of meals) {
      try {
        const mappedUser = idMap.get(m.user_id);
        if (!mappedUser) { console.warn('No mapped user for meal id', m.id, 'skipping'); continue; }
        const doc = new Meal({
          user_id: mappedUser,
          name: m.name,
          type: m.type,
          calories: m.calories,
          protein: m.protein,
          carbs: m.carbs,
          fat: m.fat,
          log_date: m.log_date,
          created_at: m.created_at
        });
        await doc.save();
        importedM++;
      } catch (err) {
        console.error('Meal import error for id', m.id, err.message);
      }
    }
    console.log(`Imported ${importedM} meals`);

    console.log('Migration complete');

  } finally {
    await conn.end();
    await mongoose.disconnect();
  }
}

main().catch(err => { console.error('Migration failed:', err); process.exit(1); });
