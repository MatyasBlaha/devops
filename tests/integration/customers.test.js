const request = require('supertest');
const app = require('../../src/app');

describe('POST /api/customers', () => {
  it('should create a customer', async () => {
    const res = await request(app)
      .post('/api/customers')
      .send({
        name: 'Tomas Qwer',
        email: 'tomas@qwer.com',
        driversLicenseNumber: 'ZZ55555',
        driversLicenseDate: '2020-03-10T00:00:00.000Z',
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Tomas Qwer');
  });

  it('should reject invalid data', async () => {
    const res = await request(app)
      .post('/api/customers')
      .send({ name: 'Tomas Qwer' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/customers', () => {
  it('should return list of customers', async () => {
    const res = await request(app).get('/api/customers');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/customers/:id', () => {
  it('should return 404 for non-existing customer', async () => {
    const res = await request(app).get('/api/customers/999');

    expect(res.status).toBe(404);
  });
});
