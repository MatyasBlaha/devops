function createTestCar(overrides = {}) {
  return {
    id: 1,
    brand: 'Skoda',
    model: 'Octavia',
    year: 2022,
    pricePerDay: 1000,
    status: 'available',
    category: 'standard',
    createdAt: new Date('2025-01-01'),
    ...overrides,
  };
}

function createTestCustomer(overrides = {}) {
  return {
    id: 1,
    name: 'Jan asdas',
    email: 'jan@asdfsa.com',
    phone: '+420123456789',
    driversLicenseNumber: 'DD61234',
    driversLicenseDate: new Date('2020-01-15'),
    createdAt: new Date('2025-01-01'),
    ...overrides,
  };
}

module.exports = { createTestCar, createTestCustomer };
