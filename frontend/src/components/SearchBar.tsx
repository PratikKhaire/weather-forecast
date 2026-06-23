import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

interface Props {
  onSearch: (city: string) => void;
  loading?: boolean;
}

export function SearchBar({ onSearch, loading }: Props) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
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
          className="w-full bg-transparent text-weather-text placeholder-weather-text-secondary pl-12 pr-4 py-4 rounded-2xl outline-none text-lg"
          aria-label="Search for a city"
          disabled={loading}
        />
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
    </form>
  );
}