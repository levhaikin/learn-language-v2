import { Request, Response } from 'express';
import { UserService } from '../services/userService';

const userService = new UserService();

// Cookie configuration
const cookieOptions = {
  httpOnly: true,
  // secure: process.env.NODE_ENV === 'production',
  // sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
} as const;

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

    // Validate username format
    if (username.length < 3) {
      res.status(400).json({ 
        error: 'Username must be at least 3 characters long' 
      });
      return;
    }

    // Validate password strength
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

    // Set cookies
    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    res.cookie('refreshToken', result.refreshToken, cookieOptions);

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

    // Set cookies
    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    res.status(200).json({
      message: 'Successfully signed in',
      userId: result.userId
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token is required' });
      return;
    }

    const result = await userService.refreshToken(refreshToken);
    
    if (!result.success) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Set new access token cookie
    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    // lhaikin: TODO: check if this is according to protocol
    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {

    // Clear cookies
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    // console.log(req.user);

    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    await userService.logout(userId);

    res.status(200).json({ message: 'Successfully logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 