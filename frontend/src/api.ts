import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Transform errors into something the UI can use
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      const e = new Error(err.response.data?.message || 'Request failed');
      (e as any).code = err.response.data?.code || 'UNKNOWN_ERROR';
      (e as any).status = err.response.status;
      throw e;
    }
    if (err.request) {
      const e = new Error('Network error — check your connnection');
      (e as any).code = 'NETWORK_ERROR';
      throw e;
    }
    throw err;
  }
);

export async function getWeather(city: string, units: 'metric' | 'imperial' = 'metric') {
  const res = await client.get('/weather', { params: { city, units } });
  return res.data;
}

/** Reverse geocode lat/lon → city name via backend */
export async function getCityFromCoords(lat: number, lon: number): Promise<string> {
  const res = await client.get('/geocode', { params: { lat, lon } });
  return res.data.city as string;
}