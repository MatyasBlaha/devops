module.exports = function (prisma) {
  async function create(data) {
    return prisma.reservation.create({ data });
  }

  return { create };
};
