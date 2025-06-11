import { Request, Response } from 'express';
import { StorageService } from '../services/storageService';
import { WordAttempt } from '../types/WordAttempt';
import { UserState } from '../types/UserState';

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

export const saveState = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const state = req.body as UserState;
    await storageService.saveUserState(userId, state);
    res.status(200).json({ message: 'User state saved successfully' });
  } catch (error) {
    console.error('Save state error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getState = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const state = await storageService.getUserState(userId);
    if (state) {
      res.status(200).json(state);
    } else {
      res.status(404).json({ error: 'User state not found for this user' });
    }
  } catch (error) {
    console.error('Get state error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 