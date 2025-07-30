"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const user_service_1 = require("./user.service");
const user_dto_1 = require("./user.dto");
const rate_limiter_middleware_1 = require("../common/middleware/rate-limiter.middleware"); // Adjust the path accordingly
const router = (0, express_1.Router)();
const userService = new user_service_1.UserService();
async function validateDto(dto) {
    const errors = await (0, class_validator_1.validate)(dto);
    if (errors.length > 0) {
        throw new Error(errors.map(e => Object.values(e.constraints || {}).join(', ')).join('; '));
    }
}
//** */
router.post('/register', rate_limiter_middleware_1.rateLimiterMiddleware, (0, express_async_handler_1.default)(async (req, res) => {
    const dto = (0, class_transformer_1.plainToInstance)(user_dto_1.RegisterUserDto, req.body);
    await validateDto(dto);
    const user = await userService.register(dto.username, dto.password);
    res.status(201).json({ userId: user._id, username: user.username });
}));
router.post('/login', rate_limiter_middleware_1.rateLimiterMiddleware, (0, express_async_handler_1.default)(async (req, res) => {
    const dto = (0, class_transformer_1.plainToInstance)(user_dto_1.LoginUserDto, req.body);
    await validateDto(dto);
    const user = await userService.validateUser(dto.username, dto.password);
    const tokens = await userService.login(user);
    res.json(tokens);
}));
router.post('/refresh', rate_limiter_middleware_1.rateLimiterMiddleware, (0, express_async_handler_1.default)(async (req, res) => {
    const dto = (0, class_transformer_1.plainToInstance)(user_dto_1.RefreshTokenDto, req.body);
    await validateDto(dto);
    const tokens = await userService.refreshTokens(dto.userId, dto.refreshToken);
    res.json(tokens);
}));
router.post('/logout', rate_limiter_middleware_1.rateLimiterMiddleware, (0, express_async_handler_1.default)(async (req, res) => {
    const { userId, accessToken } = req.body;
    if (!userId || !accessToken) {
        res.status(400).json({ message: 'userId and accessToken required' });
        return;
    }
    await userService.logout(userId, accessToken);
    res.json({ message: 'Logged out successfully' });
}));
exports.default = router;
