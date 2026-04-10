const request = require('supertest');
const app = require('../../src/app');

describe('POST /api/reservations', () => {
  it('should reject reservation with invalid dates', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({
        carId: 1,
        customerId: 1,
        startDate: '2026-06-10',
        endDate: '2026-06-05',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/endDate must be after startDate/);
  });

  it('should reject reservation for non-existing car', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({
        carId: 99999,
        customerId: 1,
        startDate: '2026-06-01',
        endDate: '2026-06-05',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/car not found/);
  });
});

describe('PATCH /api/reservations/:id/confirm', () => {
  it('should reject confirming non-existing reservation', async () => {
    const res = await request(app)
      .patch('/api/reservations/99999/confirm');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/reservation not found/);
  });
});

describe('PATCH /api/reservations/:id/cancel', () => {
  it('should reject cancelling non-existing reservation', async () => {
    const res = await request(app)
      .patch('/api/reservations/99999/cancel');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/reservation not found/);
  });
});

describe('PATCH /api/reservations/:id/return', () => {
  it('should reject returning non-existing reservation', async () => {
    const res = await request(app)
      .patch('/api/reservations/99999/return')
      .send({ returnDate: '2026-06-10' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/reservation not found/);
  });
});
