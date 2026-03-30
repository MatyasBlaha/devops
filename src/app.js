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

module.exports = app;
