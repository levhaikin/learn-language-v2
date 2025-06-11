import { Router } from 'express';
import {
  getAllWords,
  getWordsByCategory,
  getWordsByDifficulty,
  getCategories,
  getWord
} from '../controllers/vocabularyController';
import express, { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Wrapper middleware to resolve typing issues
const protectedRoute = (req: Request, res: Response, next: NextFunction) => {
  authenticateToken(req, res, next);
};

// Apply the wrapper middleware to all routes
router.use(protectedRoute);


// Get all vocabulary words
router.get('/', getAllWords);

// Get all categories
router.get('/categories', getCategories);

// Get vocabulary by category
router.get('/category/:category', getWordsByCategory);

// Get vocabulary by difficulty
router.get('/difficulty/:level', getWordsByDifficulty);

// Get specific word
router.get('/word/:word', getWord);

export default router; 