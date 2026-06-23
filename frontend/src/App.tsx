import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CloudSun } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { CurrentWeather } from './components/CurrentWeather';
import { ForecastCard } from './components/ForecastCard';
import { CurrentSkeleton, ForecastSkeleton } from './components/WeatherSkeleton';
import { ErrorBanner } from './components/ErrorBanner';
import { useWeather } from './useWeather';
import { useSearchHistory } from './useSearchHistory';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false },
  },
});

function AppContent() {
  const [submittedCity, setSubmittedCity] = useState('');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  const { data, isLoading, isError, error, refetch } = useWeather(submittedCity, units);

  const handleSearch = (c: string) => {
    setSubmittedCity(c);
    addToHistory(c);
  };

  const errMsg = isError ? (error as any)?.message || 'Failed to load weather' : '';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="py-5 px-4 sm:py-8">
        <div className="max-w-6xl mx-auto flex items-center">
          
          <div className="w-16 sm:w-20 shrink-0" />

          <div className="flex flex-1 items-center justify-center gap-2 sm:gap-3">
            <CloudSun className="w-7 h-7 sm:w-10 sm:h-10 text-weather-accent shrink-0" />
            <h1 className="text-xl sm:text-3xl font-bold whitespace-nowrap">Weather Forecast</h1>
          </div>

         
          <button
            onClick={() => setUnits((u) => (u === 'metric' ? 'imperial' : 'metric'))}
            className="w-16 sm:w-20 flex items-center justify-center gap-0.5 sm:gap-1 bg-weather-card border border-white/10 rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium hover:border-weather-accent/40 transition-all duration-200 shrink-0"
            title="Toggle temperature unit"
          >
            <span className={units === 'metric' ? 'text-weather-accent' : 'text-weather-text-secondary'}>°C</span>
            <span className="text-weather-text-secondary">/</span>
            <span className={units === 'imperial' ? 'text-weather-accent' : 'text-weather-text-secondary'}>°F</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 pb-8 sm:pb-12 space-y-5 sm:space-y-8">
        <SearchBar
          onSearch={handleSearch}
          loading={isLoading}
          history={history}
          onRemoveHistory={removeFromHistory}
          onClearHistory={clearHistory}
        />

        {isError && <ErrorBanner message={errMsg} onRetry={() => refetch()} />}

        {isLoading && submittedCity && <CurrentSkeleton />}
        {data && <CurrentWeather data={data} units={units} />}

        {isLoading && submittedCity && <ForecastSkeleton />}
        {data && (
          <div className="animate-slide-up space-y-4">
            <h3 className="text-xl font-semibold">7-Day Forecast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {data.forecast.map((day: any, i: number) => (
                <ForecastCard key={day.date} day={day} units={units} isToday={i === 0} />
              ))}
            </div>
          </div>
        )}

        {!submittedCity && !isLoading && (
          <div className="text-center py-20 animate-fade-in">
            <CloudSun className="w-20 h-20 text-weather-text-secondary/30 mx-auto mb-4" />
            <p className="text-weather-text-secondary text-lg">Search for a city to see the weather forecast</p>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-weather-text-secondary/50 text-sm">
        <p>Powered by OpenWeatherMap</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
