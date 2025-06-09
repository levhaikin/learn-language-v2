import { Router } from 'express';
import { Word } from '../types/vocabulary';

const router = Router();

// Get all vocabulary words
router.get('/', async (req, res) => {
  try {
    // TODO: Implement data fetching
    res.json({ message: 'Get all vocabulary' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vocabulary' });
  }
});

// Get vocabulary by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    // TODO: Implement category filtering
    res.json({ message: `Get vocabulary for category: ${category}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vocabulary by category' });
  }
});

// Get vocabulary by difficulty
router.get('/difficulty/:level', async (req, res) => {
  try {
    const { level } = req.params;
    // TODO: Implement difficulty filtering
    res.json({ message: `Get vocabulary for difficulty: ${level}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vocabulary by difficulty' });
  }
});

export default router; 