import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || '3001',
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
  OPENWEATHER_BASE_URL: process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org',
  CACHE_TTL_SECONDS: process.env.CACHE_TTL_SECONDS || '600',
};
