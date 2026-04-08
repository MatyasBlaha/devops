function calculate({ pricePerDay, category, days }) {
  return pricePerDay * days;
}

module.exports = { calculate };
