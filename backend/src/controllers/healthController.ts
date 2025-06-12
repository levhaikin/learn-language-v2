import { Request, Response } from 'express';
import { sql } from '../config/database';

// GET /api/health
// Performs a lightweight DB query to validate the service is operational.
export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Simple query to ensure DB connection is alive
    await sql`SELECT 1`;

    res.status(200).json({
      status: 'ok',
      db: 'up',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      db: 'down',
      timestamp: new Date().toISOString(),
    });
  }
}; 