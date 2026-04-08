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
});
