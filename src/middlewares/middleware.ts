import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './auth'; 


interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Authorization header is required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Token is required' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; 
    next(); 
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
    return;
  }
};
