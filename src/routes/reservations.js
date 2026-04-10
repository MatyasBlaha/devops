const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();

module.exports = function (reservationService) {
  router.post('/', asyncHandler(async (req, res) => {
    const reservation = await reservationService.create(req.body);
    res.status(201).json(reservation);
  }));

  router.patch('/:id/confirm', asyncHandler(async (req, res) => {
    const reservation = await reservationService.confirm(Number(req.params.id));
    res.json(reservation);
  }));

  router.patch('/:id/activate', asyncHandler(async (req, res) => {
    const reservation = await reservationService.activate(Number(req.params.id));
    res.json(reservation);
  }));

  router.patch('/:id/complete', asyncHandler(async (req, res) => {
    const reservation = await reservationService.complete(Number(req.params.id));
    res.json(reservation);
  }));

  router.patch('/:id/cancel', asyncHandler(async (req, res) => {
    const reservation = await reservationService.cancel(Number(req.params.id));
    res.json(reservation);
  }));

  router.patch('/:id/return', asyncHandler(async (req, res) => {
    const returnDate = req.body.returnDate ? new Date(req.body.returnDate) : new Date();
    const reservation = await reservationService.returnCar(Number(req.params.id), returnDate);
    res.json(reservation);
  }));

  return router;
};
