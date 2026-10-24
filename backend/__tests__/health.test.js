const request = require('supertest');
const { app } = require('../server');

describe('service health', () => {
  test('GET /api/health responds without waiting for MongoDB', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok', version: '0.2.0' });
    expect(['connecting', 'connected', 'disconnected']).toContain(response.body.database);
  });

  test('GET /api/ready reports database readiness', async () => {
    const response = await request(app).get('/api/ready');
    expect([200, 503]).toContain(response.status);
    expect(response.body).toHaveProperty('database');
  });

  test('protected static routes are not swallowed by id routes', async () => {
    const challengeResponse = await request(app).get('/api/challenges/user-challenges');
    const reelResponse = await request(app).get('/api/reels/my-reels');
    expect(challengeResponse.status).toBe(401);
    expect(reelResponse.status).toBe(401);
  });
});
