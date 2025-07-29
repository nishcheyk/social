import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserService } from './user.service';
import { RegisterUserDto, LoginUserDto, RefreshTokenDto } from './user.dto';
import { rateLimiterMiddleware } from '../common/middleware/rate-limiter.middleware'; // Adjust the path accordingly

const router = Router();
const userService = new UserService();

async function validateDto(dto: object): Promise<void> {
  const errors = await validate(dto);
  if (errors.length > 0) {
    throw new Error(errors.map(e => Object.values(e.constraints || {}).join(', ')).join('; '));
  }
}

router.post(
  '/register',
  rateLimiterMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const dto = plainToInstance(RegisterUserDto, req.body);
    await validateDto(dto);
    const user = await userService.register(dto.username, dto.password);
    res.status(201).json({ userId: user._id, username: user.username });
  }),
);

router.post(
  '/login',
  rateLimiterMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const dto = plainToInstance(LoginUserDto, req.body);
    await validateDto(dto);
    const user = await userService.validateUser(dto.username, dto.password);
    const tokens = await userService.login(user);
    res.json(tokens);
  }),
);

router.post(
  '/refresh',
  rateLimiterMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const dto = plainToInstance(RefreshTokenDto, req.body);
    await validateDto(dto);
    const tokens = await userService.refreshTokens(dto.userId, dto.refreshToken);
    res.json(tokens);
  }),
);

router.post(
  '/logout',
  rateLimiterMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, accessToken } = req.body;
    if (!userId || !accessToken) {
      res.status(400).json({ message: 'userId and accessToken required' });
      return;
    }
    await userService.logout(userId, accessToken);
    res.json({ message: 'Logged out successfully' });
  }),
);

export default router;
