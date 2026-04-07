module.exports = function (prisma) {
  async function create(data) {
    return prisma.customer.create({ data });
  }

  return { create };
};
