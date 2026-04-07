const { createTestCustomer } = require('../helpers/testFactory');

const mockPrisma = {
  customer: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const customerService = require('../../src/services/customerService')(mockPrisma);

describe('CustomerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a customer with valid data', async () => {
      const input = {
        name: 'Petr Fdsa',
        email: 'petr@fdsa.com',
        phone: '+420111222333',
        driversLicenseNumber: 'XY98765',
        driversLicenseDate: new Date('2020-01-15'),
      };
      const created = createTestCustomer(input);
      mockPrisma.customer.create.mockResolvedValue(created);

      const result = await customerService.create(input);

      expect(result.name).toBe('Petr Fdsa');
      expect(result.email).toBe('petr@fdsa.com');
      expect(mockPrisma.customer.create).toHaveBeenCalledTimes(1);
    });

    it('should reject missing name', async () => {
      const input = {
        email: 'petr@fdsa.com',
        driversLicenseNumber: 'XY98765',
        driversLicenseDate: new Date('2020-01-15'),
      };

      await expect(customerService.create(input)).rejects.toThrow('name is required');
    });

    it('should reject missing email', async () => {
      const input = {
        name: 'Petr Fdsa',
        driversLicenseNumber: 'XY98765',
        driversLicenseDate: new Date('2020-01-15'),
      };

      await expect(customerService.create(input)).rejects.toThrow('email is required');
    });

    it('should reject invalid email format', async () => {
      const input = {
        name: 'Petr Fdsa',
        email: 'blbost',
        driversLicenseNumber: 'XY98765',
        driversLicenseDate: new Date('2020-01-15'),
      };

      await expect(customerService.create(input)).rejects.toThrow('email format is invalid');
    });

    it('should reject missing drivers license number', async () => {
      const input = {
        name: 'Petr Fdsa',
        email: 'petr@fdsa.com',
        driversLicenseDate: new Date('2020-01-15'),
      };

      await expect(customerService.create(input)).rejects.toThrow('driversLicenseNumber is required');
    });

    it('should reject drivers license date in the future', async () => {
      const input = {
        name: 'Petr Fdsa',
        email: 'petr@fdsa.com',
        driversLicenseNumber: 'XY98765',
        driversLicenseDate: new Date('2030-01-15'),
      };

      await expect(customerService.create(input)).rejects.toThrow('driversLicenseDate cannot be in the future');
    });

    it('should reject drivers license issued less than 1 year ago', async () => {
      const recentDate = new Date();
      recentDate.setMonth(recentDate.getMonth() - 6);
      const input = {
        name: 'Petr Fdsa',
        email: 'petr@fdsa.com',
        driversLicenseNumber: 'XY98765',
        driversLicenseDate: recentDate,
      };

      await expect(customerService.create(input)).rejects.toThrow('drivers license must be held for at least 1 year');
    });

    it('should reject duplicate email', async () => {
      const input = {
        name: 'Petr Fdsa',
        email: 'petr@fdsa.com',
        driversLicenseNumber: 'XY98765',
        driversLicenseDate: new Date('2020-01-15'),
      };
      mockPrisma.customer.findUnique.mockResolvedValue(createTestCustomer());

      await expect(customerService.create(input)).rejects.toThrow('email already exists');
    });
  });

  describe('getAll', () => {
    it('should return all customers', async () => {
      const customers = [createTestCustomer(), createTestCustomer({ id: 2, name: 'Eva Qwer' })];
      mockPrisma.customer.findMany.mockResolvedValue(customers);

      const result = await customerService.getAll();

      expect(result).toHaveLength(2);
      expect(mockPrisma.customer.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should return customer by id', async () => {
      const customer = createTestCustomer();
      mockPrisma.customer.findUnique.mockResolvedValue(customer);

      const result = await customerService.getById(1);

      expect(result).toEqual(customer);
      expect(mockPrisma.customer.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null when customer does not exist', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      const result = await customerService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update customer fields', async () => {
      const updated = createTestCustomer({ name: 'Zmeneno Jmeno' });
      mockPrisma.customer.update.mockResolvedValue(updated);

      const result = await customerService.update(1, { name: 'Zmeneno Jmeno' });

      expect(result.name).toBe('Zmeneno Jmeno');
      expect(mockPrisma.customer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Zmeneno Jmeno' },
      });
    });

    it('should reject invalid email format on update', async () => {
      await expect(customerService.update(1, { email: 'spatny' })).rejects.toThrow('email format is invalid');
    });
  });
});
