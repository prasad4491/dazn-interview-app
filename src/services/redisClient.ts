import Redis from 'ioredis';
import config from 'config';
const redisConfig: {host: string, port: number} = config.get('redis');
const redis = new Redis({
  host: redisConfig.host,
  port: redisConfig.port
});
export default redis;