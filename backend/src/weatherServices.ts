import axios from 'axios';
import { config } from './config';
import { LRUCache } from './cache';
import type { WeatherResponse, Location, CurrentWeather, DailyForecast } from './types';

const cache = new LRUCache<WeatherResponse>(parseInt(config.CACHE_TTL_SECONDS));

export async function getWeather(
  city: string,
  units: 'metric' | 'imperial' = 'metric'
): Promise<WeatherResponse> {
  const cacheKey = `weather:${city.toLowerCase().trim()}:${units}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Step 1: Geocode city to lat/lon
  const geoRes = await axios.get(
    `${config.OPENWEATHER_BASE_URL}/geo/1.0/direct`,
    {
      params: { q: city, limit: 1, appid: config.OPENWEATHER_API_KEY },
      timeout: 5000,
    }
  );

  if (!geoRes.data?.length) {
    throw Object.assign(new Error('City not found'), { code: 'CITY_NOT_FOUND', status: 404 });
  }

  const geo = geoRes.data[0];
  const location: Location = {
    city: geo.name,
    country: geo.country,
    lat: geo.lat,
    lon: geo.lon,
  };

  // Step 2: Get current weather 
  const currentRes = await axios.get(
    `${config.OPENWEATHER_BASE_URL}/data/2.5/weather`,
    {
      params: {
        lat: location.lat,
        lon: location.lon,
        units,
        appid: config.OPENWEATHER_API_KEY,
      },
      timeout: 5000,
    }
  );

  // Step 3: Get 5-day / 3-hour forecast
  const forecastRes = await axios.get(
    `${config.OPENWEATHER_BASE_URL}/data/2.5/forecast`,
    {
      params: {
        lat: location.lat,
        lon: location.lon,
        units,
        appid: config.OPENWEATHER_API_KEY,
      },
      timeout: 5000,
    }
  );

  const cw = currentRes.data;

  const current: CurrentWeather = {
    temp: cw.main.temp,
    feelsLike: cw.main.feels_like,
    humidity: cw.main.humidity,
    windSpeed: cw.wind.speed,
    condition: cw.weather[0]?.main || 'Unknown',
    description: cw.weather[0]?.description || 'No description',
    icon: cw.weather[0]?.icon || '01d',
  };

  //.
  // Group by day and take the midday (12:00) slot, or the first slot of each day.
  const slotsByDay = new Map<string, any>();
  for (const slot of forecastRes.data.list) {
    const dateStr = new Date(slot.dt * 1000).toISOString().split('T')[0] as string;
    const existing = slotsByDay.get(dateStr);
    if (!existing) {
      slotsByDay.set(dateStr, slot);
    } else {
      const existingHour = new Date(existing.dt * 1000).getUTCHours();
      const slotHour = new Date(slot.dt * 1000).getUTCHours();
      if (Math.abs(slotHour - 12) < Math.abs(existingHour - 12)) {
        slotsByDay.set(dateStr, slot);
      }
    }
  }

  const forecast: DailyForecast[] = Array.from(slotsByDay.entries())
    .slice(0, 7)
    .map(([dateStr, slot]) => {
      if (!dateStr || !slot) return null;
      const date = new Date((slot.dt as number) * 1000);
      return {
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        tempMin: Math.round(slot.main.temp_min),
        tempMax: Math.round(slot.main.temp_max),
        humidity: slot.main.humidity,
        windSpeed: slot.wind.speed,
        condition: slot.weather[0]?.main || 'Unknown',
        icon: slot.weather[0]?.icon || '01d',
        rainChance: Math.round((slot.pop || 0) * 100),
      } as DailyForecast;
    })
    .filter((d): d is DailyForecast => d !== null);

  const response: WeatherResponse = { location, current, forecast };
  cache.set(cacheKey, response);
  return response;
}