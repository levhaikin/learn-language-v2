import { Router } from 'express';
import { getWordImage } from '../controllers/imageController';

const router = Router();

router.get('/word/:word', getWordImage);

export default router; 