import { Router } from 'express';
import {
  getAllWords,
  getWordsByCategory,
  getWordsByDifficulty,
  getCategories,
  getWord
} from '../controllers/vocabularyController';

const router = Router();

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