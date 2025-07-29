import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { Config } from '../helper/config.helper'; // Adjust path as needed

const redisClient = new Redis({
  host: Config.redisHost,
  port: Config.redisPort,
  password: Config.redisPassword || undefined, 
});


const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: Config.rateLimitMax ?? 10,                    
  duration: (Config.rateLimitWindowMs ?? 60000) / 1000,  
  keyPrefix: 'rlm',
});
/**
 * 
 * @param req 
 * @param res 
 * @param next 
 */
export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {

  rateLimiter.consume(req.ip as string)

    .then(() => {
      next();
    })
    .catch((rejRes) => {
      if (rejRes instanceof Error) {
        console.error('Rate limiter error:', rejRes);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.set('Retry-After', String(Math.ceil(rejRes.msBeforeNext / 1000)));
      res.status(429).json({ message: 'Too Many Requests' });
    });
};
