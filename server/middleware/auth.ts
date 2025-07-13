import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { Request, Response, NextFunction } from 'express';
import { getCollection } from '../services/mongodb';
import type { User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function protectRoute(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    const usersCollection = getCollection<User>('users');
    const user = await usersCollection.findOne({ _id: decoded.userId });
    
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
}

export async function adminOnly(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  
  next();
}
