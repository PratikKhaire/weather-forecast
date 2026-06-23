import { useQuery } from '@tanstack/react-query';
import { getWeather } from './api';

export function useWeather(city: string, units: 'metric' | 'imperial' = 'metric') {
  return useQuery({
    queryKey: ['weather', city.toLowerCase().trim(), units],
    queryFn: () => getWeather(city, units),
    enabled: city.trim().length >= 2,
    staleTime: 2 * 60 * 1000,       // 2 minutes
    gcTime: 5 * 60 * 1000,       // 5 minutes
    retry: (count, err: any) => {
      if (err.status === 404) return false; // do not retry found 
      return count < 2;
    },
  });
}