import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwtService';

const jwtService = new JWTService();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.accessToken;
  
  if (!token) {
    res.status(401).json({ error: 'Access token is required' });
    return;
  }

  const payload = jwtService.verifyAccessToken(token);
  if (!payload) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = payload;
  next();
};

// Optional authentication - doesn't require token but will process it if present
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.accessToken;

  if (token) {
    const payload = jwtService.verifyAccessToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}; 