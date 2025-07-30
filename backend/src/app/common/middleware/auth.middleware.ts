import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Config } from '../helper/config.helper';
import { RedisService } from '../services/redis.service';

export interface AuthRequest extends Request {
  user?: { id: string; username: string };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  const isBlacklisted = await RedisService.get(`bl_${token}`);
  if (isBlacklisted) {
    return res.status(401).json({ message: 'Token has been logged out' });
  }
  try {
    const payload = jwt.verify(token, Config.jwtAccessSecret) as JwtPayload;
    req.user = { id: payload.sub!, username: payload.username! };
    next();
  } catch {
    return res.status(401).json({ message: 'Token expired or invalid' });
  }
}
