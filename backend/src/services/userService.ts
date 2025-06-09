import { sql } from '../config/database';
import bcrypt from 'bcrypt';
import { JWTService } from './jwtService';

interface SignupData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface AuthResponse {
  success: boolean;
  userId?: number;
  username?: string;
  accessToken?: string;
  refreshToken?: string;
}

export class UserService {
  private jwtService: JWTService;

  constructor() {
    this.jwtService = new JWTService();
  }

  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      // Check if username already exists
      const existingUser = await sql`
        SELECT id FROM users 
        WHERE username = ${userData.username}
      `;

      if (existingUser.length > 0) {
        return { success: false };
      }

      // Hash the password
      const hashedPassword = await this.hashPassword(userData.password);

      // Insert new user
      const result = await sql`
        INSERT INTO users (username, password, firstname, lastname, email)
        VALUES (
          ${userData.username}, 
          ${hashedPassword}, 
          ${userData.firstName}, 
          ${userData.lastName}, 
          ${userData.email || null}
        )
        RETURNING id
      `;

      const userId = result[0].id;
      const tokens = this.jwtService.generateTokens({
        userId,
        username: userData.username
      });

      // Store refresh token in database
      await this.storeRefreshToken(userId, tokens.refreshToken);

      return {
        success: true,
        userId,
        username: userData.username,
        ...tokens
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('User creation failed');
    }
  }

  async verifyUser(username: string, password: string): Promise<AuthResponse> {
    try {
      const result = await sql`
        SELECT id, password 
        FROM users 
        WHERE username = ${username}
      `;

      if (result.length === 0) {
        return { success: false };
      }

      const user = result[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return { success: false };
      }

      const tokens = this.jwtService.generateTokens({
        userId: user.id,
        username
      });

      // Store refresh token in database
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        success: true,
        userId: user.id,
        username,
        ...tokens
      };
    } catch (error) {
      console.error('Error verifying user:', error);
      throw new Error('Authentication failed');
    }
  }

  private async storeRefreshToken(userId: number, refreshToken: string): Promise<void> {
    await sql`
      INSERT INTO refresh_tokens (user_id, token)
      VALUES (${userId}, ${refreshToken})
      ON CONFLICT (user_id) DO UPDATE
      SET token = ${refreshToken},
          created_at = CURRENT_TIMESTAMP
    `;
  }

  async refreshToken(oldRefreshToken: string): Promise<AuthResponse> {
    const payload = this.jwtService.verifyRefreshToken(oldRefreshToken);
    if (!payload) {
      return { success: false };
    }

    // Verify token exists in database
    const tokenResult = await sql`
      SELECT user_id 
      FROM refresh_tokens 
      WHERE token = ${oldRefreshToken}
    `;

    if (tokenResult.length === 0) {
      return { success: false };
    }

    const tokens = this.jwtService.generateTokens({
      userId: payload.userId,
      username: payload.username
    });

    // Update refresh token in database
    await this.storeRefreshToken(payload.userId, tokens.refreshToken);

    return {
      success: true,
      userId: payload.userId,
      username: payload.username,
      ...tokens
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async logout(userId: number): Promise<void> {
    await sql`
      DELETE FROM refresh_tokens
      WHERE user_id = ${userId}
    `;
  }
} 