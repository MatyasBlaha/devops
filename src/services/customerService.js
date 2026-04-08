module.exports = function (prisma) {
  async function create(data) {
    if (!data.name) throw new Error('name is required');
    if (!data.email) throw new Error('email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('email format is invalid');
    }
    if (!data.driversLicenseNumber) throw new Error('driversLicenseNumber is required');

    const now = new Date();
    const licenseDate = new Date(data.driversLicenseDate);
    if (licenseDate > now) {
      throw new Error('driversLicenseDate cannot be in the future');
    }
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (licenseDate > oneYearAgo) {
      throw new Error('drivers license must be held for at least 1 year');
    }

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
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('email format is invalid');
    }
    return prisma.customer.update({ where: { id }, data });
  }

  return { create, getAll, getById, update };
};
