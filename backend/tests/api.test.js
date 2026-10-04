const request = require('supertest');
const app = require('../server');

describe('Node.js Express Backend API Tests', () => {
  let authToken = '';

  test('GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('POST /api/auth/login with single demo account should authenticate', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@contractanalyzer.com',
        password: 'Admin@123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();

    authToken = res.body.data.token;
  });

  test('GET /api/contracts should return list of contracts', async () => {
    const res = await request(app)
      .get('/api/contracts')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.contracts)).toBe(true);
  });

  test('GET /api/org/metrics should return organization risk metrics', async () => {
    const res = await request(app)
      .get('/api/org/metrics')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics).toBeDefined();
  });
});
