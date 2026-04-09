const { createTestCar, createTestReservation } = require('../helpers/testFactory');

const mockPrisma = {
  reservation: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  car: {
    findUnique: jest.fn(),
  },
};

const reservationService = require('../../src/services/reservationService')(mockPrisma);

describe('ReservationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a reservation for available car', async () => {
      const car = createTestCar({ status: 'available' });
      mockPrisma.car.findUnique.mockResolvedValue(car);
      mockPrisma.reservation.findMany.mockResolvedValue([]);
      mockPrisma.reservation.create.mockResolvedValue(createTestReservation());

      const result = await reservationService.create({
        carId: 1,
        customerId: 1,
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-04'),
      });

      expect(result.status).toBe('pending');
      expect(mockPrisma.reservation.create).toHaveBeenCalledTimes(1);
    });

    it('should reject reservation for car in maintenance', async () => {
      const car = createTestCar({ status: 'maintenance' });
      mockPrisma.car.findUnique.mockResolvedValue(car);

      await expect(reservationService.create({
        carId: 1,
        customerId: 1,
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-04'),
      })).rejects.toThrow('car is not available');
    });

    it('should reject reservation for retired car', async () => {
      const car = createTestCar({ status: 'retired' });
      mockPrisma.car.findUnique.mockResolvedValue(car);

      await expect(reservationService.create({
        carId: 1,
        customerId: 1,
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-04'),
      })).rejects.toThrow('car is not available');
    });

    it('should reject reservation for non-existing car', async () => {
      mockPrisma.car.findUnique.mockResolvedValue(null);

      await expect(reservationService.create({
        carId: 999,
        customerId: 1,
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-04'),
      })).rejects.toThrow('car not found');
    });

    it('should reject when dates overlap with existing reservation', async () => {
      const car = createTestCar({ status: 'available' });
      mockPrisma.car.findUnique.mockResolvedValue(car);
      mockPrisma.reservation.findMany.mockResolvedValue([
        createTestReservation({ startDate: new Date('2026-05-02'), endDate: new Date('2026-05-06') }),
      ]);

      await expect(reservationService.create({
        carId: 1,
        customerId: 1,
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-04'),
      })).rejects.toThrow('car is already reserved for these dates');
    });

    it('should allow reservation when dates do not overlap', async () => {
      const car = createTestCar({ status: 'available' });
      mockPrisma.car.findUnique.mockResolvedValue(car);
      mockPrisma.reservation.findMany.mockResolvedValue([
        createTestReservation({ startDate: new Date('2026-05-10'), endDate: new Date('2026-05-15') }),
      ]);
      mockPrisma.reservation.create.mockResolvedValue(createTestReservation());

      const result = await reservationService.create({
        carId: 1,
        customerId: 1,
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-04'),
      });

      expect(result.status).toBe('pending');
    });

    it('should reject when endDate is before startDate', async () => {
      const car = createTestCar({ status: 'available' });
      mockPrisma.car.findUnique.mockResolvedValue(car);

      await expect(reservationService.create({
        carId: 1,
        customerId: 1,
        startDate: new Date('2026-05-10'),
        endDate: new Date('2026-05-05'),
      })).rejects.toThrow('endDate must be after startDate');
    });
  });

  describe('confirm', () => {
    it('should confirm a pending reservation', async () => {
      const reservation = createTestReservation({ status: 'pending' });
      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);
      mockPrisma.reservation.update.mockResolvedValue({ ...reservation, status: 'confirmed' });

      const result = await reservationService.confirm(1);

      expect(result.status).toBe('confirmed');
      expect(mockPrisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'confirmed' },
      });
    });

    it('should reject confirming an active reservation', async () => {
      const reservation = createTestReservation({ status: 'active' });
      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);

      await expect(reservationService.confirm(1))
        .rejects.toThrow('cannot transition from active to confirmed');
    });
  });

  describe('activate', () => {
    it('should activate a confirmed reservation', async () => {
      const reservation = createTestReservation({ status: 'confirmed' });
      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);
      mockPrisma.reservation.update.mockResolvedValue({ ...reservation, status: 'active' });

      const result = await reservationService.activate(1);

      expect(result.status).toBe('active');
    });

    it('should reject activating a pending reservation', async () => {
      const reservation = createTestReservation({ status: 'pending' });
      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);

      await expect(reservationService.activate(1))
        .rejects.toThrow('cannot transition from pending to active');
    });
  });

  describe('complete', () => {
    it('should complete an active reservation', async () => {
      const reservation = createTestReservation({ status: 'active' });
      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);
      mockPrisma.reservation.update.mockResolvedValue({ ...reservation, status: 'completed' });

      const result = await reservationService.complete(1);

      expect(result.status).toBe('completed');
    });

    it('should reject completing a pending reservation', async () => {
      const reservation = createTestReservation({ status: 'pending' });
      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);

      await expect(reservationService.complete(1))
        .rejects.toThrow('cannot transition from pending to completed');
    });
  });

  describe('cancel', () => {
    it('should cancel a pending reservation', async () => {
      const reservation = createTestReservation({ status: 'pending' });
      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);
      mockPrisma.reservation.update.mockResolvedValue({ ...reservation, status: 'cancelled' });

      const result = await reservationService.cancel(1);

      expect(result.status).toBe('cancelled');
    });

    it('should cancel a confirmed reservation', async () => {
      const reservation = createTestReservation({ status: 'confirmed' });
      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);
      mockPrisma.reservation.update.mockResolvedValue({ ...reservation, status: 'cancelled' });

      const result = await reservationService.cancel(1);

      expect(result.status).toBe('cancelled');
    });

    it('should reject cancelling an active reservation', async () => {
      const reservation = createTestReservation({ status: 'active' });
      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);

      await expect(reservationService.cancel(1))
        .rejects.toThrow('cannot transition from active to cancelled');
    });

    it('should reject cancelling a completed reservation', async () => {
      const reservation = createTestReservation({ status: 'completed' });
      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);

      await expect(reservationService.cancel(1))
        .rejects.toThrow('cannot transition from completed to cancelled');
    });
  });
});
