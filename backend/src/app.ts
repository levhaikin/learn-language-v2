import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';

// Import routes
import vocabularyRoutes from './routes/vocabulary';
import attemptsRoutes from './routes/attempts';
import statisticsRoutes from './routes/statistics';
import imageRoutes from './routes/images';

// Load environment variables
config();

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Request logging
app.use(express.json()); // Parse JSON bodies

// API Routes
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/attempts', attemptsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/images', imageRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app; 