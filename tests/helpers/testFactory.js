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

module.exports = { createTestCar };
