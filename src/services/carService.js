module.exports = function (prisma) {
  async function getAll() {
    return prisma.car.findMany();
  }

  async function getById(id) {
    return prisma.car.findUnique({ where: { id } });
  }

  async function create(data) {
    if (!data.brand) throw new Error('brand is required');
    if (!data.model) throw new Error('model is required');
    if (data.pricePerDay !== undefined && data.pricePerDay < 0) {
      throw new Error('pricePerDay must be positive');
    }
    if (data.category && !['standard', 'premium'].includes(data.category)) {
      throw new Error('category must be standard or premium');
    }

    return prisma.car.create({ data });
  }

  async function update(id, data) {
    if (data.pricePerDay !== undefined && data.pricePerDay < 0) {
      throw new Error('pricePerDay must be positive');
    }

    return prisma.car.update({ where: { id }, data });
  }

  return { getAll, getById, create, update };
};
