const priceCalculator = require('../../src/services/priceCalculator');

describe('PriceCalculator', () => {
  describe('calculate', () => {
    it('should calculate basic price for standard car', () => {
      const result = priceCalculator.calculate({
        pricePerDay: 1000,
        category: 'standard',
        days: 3,
      });

      expect(result).toBe(3000);
    });

    it('should apply 1.5x multiplier for premium category', () => {
      const result = priceCalculator.calculate({
        pricePerDay: 1000,
        category: 'premium',
        days: 3,
      });

      expect(result).toBe(4500);
    });

    it('should apply 10% discount for 7+ days', () => {
      const result = priceCalculator.calculate({
        pricePerDay: 1000,
        category: 'standard',
        days: 7,
      });

      expect(result).toBe(6300);
    });

    it('should apply both premium and long-term discount', () => {
      const result = priceCalculator.calculate({
        pricePerDay: 1000,
        category: 'premium',
        days: 10,
      });

      expect(result).toBe(13500);
    });

    it('should return 0 for 0 days', () => {
      const result = priceCalculator.calculate({
        pricePerDay: 1000,
        category: 'standard',
        days: 0,
      });

      expect(result).toBe(0);
    });

    it('should reject negative days', () => {
      expect(() => priceCalculator.calculate({
        pricePerDay: 1000,
        category: 'standard',
        days: -1,
      })).toThrow('days must be positive');
    });
  });
});
