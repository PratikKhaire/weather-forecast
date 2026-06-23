import { useState } from 'react';
import { Search, MapPin, Locate, Clock, X, Trash2 } from 'lucide-react';
import { getCityFromCoords } from '../api';

interface Props {
  onSearch: (city: string) => void;
  loading?: boolean;
  history: string[];
  onRemoveHistory: (city: string) => void;
  onClearHistory: () => void;
}

export function SearchBar({ onSearch, loading, history, onRemoveHistory, onClearHistory }: Props) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) onSearch(trimmed);
  };

  const handleLocate = async () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported by your browser');
      return;
    }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const city = await getCityFromCoords(pos.coords.latitude, pos.coords.longitude);
          setQuery(city);
          onSearch(city);
        } catch {
          setLocError('Could not determine your city');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocError('Location access denied');
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Search form */}
      <form onSubmit={handleSubmit}>
        <div
          className={`relative flex items-center bg-weather-card rounded-2xl border-2 transition-all duration-200 ${
            focused
              ? 'border-weather-accent shadow-lg shadow-weather-accent/20'
              : 'border-transparent hover:border-weather-card-hover'
          }`}
        >
          <MapPin className="absolute left-4 w-5 h-5 text-weather-text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search for a city..."
            className="w-full bg-transparent text-weather-text placeholder-weather-text-secondary pl-12 pr-24 py-4 rounded-2xl outline-none text-lg"
            aria-label="Search for a city"
            disabled={loading || locating}
          />

          {/* Use my location button */}
          <button
            type="button"
            onClick={handleLocate}
            disabled={loading || locating}
            title="Use my current location"
            className="absolute right-12 p-2.5 rounded-xl text-weather-text-secondary hover:text-weather-accent transition-colors duration-200 disabled:opacity-40"
          >
            <Locate className={`w-5 h-5 ${locating ? 'animate-spin' : ''}`} />
          </button>

          {/* Search submit button */}
          <button
            type="submit"
            disabled={loading || query.trim().length < 2}
            className={`absolute right-2 p-2.5 rounded-xl transition-all duration-200 ${
              query.trim().length >= 2 && !loading
                ? 'bg-weather-accent text-weather-bg hover:bg-weather-accent/90'
                : 'bg-weather-card-hover text-weather-text-secondary cursor-not-allowed'
            }`}
          >
            <Search className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {query.trim().length > 0 && query.trim().length < 2 && (
          <p className="text-weather-text-secondary text-sm mt-2 ml-1">Type at least 2 characters</p>
        )}
        {locError && (
          <p className="text-weather-error text-sm mt-2 ml-1">{locError}</p>
        )}
      </form>

      {/* ── Search History ──────────────────────────────────── */}
      {history.length > 0 && (
        <div className="bg-weather-card/40 border border-white/8 rounded-2xl p-4 space-y-3 animate-fade-in backdrop-blur-sm">

          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-weather-text-secondary text-xs font-medium uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" />
              <span>Recent Searches</span>
            </div>
            <button
              type="button"
              onClick={onClearHistory}
              title="Clear all history"
              className="flex items-center gap-1.5 text-xs text-weather-text-secondary/60 hover:text-weather-error transition-colors duration-200 group"
            >
              <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-150" />
              <span>Clear all</span>
            </button>
          </div>

          {/* History chips */}
          <div className="flex flex-wrap gap-2">
            {history.map((city, idx) => (
              <div
                key={city}
                className="group relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer border"
                style={{
                  background: `linear-gradient(135deg, rgba(56,189,248,${0.06 - idx * 0.008}) 0%, rgba(30,41,59,0.6) 100%)`,
                  borderColor: `rgba(56,189,248,${0.18 - idx * 0.02})`,
                }}
              >
                {/* Clickable city name */}
                <button
                  type="button"
                  onClick={() => { onSearch(city); }}
                  className="text-weather-text hover:text-weather-accent transition-colors duration-150 outline-none"
                >
                  {city}
                </button>

                {/* Remove button — appears on hover */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemoveHistory(city); }}
                  aria-label={`Remove ${city}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-weather-text-secondary hover:text-weather-error ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Subtle rank dot — first item is brightest */}
                {idx === 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-weather-accent animate-pulse-slow" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}