import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sign } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserModel, IUser } from './user.schema';
import { RedisService } from '../common/services/redis.service';
import { Config } from '../common/helper/config.helper';

export class UserService {
  async register(username: string, password: string): Promise<IUser> {
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) throw new Error('Username already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ username, passwordHash });
    return newUser.save();
  }

  async validateUser(username: string, password: string): Promise<IUser> {
    const user = await UserModel.findOne({ username });
    if (!user) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    return user;
  }

  async login(user: IUser) {
   
    const userId = (user._id as Types.ObjectId).toString();
    const payload = { sub: userId, username: user.username };

    const accessToken = sign(payload, Config.jwtAccessSecret as string, {
      expiresIn: Config.accessTokenExpiry,
    });

    const refreshToken = sign(payload, Config.jwtRefreshSecret as string, {
      expiresIn: Config.refreshTokenExpiry,
    });

   
    await RedisService.set(userId, refreshToken, 7 * 24 * 60 * 60);
    return { accessToken, refreshToken, userId };
  }

  async logout(userId: string, accessToken: string) {
    const decoded = jwt.decode(accessToken) as { exp?: number } | null;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    let ttl = 15 * 60; 
    if (decoded?.exp) {
      ttl = decoded.exp - currentTimestamp;
    }

    if (ttl > 0) {
      await RedisService.set(`bl_${accessToken}`, 'true', ttl);
    }

    await RedisService.del(userId);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const storedToken = await RedisService.get(userId);
    if (!storedToken || storedToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    try {
      jwt.verify(refreshToken, Config.jwtRefreshSecret as string);
    } catch {
      throw new Error('Refresh token expired or invalid');
    }

    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    return this.login(user);
  }
}
