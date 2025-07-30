import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

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

    // Use Secret type for secrets to satisfy jwt typings
    const accessSecret: Secret = Config.jwtAccessSecret as string;
    const refreshSecret: Secret = Config.jwtRefreshSecret as string;

    // Explicitly type options for jwt.sign
    const accessSignOptions: SignOptions = { expiresIn: Config.accessTokenExpiry as SignOptions['expiresIn'] };
    const refreshSignOptions: SignOptions = { expiresIn: Config.refreshTokenExpiry as SignOptions['expiresIn'] };

    const accessToken = jwt.sign(payload, accessSecret, accessSignOptions);
    const refreshToken = jwt.sign(payload, refreshSecret, refreshSignOptions);

    // Store refresh token in Redis with TTL (7 days)
    await RedisService.set(userId, refreshToken, 7 * 24 * 60 * 60);

    return { accessToken, refreshToken, userId };
  }

  async logout(userId: string, accessToken: string) {
    // Decode access token to get expiry time for blacklist TTL
    const decoded = jwt.decode(accessToken) as { exp?: number } | null;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    let ttl = 15 * 60; // default TTL: 15 minutes
    if (decoded?.exp) {
      ttl = decoded.exp - currentTimestamp;
    }

    if (ttl > 0) {
      // Blacklist access token by storing it with TTL
      await RedisService.set(`bl_${accessToken}`, 'true', ttl);
    }

    // Remove refresh token
    await RedisService.del(userId);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const storedToken = await RedisService.get(userId);
    if (!storedToken || storedToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Verify refresh token signature and expiry
    try {
      jwt.verify(refreshToken, Config.jwtRefreshSecret as string);
    } catch {
      throw new Error('Refresh token expired or invalid');
    }

    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    // Re-issue tokens
    return this.login(user);
  }
}
