import { Router } from 'express';
import { getWordImage } from '../controllers/imageController';
import { authenticateToken } from '../middleware/authMiddleware';


const router = Router();

// router.get('/word/:word', authenticateToken, getWordImage);
router.get('/word/:word', getWordImage);

export default router; 