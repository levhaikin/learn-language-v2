import { sql } from '../config/database';
import bcrypt from 'bcrypt';

interface SignupData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export class UserService {
  async signup(userData: SignupData): Promise<{ success: boolean; userId?: number }> {
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

      return { success: true, userId: result[0].id };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('User creation failed');
    }
  }

  async verifyUser(username: string, password: string): Promise<{ success: boolean; userId?: number }> {
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

      return { success: true, userId: user.id };
    } catch (error) {
      console.error('Error verifying user:', error);
      throw new Error('Authentication failed');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
} 