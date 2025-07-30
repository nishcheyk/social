"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_helper_1 = require("../helper/config.helper");
const redis_service_1 = require("../services/redis.service");
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const isBlacklisted = await redis_service_1.RedisService.get(`bl_${token}`);
    if (isBlacklisted) {
        return res.status(401).json({ message: 'Token has been logged out' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_helper_1.Config.jwtAccessSecret);
        req.user = { id: payload.sub, username: payload.username };
        next();
    }
    catch {
        return res.status(401).json({ message: 'Token expired or invalid' });
    }
}
