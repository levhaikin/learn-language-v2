import { Router } from 'express';
import { signin, signup, refreshToken, logout } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticateToken, logout);

export default router; 