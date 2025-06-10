import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes';
import vocabularyRoutes from './routes/vocabulary';
import imageRoutes from './routes/images';
import storageRoutes from './routes/storageRoutes';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers

// Configure CORS with credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // Allow credentials
}));

app.use(morgan('dev')); // Request logging
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/storage', storageRoutes);

// Root path
app.get('/', (req, res) => {
  res.send('English Learning App Backend');
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app; 