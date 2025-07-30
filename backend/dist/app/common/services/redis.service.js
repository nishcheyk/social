"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const redis_1 = require("redis");
const config_helper_1 = require("../helper/config.helper");
class RedisService {
    static getInstance() {
        if (!RedisService.instance) {
            RedisService.instance = (0, redis_1.createClient)({
                socket: {
                    host: config_helper_1.Config.redisHost,
                    port: config_helper_1.Config.redisPort,
                },
            });
            RedisService.instance.connect().catch(console.error);
        }
        return RedisService.instance;
    }
    static async set(key, value, ttlSeconds) {
        if (ttlSeconds) {
            await RedisService.getInstance().set(key, value, { EX: ttlSeconds });
        }
        else {
            await RedisService.getInstance().set(key, value);
        }
    }
    static async get(key) {
        return RedisService.getInstance().get(key);
    }
    static async del(key) {
        return RedisService.getInstance().del(key);
    }
    static async call(command, ...args) {
        return RedisService.getInstance().sendCommand([command, ...args.map(String)]);
    }
}
exports.RedisService = RedisService;
