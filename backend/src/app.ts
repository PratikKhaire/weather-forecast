import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import { z } from 'zod';
import { getWeather } from './weatherServices';
import { config } from './config';


const app = express();

// Security
app.use(helmet());

// Build the allowed origins list:

const localhostOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
const productionOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((u) => u.trim())
  : [];
const allowedOrigins = [...new Set([...localhostOrigins, ...productionOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET'],
  optionsSuccessStatus: 200,
}));


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

// Reverse geocode endpoint — lat/lon → city name (used by "Use my location")
app.get('/api/geocode', async (req, res) => {
  try {
    const schema = z.object({
      lat: z.coerce.number().min(-90).max(90),
      lon: z.coerce.number().min(-180).max(180),
    });
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid lat/lon', status: 400 });
    }

    const { lat, lon } = parsed.data;
    const geoRes = await axios.get(
      `${config.OPENWEATHER_BASE_URL}/geo/1.0/reverse`,
      { params: { lat, lon, limit: 1, appid: config.OPENWEATHER_API_KEY }, timeout: 5000 }
    );

    if (!geoRes.data?.length) {
      return res.status(404).json({ code: 'LOCATION_NOT_FOUND', message: 'Could not determine city', status: 404 });
    }

    const place = geoRes.data[0];
    res.json({ city: place.name, country: place.country, lat, lon });
  } catch (err: any) {
    console.error('Geocode error:', err.message);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Geocode failed', status: 500 });
  }
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
        message: parsed.error.issues[0]?.message || 'Invalid input',
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