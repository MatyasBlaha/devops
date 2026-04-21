const request = require('supertest');
const app = require('../../src/app');

describe('POST /api/customers', () => {
  it('should create a customer', async () => {
    const unique = Date.now();
    const res = await request(app)
      .post('/api/customers')
      .send({
        name: 'Tomas Qwer',
        email: `tomas+${unique}@qwer.com`,
        driversLicenseNumber: `ZZ${unique}`,
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

  it('should return 409 for duplicate email', async () => {
    const unique = Date.now();
    const email = `dup+${unique}@qwer.com`;
    const payload = {
      name: 'Tomas Qwer',
      email,
      driversLicenseNumber: `DUP${unique}`,
      driversLicenseDate: '2020-03-10T00:00:00.000Z',
    };

    await request(app).post('/api/customers').send(payload);
    const res = await request(app).post('/api/customers').send({ ...payload, driversLicenseNumber: `DUP${unique}X` });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email already exists/);
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
