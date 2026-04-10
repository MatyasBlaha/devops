const express = require('express');
const router = express.Router();

module.exports = function (reservationService) {
  router.post('/', async (req, res) => {
    try {
      const reservation = await reservationService.create(req.body);
      res.status(201).json(reservation);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.patch('/:id/confirm', async (req, res) => {
    try {
      const reservation = await reservationService.confirm(Number(req.params.id));
      res.json(reservation);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.patch('/:id/activate', async (req, res) => {
    try {
      const reservation = await reservationService.activate(Number(req.params.id));
      res.json(reservation);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.patch('/:id/complete', async (req, res) => {
    try {
      const reservation = await reservationService.complete(Number(req.params.id));
      res.json(reservation);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.patch('/:id/cancel', async (req, res) => {
    try {
      const reservation = await reservationService.cancel(Number(req.params.id));
      res.json(reservation);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.patch('/:id/return', async (req, res) => {
    try {
      const returnDate = req.body.returnDate ? new Date(req.body.returnDate) : new Date();
      const reservation = await reservationService.returnCar(Number(req.params.id), returnDate);
      res.json(reservation);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
};
