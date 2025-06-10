import express, { Request, Response, NextFunction } from 'express';
import {
  saveAttempt,
  getAttempts,
  saveScores,
  getScores,
} from '../controllers/storageController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Wrapper middleware to resolve typing issues
const protectedRoute = (req: Request, res: Response, next: NextFunction) => {
  authenticateToken(req, res, next);
};

// Apply the wrapper middleware to all routes
router.use(protectedRoute);

// Define the routes
router.post('/attempts', saveAttempt);
router.get('/attempts', getAttempts);
router.post('/scores', saveScores);
router.get('/scores', getScores);

export default router; 