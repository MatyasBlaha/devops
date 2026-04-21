const priceCalculator = require('./priceCalculator');
const { validateTransition } = require('./stateMachine');
const { NotFoundError, ConflictError, InvalidStateError } = require('../utils/errors');

module.exports = function (prisma) {
  async function create(data) {
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      throw new Error('endDate must be after startDate');
    }

    const car = await prisma.car.findUnique({ where: { id: data.carId } });
    if (!car) throw new NotFoundError('car not found');
    if (car.status !== 'available') throw new ConflictError('car is not available');

    const existing = await prisma.reservation.findMany({
      where: { carId: data.carId, status: { in: ['pending', 'confirmed', 'active'] } },
    });

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const hasCollision = existing.some(r => {
      return new Date(r.startDate) < end && new Date(r.endDate) > start;
    });
    if (hasCollision) throw new ConflictError('car is already reserved for these dates');

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

  async function transition(id, toStatus) {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundError('reservation not found');

    validateTransition(reservation.status, toStatus);

    return prisma.reservation.update({
      where: { id },
      data: { status: toStatus },
    });
  }

  async function confirm(id) {
    return transition(id, 'confirmed');
  }

  async function activate(id) {
    return transition(id, 'active');
  }

  async function complete(id) {
    return transition(id, 'completed');
  }

  async function cancel(id) {
    return transition(id, 'cancelled');
  }

  async function returnCar(id, returnDate) {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundError('reservation not found');
    if (reservation.status !== 'active') throw new InvalidStateError('can only return active reservations');

    let totalPrice = reservation.totalPrice;

    const endDate = new Date(reservation.endDate);
    if (returnDate > endDate) {
      const car = await prisma.car.findUnique({ where: { id: reservation.carId } });
      const lateDays = Math.ceil((returnDate - endDate) / (1000 * 60 * 60 * 24));
      totalPrice += lateDays * car.pricePerDay * 1.5;
    }

    return prisma.reservation.update({
      where: { id },
      data: {
        status: 'completed',
        returnedAt: returnDate,
        totalPrice,
      },
    });
  }

  return { create, confirm, activate, complete, cancel, returnCar };
};
