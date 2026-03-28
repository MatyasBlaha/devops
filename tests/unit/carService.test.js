const { createTestCar } = require('../helpers/testFactory');

const mockPrisma = {
  car: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const carService = require('../../src/services/carService')(mockPrisma);

describe('CarService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all cars', async () => {
      // arrange
      const cars = [createTestCar(), createTestCar({ id: 2, brand: 'BMW' })];
      mockPrisma.car.findMany.mockResolvedValue(cars);

      // act
      const result = await carService.getAll();

      // assert
      expect(result).toHaveLength(2);
      expect(mockPrisma.car.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should return car by id', async () => {
      // arrange
      const car = createTestCar();
      mockPrisma.car.findUnique.mockResolvedValue(car);

      // act
      const result = await carService.getById(1);

      // assert
      expect(result).toEqual(car);
      expect(mockPrisma.car.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null when car does not exist', async () => {
      // arrange
      mockPrisma.car.findUnique.mockResolvedValue(null);

      // act
      const result = await carService.getById(999);

      // assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a car with valid data', async () => {
      // arrange
      const input = { brand: 'Skoda', model: 'Octavia', year: 2022, pricePerDay: 1000, category: 'standard' };
      const created = createTestCar(input);
      mockPrisma.car.create.mockResolvedValue(created);

      // act
      const result = await carService.create(input);

      // assert
      expect(result.brand).toBe('Skoda');
      expect(mockPrisma.car.create).toHaveBeenCalledTimes(1);
    });

    it('should reject negative pricePerDay', async () => {
      // arrange
      const input = { brand: 'Skoda', model: 'Octavia', year: 2022, pricePerDay: -500, category: 'standard' };

      // act & assert
      await expect(carService.create(input)).rejects.toThrow('pricePerDay must be positive');
    });

    it('should reject missing brand', async () => {
      // arrange
      const input = { model: 'Octavia', year: 2022, pricePerDay: 1000, category: 'standard' };

      // act & assert
      await expect(carService.create(input)).rejects.toThrow('brand is required');
    });

    it('should reject missing model', async () => {
      // arrange
      const input = { brand: 'Skoda', year: 2022, pricePerDay: 1000, category: 'standard' };

      // act & assert
      await expect(carService.create(input)).rejects.toThrow('model is required');
    });

    it('should reject invalid category', async () => {
      // arrange
      const input = { brand: 'Skoda', model: 'Octavia', year: 2022, pricePerDay: 1000, category: 'luxury' };

      // act & assert
      await expect(carService.create(input)).rejects.toThrow('category must be standard or premium');
    });
  });

  describe('update', () => {
    it('should update car fields', async () => {
      // arrange
      const updated = createTestCar({ pricePerDay: 1500 });
      mockPrisma.car.update.mockResolvedValue(updated);

      // act
      const result = await carService.update(1, { pricePerDay: 1500 });

      // assert
      expect(result.pricePerDay).toBe(1500);
      expect(mockPrisma.car.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { pricePerDay: 1500 },
      });
    });

    it('should reject negative pricePerDay on update', async () => {
      // arrange & act & assert
      await expect(carService.update(1, { pricePerDay: -100 })).rejects.toThrow('pricePerDay must be positive');
    });
  });
});
