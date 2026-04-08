const { validateEmail, validateDateNotInFuture, validateLicenseAge } = require('../utils/validators');

module.exports = function (prisma) {
  async function create(data) {
    if (!data.name) throw new Error('name is required');
    if (!data.email) throw new Error('email is required');
    validateEmail(data.email);
    if (!data.driversLicenseNumber) throw new Error('driversLicenseNumber is required');
    validateDateNotInFuture(data.driversLicenseDate, 'driversLicenseDate');
    validateLicenseAge(data.driversLicenseDate, 1);

    const existing = await prisma.customer.findUnique({ where: { email: data.email } });
    if (existing) throw new Error('email already exists');

    return prisma.customer.create({ data });
  }

  async function getAll() {
    return prisma.customer.findMany();
  }

  async function getById(id) {
    return prisma.customer.findUnique({ where: { id } });
  }

  async function update(id, data) {
    if (data.email) validateEmail(data.email);
    return prisma.customer.update({ where: { id }, data });
  }

  return { create, getAll, getById, update };
};
