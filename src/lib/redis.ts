import RedisClient from "ioredis";

const Redis = new RedisClient(process.env.REDIS_URL as string);

export default Redis;
