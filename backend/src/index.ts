import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

// Load Environment Variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Logging Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local file links if needed
}));
app.use(cors({
  origin: '*', // Allow all in dev, modify for prod as needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());

// Main Root API Routes
app.use('/api', apiRoutes);

// Base Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ResumePilot API' });
});

// Error handling middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 ResumePilot server running in development mode on port ${PORT}`);
});
