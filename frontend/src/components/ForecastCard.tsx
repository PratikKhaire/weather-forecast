import { getIconName, getIconColor, formatTemp } from '../utils';
import * as Icons from 'lucide-react';

interface Props {
  day: any;
  units: 'metric' | 'imperial';
  isToday?: boolean;
}

export function ForecastCard({ day, units, isToday }: Props) {
  const Icon = (Icons as any)[getIconName(day.icon)] || Icons.Cloud;
  const color = getIconColor(day.icon);

  return (
    <div
      className={`flex flex-col items-center text-center p-4 bg-weather-card rounded-2xl transition-all duration-300 ${
        isToday ? 'ring-2 ring-weather-accent/50' : 'hover:bg-weather-card-hover hover:-translate-y-1 hover:shadow-xl cursor-pointer'
      }`}
    >
      <p className="text-sm font-medium text-weather-text-secondary mb-1">{isToday ? 'Today' : day.day}</p>
      <p className="text-xs text-weather-text-secondary/70 mb-3">{day.date}</p>
      <div className={`mb-3 ${color}`}>
        <Icon className="w-10 h-10" strokeWidth={1.5} />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg font-semibold">{formatTemp(day.tempMax, units)}</span>
        <span className="text-sm text-weather-text-secondary">{formatTemp(day.tempMin, units)}</span>
      </div>
      <p className="text-xs text-weather-text-secondary capitalize mb-2">{day.condition}</p>
      {day.rainChance > 0 && (
        <div className="flex items-center gap-1 text-xs text-blue-400">
          <Icons.Droplets className="w-3 h-3" />
          <span>{day.rainChance}%</span>
        </div>
      )}
    </div>
  );
}
