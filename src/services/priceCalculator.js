function calculate({ pricePerDay, category, days }) {
  if (days < 0) throw new Error('days must be positive');

  let price = pricePerDay * days;

  if (category === 'premium') {
    price *= 1.5;
  }

  if (days >= 7) {
    price *= 0.9;
  }

  return price;
}

module.exports = { calculate };
