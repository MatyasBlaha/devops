import express from 'express';
import { PrismaClient } from './generated/prisma/client.ts';
import carServiceFactory from './services/carService.js';
import carRoutesFactory from './routes/cars.js';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const carService = carServiceFactory(prisma);
const carRoutes = carRoutesFactory(carService);
app.use('/api/cars', carRoutes);

export default app;
