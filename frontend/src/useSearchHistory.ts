import { useState, useCallback } from 'react';

const HISTORY_KEY = 'weather_search_history';
const MAX_HISTORY = 5;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const addToHistory = useCallback((city: string) => {
    setHistory((prev) => {
      // Remove duplicate, put at front, cap at MAX_HISTORY
      const deduped = [city, ...prev.filter((c) => c.toLowerCase() !== city.toLowerCase())];
      const next = deduped.slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((city: string) => {
    setHistory((prev) => {
      const next = prev.filter((c) => c !== city);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
