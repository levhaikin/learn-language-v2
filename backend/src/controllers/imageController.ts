import { Request, Response } from 'express';
import { imageService } from '../services/imageService';

export const getWordImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { word } = req.params;
    
    if (!word) {
      res.status(400).json({ error: 'Word parameter is required' });
      return;
    }

    const image = await imageService.getWordImage(word);
    res.json(image);
  } catch (error) {
    console.error('Error in getWordImage controller:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}; 