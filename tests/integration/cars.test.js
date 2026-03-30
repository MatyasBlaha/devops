import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';

describe('GET /health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/cars', () => {
  it('should create a car', async () => {
    const res = await request(app)
      .post('/api/cars')
      .send({ brand: 'Skoda', model: 'Octavia', year: 2022, pricePerDay: 1000, category: 'standard' });

    expect(res.status).toBe(201);
    expect(res.body.brand).toBe('Skoda');
  });

  it('should reject invalid data', async () => {
    const res = await request(app)
      .post('/api/cars')
      .send({ model: 'Octavia', year: 2022, pricePerDay: 1000 });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/cars', () => {
  it('should return list of cars', async () => {
    const res = await request(app).get('/api/cars');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
