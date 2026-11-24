// Runs the existing Express backend as a Vercel serverless function.
// Every request to /api/* (e.g. /api/weather, /api/geocode, /api/health) lands here.
import app from '../backend/src/app';

// Vercel sits behind a proxy; trust it so rate limiting uses the real visitor IP.
app.set('trust proxy', 1);

export default app;
