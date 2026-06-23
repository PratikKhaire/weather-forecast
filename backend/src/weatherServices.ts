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

  // Step 2: Get weather data
  const weatherRes = await axios.get(
    `${config.OPENWEATHER_BASE_URL}/data/3.0/onecall`,
    {
      params: {
        lat: location.lat,
        lon: location.lon,
        units,
        exclude: 'minutely,hourly,alerts',
        appid: config.OPENWEATHER_API_KEY,
      },
      timeout: 5000,
    }
  );

  const data = weatherRes.data;

  // Step 3: Transform to our format
  const current: CurrentWeather = {
    temp: data.current.temp,
    feelsLike: data.current.feels_like,
    humidity: data.current.humidity,
    windSpeed: data.current.wind_speed,
    condition: data.current.weather[0]?.main || 'Unknown',
    description: data.current.weather[0]?.description || 'No description',
    icon: data.current.weather[0]?.icon || '01d',
  };

  const forecast: DailyForecast[] = data.daily.slice(0, 7).map((day: any) => {
    const date = new Date(day.dt * 1000);
    return {
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'long' }),
      tempMin: Math.round(day.temp.min),
      tempMax: Math.round(day.temp.max),
      humidity: day.humidity,
      windSpeed: day.wind_speed,
      condition: day.weather[0]?.main || 'Unknown',
      icon: day.weather[0]?.icon || '01d',
      rainChance: Math.round((day.pop || 0) * 100),
    };
  });

  const response: WeatherResponse = { location, current, forecast };
  cache.set(cacheKey, response);
  return response;
}