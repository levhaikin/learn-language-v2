import { Request, Response } from 'express';
import { UserService } from '../services/userService';

const userService = new UserService();

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, firstName, lastName, email } = req.body;

    // Validate required fields
    if (!username || !password || !firstName || !lastName) {
      res.status(400).json({ 
        error: 'Username, password, firstName, and lastName are required' 
      });
      return;
    }

    // Validate username format (optional)
    if (username.length < 3) {
      res.status(400).json({ 
        error: 'Username must be at least 3 characters long' 
      });
      return;
    }

    // Validate password strength (optional)
    if (password.length < 6) {
      res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
      return;
    }

    const result = await userService.signup({
      username,
      password,
      firstName,
      lastName,
      email
    });

    if (!result.success) {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    res.status(201).json({
      message: 'User created successfully',
      userId: result.userId
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const result = await userService.verifyUser(username, password);

    if (!result.success) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    // You might want to generate a JWT token here for authentication
    res.status(200).json({
      message: 'Successfully signed in',
      userId: result.userId
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 