export function CurrentSkeleton() {
  return (
    <div className="bg-weather-card rounded-2xl p-6 space-y-6 animate-pulse">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-weather-card-hover rounded-full" />
        <div className="space-y-3">
          <div className="w-48 h-6 bg-weather-card-hover rounded" />
          <div className="w-32 h-4 bg-weather-card-hover rounded" />
          <div className="w-24 h-12 bg-weather-card-hover rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-weather-card-hover rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function ForecastSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="bg-weather-card rounded-2xl p-4 space-y-3 animate-pulse">
          <div className="w-16 h-4 bg-weather-card-hover rounded mx-auto" />
          <div className="w-10 h-10 bg-weather-card-hover rounded-full mx-auto" />
          <div className="w-20 h-5 bg-weather-card-hover rounded mx-auto" />
          <div className="w-24 h-3 bg-weather-card-hover rounded mx-auto" />
        </div>
      ))}
    </div>
  );
}