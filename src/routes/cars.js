const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/errors');
const router = express.Router();

module.exports = function (carService) {
  router.get('/', asyncHandler(async (req, res) => {
    const cars = await carService.getAll();
    res.json(cars);
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const car = await carService.getById(Number(req.params.id));
    if (!car) throw new NotFoundError('car not found');
    res.json(car);
  }));

  router.post('/', asyncHandler(async (req, res) => {
    const car = await carService.create(req.body);
    res.status(201).json(car);
  }));

  router.put('/:id', asyncHandler(async (req, res) => {
    const car = await carService.update(Number(req.params.id), req.body);
    res.json(car);
  }));

  return router;
};
