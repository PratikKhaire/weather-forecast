// Map OpenWeather icon codes to Lucide icon names
export function getIconName(code: string): string {
  const map: Record<string, string> = {
    '01d': 'Sun', '01n': 'Moon',
    '02d': 'CloudSun', '02n': 'CloudMoon',
    '03d': 'Cloud', '03n': 'Cloud',
    '04d': 'Cloudy', '04n': 'Cloudy',
    '09d': 'CloudRain', '09n': 'CloudRain',
    '10d': 'CloudSunRain', '10n': 'CloudMoonRain',
    '11d': 'CloudLightning', '11n': 'CloudLightning',
    '13d': 'Snowflake', '13n': 'Snowflake',
    '50d': 'Wind', '50n': 'Wind',
  };
  return map[code] || 'Cloud';
}

export function getIconColor(code: string): string {
  if (code.includes('d')) {
    if (code.startsWith('01')) return 'text-weather-accent-warm';
    if (code.startsWith('02')) return 'text-weather-accent';
    return 'text-weather-text-secondary';
  }
  return 'text-blue-300';
}

export function formatTemp(t: number, units: 'metric' | 'imperial') {
  return `${Math.round(t)}${units === 'metric' ? '°C' : '°F'}`;
}

export function formatWind(s: number, units: 'metric' | 'imperial') {
  return `${s.toFixed(1)} ${units === 'metric' ? 'm/s' : 'mph'}`;
}

export function formatHumidity(h: number) {
  return `${h}%`;
}