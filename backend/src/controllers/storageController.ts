import { Request, Response } from 'express';
import { StorageService } from '../services/storageService';
import { WordAttempt } from '../types/WordAttempt';
import { UserScores } from '../types/UserScores';

const storageService = new StorageService();

export const saveAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const attempt = req.body as WordAttempt;
    await storageService.saveAttempt(userId, attempt);
    res.status(201).json({ message: 'Attempt saved successfully' });
  } catch (error) {
    console.error('Save attempt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAttempts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const attempts = await storageService.getAllAttempts(userId);
    res.status(200).json(attempts);
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const saveScores = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const scores = req.body as UserScores;
    await storageService.saveUserScores(userId, scores);
    res.status(200).json({ message: 'Scores saved successfully' });
  } catch (error) {
    console.error('Save scores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getScores = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const scores = await storageService.getUserScores(userId);
    if (scores) {
      res.status(200).json(scores);
    } else {
      res.status(404).json({ error: 'Scores not found for this user' });
    }
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 