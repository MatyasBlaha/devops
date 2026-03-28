const express = require('express');
const router = express.Router();

module.exports = function (carService) {
  router.get('/', async (req, res) => {
    const cars = await carService.getAll();
    res.json(cars);
  });

  router.get('/:id', async (req, res) => {
    const car = await carService.getById(Number(req.params.id));
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  });

  router.post('/', async (req, res) => {
    try {
      const car = await carService.create(req.body);
      res.status(201).json(car);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const car = await carService.update(Number(req.params.id), req.body);
      res.json(car);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
};
