const { ValidationError } = require('../utils/errors');

module.exports = function (prisma) {
  async function getAll() {
    return prisma.car.findMany();
  }

  async function getById(id) {
    return prisma.car.findUnique({ where: { id } });
  }

  async function create(data) {
    if (!data.brand) throw new ValidationError('brand is required');
    if (!data.model) throw new ValidationError('model is required');
    if (data.pricePerDay !== undefined && data.pricePerDay < 0) {
      throw new ValidationError('pricePerDay must be positive');
    }
    if (data.category && !['standard', 'premium'].includes(data.category)) {
      throw new ValidationError('category must be standard or premium');
    }
    const currentYear = new Date().getFullYear();
    if (data.year !== undefined && data.year > currentYear) {
      throw new ValidationError('year cannot be in the future');
    }

    return prisma.car.create({ data });
  }

  async function update(id, data) {
    if (data.pricePerDay !== undefined && data.pricePerDay < 0) {
      throw new ValidationError('pricePerDay must be positive');
    }

    return prisma.car.update({ where: { id }, data });
  }

  return { getAll, getById, create, update };
};
