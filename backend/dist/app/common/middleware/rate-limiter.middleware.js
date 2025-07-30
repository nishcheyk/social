"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiterMiddleware = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const ioredis_1 = __importDefault(require("ioredis"));
const config_helper_1 = require("../helper/config.helper"); // Adjust path as needed
const redisClient = new ioredis_1.default({
    host: config_helper_1.Config.redisHost,
    port: config_helper_1.Config.redisPort,
    password: config_helper_1.Config.redisPassword || undefined,
});
const rateLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
    storeClient: redisClient,
    points: config_helper_1.Config.rateLimitMax ?? 10,
    duration: (config_helper_1.Config.rateLimitWindowMs ?? 60000) / 1000,
    keyPrefix: 'rlm',
});
/**
 *
 * @param req
 * @param res
 * @param next
 */
const rateLimiterMiddleware = (req, res, next) => {
    rateLimiter.consume(req.ip)
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
exports.rateLimiterMiddleware = rateLimiterMiddleware;
