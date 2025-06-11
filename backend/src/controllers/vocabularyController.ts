import { Request, Response } from 'express';
import { vocabularyService } from '../services/vocabularyService';

export const getAllWords = async (req: Request, res: Response): Promise<void> => {
  try {
    const words = vocabularyService.getAllWords();
    res.json(words);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vocabulary' });
  }
};

export const getWordsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const words = vocabularyService.getWordsByCategory(category);
    
    if (words.length === 0) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    
    res.json(words);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vocabulary by category' });
  }
};

export const getWordsByDifficulty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { level } = req.params;
    
    if (!['easy', 'medium', 'hard'].includes(level)) {
      res.status(400).json({ error: 'Invalid difficulty level' });
      return;
    }
    
    const words = vocabularyService.getWordsByDifficulty(level as 'easy' | 'medium' | 'hard');
    res.json(words);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vocabulary by difficulty' });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = vocabularyService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getWord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { word } = req.params;
    const wordData = vocabularyService.getWord(word);
    
    if (!wordData) {
      res.status(404).json({ error: 'Word not found' });
      return;
    }
    
    res.json(wordData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch word' });
  }
}; 