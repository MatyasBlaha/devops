const express = require('express');
const router = express.Router();

module.exports = function (customerService) {
  router.get('/', async (req, res) => {
    const customers = await customerService.getAll();
    res.json(customers);
  });

  router.get('/:id', async (req, res) => {
    const customer = await customerService.getById(Number(req.params.id));
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  });

  router.post('/', async (req, res) => {
    try {
      const customer = await customerService.create(req.body);
      res.status(201).json(customer);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const customer = await customerService.update(Number(req.params.id), req.body);
      res.json(customer);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
};
