import { createClient, RedisClientType } from 'redis';
import { Config } from '../helper/config.helper';

export class RedisService {
  private static instance: RedisClientType;

  public static getInstance(): RedisClientType {
    if (!RedisService.instance) {
      RedisService.instance = createClient({
        socket: {
          host: Config.redisHost,
          port: Config.redisPort,
        },
      });
      RedisService.instance.connect().catch(console.error);
    }
    return RedisService.instance;
  }

  public static async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await RedisService.getInstance().set(key, value, { EX: ttlSeconds });
    } else {
      await RedisService.getInstance().set(key, value);
    }
  }

  public static async get(key: string): Promise<string | null> {
    return RedisService.getInstance().get(key);
  }

  public static async del(key: string): Promise<number> {
    return RedisService.getInstance().del(key);
  }

  public static async call(command: string, ...args: (string | number | Buffer)[]): Promise<any> {
    return RedisService.getInstance().sendCommand([command, ...args.map(String)]);
  }
}
