const priceCalculator = require('./priceCalculator');

module.exports = function (prisma) {
  async function create(data) {
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      throw new Error('endDate must be after startDate');
    }

    const car = await prisma.car.findUnique({ where: { id: data.carId } });
    if (!car) throw new Error('car not found');
    if (car.status !== 'available') throw new Error('car is not available');

    const existing = await prisma.reservation.findMany({
      where: { carId: data.carId, status: { in: ['pending', 'confirmed', 'active'] } },
    });

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const hasCollision = existing.some(r => {
      return new Date(r.startDate) < end && new Date(r.endDate) > start;
    });
    if (hasCollision) throw new Error('car is already reserved for these dates');

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = priceCalculator.calculate({
      pricePerDay: car.pricePerDay,
      category: car.category,
      days,
    });

    return prisma.reservation.create({
      data: {
        carId: data.carId,
        customerId: data.customerId,
        startDate: data.startDate,
        endDate: data.endDate,
        totalPrice,
      },
    });
  }

  return { create };
};
