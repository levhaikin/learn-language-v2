import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

interface TokenPayload {
  userId: number;
  username: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class JWTService {
  // Generate access token (short-lived)
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '15m', // 15 minutes
    });
  }

  // Generate refresh token (long-lived)
  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: '7d', // 7 days
    });
  }

  // Generate both access and refresh tokens
  generateTokens(payload: TokenPayload): TokenResponse {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  // Verify access token
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }
} 