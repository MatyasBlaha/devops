const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();

module.exports = function (customerService) {
  router.get('/', asyncHandler(async (req, res) => {
    const customers = await customerService.getAll();
    res.json(customers);
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const customer = await customerService.getById(Number(req.params.id));
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  }));

  router.post('/', asyncHandler(async (req, res) => {
    const customer = await customerService.create(req.body);
    res.status(201).json(customer);
  }));

  router.put('/:id', asyncHandler(async (req, res) => {
    const customer = await customerService.update(Number(req.params.id), req.body);
    res.json(customer);
  }));

  return router;
};
