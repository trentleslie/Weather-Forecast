import { MapPin } from "lucide-react";
import { DeviationBadge } from "./DeviationBadge";

interface CurrentWeatherProps {
  location: string;
  temperature: number;
  feelsLike: number;
  deviation: number;
  unit: "F" | "C";
  narrativeSummary: string;
  onLocationClick?: () => void;
}

export function CurrentWeather({
  location,
  temperature,
  feelsLike,
  deviation,
  unit,
  narrativeSummary,
  onLocationClick,
}: CurrentWeatherProps) {
  return (
    <div className="text-center py-12 md:py-16">
      <button
        onClick={onLocationClick}
        className="inline-flex items-center gap-2 text-muted-foreground hover-elevate active-elevate-2 rounded-md px-3 py-1.5 mb-4 transition-colors"
        data-testid="button-change-location"
      >
        <MapPin className="h-4 w-4" />
        <span className="text-base font-medium">{location}</span>
      </button>

      <div className="flex items-center justify-center gap-4 mb-4">
        <span
          className="text-6xl md:text-8xl font-bold tabular-nums tracking-tight"
          data-testid="text-current-temp"
        >
          {Math.round(temperature)}°
        </span>
        <DeviationBadge deviation={deviation} unit={unit} size="lg" />
      </div>

      <p className="text-muted-foreground text-base mb-6" data-testid="text-feels-like">
        Feels like {Math.round(feelsLike)}°{unit}
      </p>

      <div className="max-w-md mx-auto">
        <p
          className="text-base md:text-lg text-foreground/90 leading-relaxed"
          data-testid="text-narrative"
        >
          {narrativeSummary}
        </p>
      </div>
    </div>
  );
}
