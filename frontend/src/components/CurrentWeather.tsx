import { Droplets, Wind, Thermometer, Gauge } from 'lucide-react';
import { getIconName, getIconColor, formatTemp, formatWind, formatHumidity } from '../utils';
import * as Icons from 'lucide-react';

interface Props {
  data: any; 
  units: 'metric' | 'imperial';
}

export function CurrentWeather({ data, units }: Props) {
  const { current, location } = data;
  const Icon = (Icons as any)[getIconName(current.icon)] || Icons.Cloud;
  const color = getIconColor(current.icon);

  const details = [
    { label: 'Humidity', value: formatHumidity(current.humidity), icon: Droplets },
    { label: 'Wind', value: formatWind(current.windSpeed, units), icon: Wind },
    { label: 'Feels Like', value: formatTemp(current.feelsLike, units), icon: Thermometer },
    { label: 'Pressure', value: '1013 hPa', icon: Gauge }, 
  ];

  return (
    <div className="bg-weather-card/80 backdrop-blur rounded-2xl p-6 border border-white/10 animate-slide-up">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className={color}>
            <Icon className="w-24 h-24" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{location.city}, {location.country}</h2>
            <p className="text-weather-text-secondary capitalize">{current.description}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-6xl font-light">{formatTemp(current.temp, units)}</span>
              <span className="text-weather-text-secondary text-lg">{current.condition}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          {details.map((d) => (
            <div key={d.label} className="flex items-center gap-3 bg-weather-bg/50 rounded-xl p-3">
              <d.icon className="w-5 h-5 text-weather-accent" />
              <div>
                <p className="text-xs text-weather-text-secondary">{d.label}</p>
                <p className="text-sm font-medium">{d.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}