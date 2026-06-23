import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-weather-error/10 border border-weather-error/30 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
      <AlertCircle className="w-5 h-5 text-weather-error flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-weather-error text-sm font-medium">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 text-sm text-weather-error underline hover:no-underline">
            Try again
          </button>
        )}
      </div>
      <button onClick={() => setDismissed(true)} className="text-weather-error/70 hover:text-weather-error" aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}