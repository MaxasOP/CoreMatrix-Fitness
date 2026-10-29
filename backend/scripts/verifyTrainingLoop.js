// Isolated integration harness. No existing database or provider credentials are used.
// Install mongodb-memory-server in a temporary directory and set TEST_MONGO_MODULE
// to its absolute module path. --serve keeps the synthetic account available for UI QA.
process.env.JWT_SECRET = 'isolated-upgrade-verification-secret';
const assert = require('node:assert/strict');
const express = require('express');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require(process.env.TEST_MONGO_MODULE || 'mongodb-memory-server');
const aiService = require('../services/aiService');
const FormAnalysis = require('../models/FormAnalysis');
const WorkoutPlan = require('../models/WorkoutPlan');

aiService.generateWorkoutPlan = async () => ({ plan_name: 'Verification week', goal_focus: 'General Fitness', days_per_week: 1, weekly_routine: [{ day: 'Day 1', target_muscle_group: 'Full body', exercises: [{ name: 'Goblet squat', sets: 3, reps: 8, rest_seconds: 90 }, { name: 'Push-up', sets: 3, reps: 10, rest_seconds: 60 }] }] });

async function main() {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  const app = express();
  app.use(express.json());
  app.use('/api/auth', require('../routes/auth'));
  app.use('/api', require('../routes/fitness'));
  app.use('/api/ai', require('../routes/ai'));
  app.get('/api/video/history', require('../middleware/authMiddleware').authRequired, async (req, res) => res.json(await FormAnalysis.find({ userId: req.user.id }).lean()));
  const account = await request(app).post('/api/auth/register').send({ name: 'Upgrade Tester', email: 'upgrade@example.test', password: 'UpgradeTest123!' });
  assert.equal(account.status, 201);
  const auth = { Authorization: `Bearer ${account.body.token}` };
  const profile = await request(app).put('/api/auth/profile').set(auth).send({ goal: 'General Fitness', weightKg: 70, activityLevel: 'high' });
  assert.equal(profile.status, 200);
  const plan = await request(app).post('/api/ai/workout-plan').set(auth).send({ experience_level: 'beginner', days_per_week: 1, equipment_available: 'bodyweight' });
  assert.equal(plan.status, 201);
  assert.equal((await request(app).post('/api/ai/workout-plan/complete-day').set(auth).send({ dayIndex: 0 })).status, 409);
  const logs = [];
  for (const [index, name] of ['Goblet squat', 'Push-up'].entries()) {
    const response = await request(app).post('/api/workouts').set(auth).send({ name, sets: 3, reps: 8, weight: 10, feel: 'easy', plan_id: plan.body.planId, plan_day_index: 0, plan_exercise_index: index });
    assert.equal(response.status, 201);
    logs.push(response.body);
  }
  await FormAnalysis.create({ userId: account.body.userId, workoutId: logs[0]._id, exercise: 'Goblet squat', score: 95, reps: 8, detectionConfidence: 95, issues: [] });
  const guidance = await request(app).get('/api/ai/training-coach').set(auth);
  assert.equal(guidance.body.recommendations.find(item => item.name === 'Goblet squat').action, 'add_rep');
  assert.equal(guidance.body.recommendations.find(item => item.name === 'Push-up').action, 'repeat');
  const finish = await request(app).post('/api/ai/workout-plan/complete-day').set(auth).send({ dayIndex: 0 });
  assert.equal(finish.status, 200);
  assert.equal(finish.body.session.totalSets, 6);
  await request(app).post('/api/ai/workout-plan/complete-day').set(auth).send({ dayIndex: 0 });
  assert.equal((await WorkoutPlan.findById(plan.body.planId)).sessions.length, 1);
  assert.equal((await request(app).post('/api/meals').set(auth).send({ name: 'Dal and rice', calories: 450, protein: 20, carbs: 65, fat: 10, type: 'lunch' })).status, 201);
  assert.equal((await request(app).get('/api/meals').set(auth)).body.length, 1);
  assert.equal((await request(app).get('/api/ai/training-coach')).status, 401);
  await request(app).delete(`/api/workouts/${logs[1]._id}`).set(auth);
  assert.equal((await WorkoutPlan.findById(plan.body.planId)).sessions.length, 0);
  await request(app).post('/api/workouts').set(auth).send({ name: 'Push-up', sets: 3, reps: 8, weight: 0, feel: 'moderate', plan_id: plan.body.planId, plan_day_index: 0, plan_exercise_index: 1 });
  await request(app).post('/api/ai/workout-plan/complete-day').set(auth).send({ dayIndex: 0 });
  const nextCycle = await request(app).post('/api/ai/workout-plan/next-cycle').set(auth);
  assert.equal(nextCycle.status, 201);
  const next = await WorkoutPlan.findById(nextCycle.body.planId);
  assert.equal(next.plan.weekly_routine[0].exercises[0].reps, 9);
  assert.equal(next.progress.length, 0);
  assert.equal((await WorkoutPlan.findById(plan.body.planId)).status, 'archived');
  assert.equal((await request(app).post('/api/ai/workout-plan/next-cycle').set(auth)).status, 409);
  console.log('PASS: registration → profile → plan → logs → linked review → guidance → session completion → meals → deletion consistency → next cycle; authentication and duplicate completion verified.');
  if (process.argv.includes('--serve')) {
    app.listen(4000, () => console.log('Isolated UI test API listening on 4000. Synthetic account: upgrade@example.test / UpgradeTest123!'));
  } else { await mongoose.disconnect(); await mongo.stop(); }
}
main().catch(error => { console.error(error); process.exit(1); });
