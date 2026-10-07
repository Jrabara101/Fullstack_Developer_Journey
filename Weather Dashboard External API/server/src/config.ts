import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  redisUrl: process.env.REDIS_URL || '',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  cacheTtlSeconds: 5 * 60, // 5 minutes live weather cache
  extendedCacheTtlSeconds: 30 * 60, // 30 minutes fallback cache
};
