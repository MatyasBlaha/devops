import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { createTestCar } from '../helpers/testFactory.js';
import carServiceFactory from '../../src/services/carService.js';

const mockPrisma = {
  car: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const carService = carServiceFactory(mockPrisma);

describe('CarService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all cars', async () => {
      const cars = [createTestCar(), createTestCar({ id: 2, brand: 'BMW' })];
      mockPrisma.car.findMany.mockResolvedValue(cars);

      const result = await carService.getAll();

      expect(result).toHaveLength(2);
      expect(mockPrisma.car.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should return car by id', async () => {
      const car = createTestCar();
      mockPrisma.car.findUnique.mockResolvedValue(car);

      const result = await carService.getById(1);

      expect(result).toEqual(car);
      expect(mockPrisma.car.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null when car does not exist', async () => {
      mockPrisma.car.findUnique.mockResolvedValue(null);

      const result = await carService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a car with valid data', async () => {
      const input = { brand: 'Skoda', model: 'Octavia', year: 2022, pricePerDay: 1000, category: 'standard' };
      const created = createTestCar(input);
      mockPrisma.car.create.mockResolvedValue(created);

      const result = await carService.create(input);

      expect(result.brand).toBe('Skoda');
      expect(mockPrisma.car.create).toHaveBeenCalledTimes(1);
    });

    it('should reject negative pricePerDay', async () => {
      const input = { brand: 'Skoda', model: 'Octavia', year: 2022, pricePerDay: -500, category: 'standard' };

      await expect(carService.create(input)).rejects.toThrow('pricePerDay must be positive');
    });

    it('should reject missing brand', async () => {
      const input = { model: 'Octavia', year: 2022, pricePerDay: 1000, category: 'standard' };

      await expect(carService.create(input)).rejects.toThrow('brand is required');
    });

    it('should reject missing model', async () => {
      const input = { brand: 'Skoda', year: 2022, pricePerDay: 1000, category: 'standard' };

      await expect(carService.create(input)).rejects.toThrow('model is required');
    });

    it('should reject invalid category', async () => {
      const input = { brand: 'Skoda', model: 'Octavia', year: 2022, pricePerDay: 1000, category: 'luxury' };

      await expect(carService.create(input)).rejects.toThrow('category must be standard or premium');
    });
  });

  describe('update', () => {
    it('should update car fields', async () => {
      const updated = createTestCar({ pricePerDay: 1500 });
      mockPrisma.car.update.mockResolvedValue(updated);

      const result = await carService.update(1, { pricePerDay: 1500 });

      expect(result.pricePerDay).toBe(1500);
      expect(mockPrisma.car.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { pricePerDay: 1500 },
      });
    });

    it('should reject negative pricePerDay on update', async () => {
      await expect(carService.update(1, { pricePerDay: -100 })).rejects.toThrow('pricePerDay must be positive');
    });
  });
});
