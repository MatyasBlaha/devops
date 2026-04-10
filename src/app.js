const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const carService = require('./services/carService')(prisma);
const carRoutes = require('./routes/cars')(carService);
app.use('/api/cars', carRoutes);

const customerService = require('./services/customerService')(prisma);
const customerRoutes = require('./routes/customers')(customerService);
app.use('/api/customers', customerRoutes);

const reservationService = require('./services/reservationService')(prisma);
const reservationRoutes = require('./routes/reservations')(reservationService);
app.use('/api/reservations', reservationRoutes);

app.use((err, req, res, _next) => {
  res.status(400).json({ error: err.message });
});

module.exports = app;
