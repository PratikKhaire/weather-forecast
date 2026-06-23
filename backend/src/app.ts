import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { getWeather } from './weatherService';
import { config } from './config';

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.PORT === '3001' ? '*' : process.env.FRONTEND_URL }));

// Rate limiting — 100 requests per minute per IP
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { code: 'RATE_LIMITED', message: 'Too many requests', status: 429 },
  })
);

app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Weather endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const schema = z.object({
      city: z.string().min(2, 'City name must be at least 2 characters').max(100),
      units: z.enum(['metric', 'imperial']).optional().default('metric'),
    });

    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        code: 'INVALID_INPUT',
        message: parsed.error.errors[0].message,
        status: 400,
      });
    }

    const weather = await getWeather(parsed.data.city, parsed.data.units);
    res.json(weather);
  } catch (err: any) {
    if (err.code === 'CITY_NOT_FOUND') {
      return res.status(404).json({
        code: 'CITY_NOT_FOUND',
        message: `City "${req.query.city}" not found`,
        status: 404,
      });
    }

    if (err.response?.status === 429) {
      return res.status(429).json({
        code: 'RATE_LIMITED',
        message: 'Weather API rate limit exceeded. Try again in a minute.',
        status: 429,
      });
    }

    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({
        code: 'TIMEOUT',
        message: 'Weather service timed out. Please retry.',
        status: 504,
      });
    }

    console.error('Weather error:', err.message);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch weather data',
      status: 500,
    });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Route not found', status: 404 });
});

// Global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Something went wrong', status: 500 });
});

export default app;