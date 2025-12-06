import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/weather/Header";
import { CurrentWeather } from "@/components/weather/CurrentWeather";
import { TemperatureChart } from "@/components/weather/TemperatureChart";
import { DailyAnomalyCard } from "@/components/weather/DailyAnomalyCard";
import { LocationSearch } from "@/components/weather/LocationSearch";
import { WeatherSkeleton } from "@/components/weather/WeatherSkeleton";
import { ErrorState } from "@/components/weather/ErrorState";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import type { Location, WeatherResponse } from "@shared/schema";

const STORAGE_KEY = "weather-recent-locations";
const MAX_RECENT = 5;

function getRecentLocations(): Location[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentLocation(location: Location) {
  try {
    const recent = getRecentLocations().filter(l => l.id !== location.id);
    recent.unshift(location);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // Ignore storage errors
  }
}

export default function WeatherPage() {
  const [unit, setUnit] = useState<"F" | "C">("F");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false);
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location>({
    id: "seattle-default",
    name: "Seattle",
    country: "United States",
    latitude: 47.6062,
    longitude: -122.3321,
  });

  useEffect(() => {
    setRecentLocations(getRecentLocations());
  }, []);

  const weatherQueryUrl = `/api/weather?${new URLSearchParams({
    lat: currentLocation.latitude.toString(),
    lon: currentLocation.longitude.toString(),
    name: currentLocation.name,
    country: currentLocation.country,
  }).toString()}`;

  const { data: weatherData, isLoading, error, refetch } = useQuery<WeatherResponse>({
    queryKey: [weatherQueryUrl],
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const convertTemp = (tempC: number): number => {
    if (unit === "F") {
      return (tempC * 9) / 5 + 32;
    }
    return tempC;
  };

  const handleLocationSelect = (location: Location) => {
    setCurrentLocation(location);
    saveRecentLocation(location);
    setRecentLocations(getRecentLocations());
    setSearchOpen(false);
  };

  const handleUseMyLocation = () => {
    setIsLoadingGeolocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            id: `${position.coords.latitude},${position.coords.longitude}`,
            name: "Current Location",
            country: "",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(location);
          setIsLoadingGeolocation(false);
          setSearchOpen(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setIsLoadingGeolocation(false);
        }
      );
    } else {
      setIsLoadingGeolocation(false);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          unit={unit}
          onUnitChange={setUnit}
          onSearchClick={() => setSearchOpen(true)}
        />
        <main className="max-w-7xl mx-auto px-4 pb-12">
          <WeatherSkeleton />
        </main>
        <LocationSearch
          open={searchOpen}
          onOpenChange={setSearchOpen}
          onLocationSelect={handleLocationSelect}
          onUseMyLocation={handleUseMyLocation}
          isLoadingGeolocation={isLoadingGeolocation}
          recentLocations={recentLocations}
        />
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          unit={unit}
          onUnitChange={setUnit}
          onSearchClick={() => setSearchOpen(true)}
        />
        <main className="max-w-7xl mx-auto px-4 pb-12 py-12">
          <ErrorState
            title="Failed to load weather data"
            message={error instanceof Error ? error.message : "An unexpected error occurred"}
            onRetry={handleRetry}
          />
        </main>
        <LocationSearch
          open={searchOpen}
          onOpenChange={setSearchOpen}
          onLocationSelect={handleLocationSelect}
          onUseMyLocation={handleUseMyLocation}
          isLoadingGeolocation={isLoadingGeolocation}
          recentLocations={recentLocations}
        />
      </div>
    );
  }

  const currentTemp = convertTemp(weatherData.currentTemp);
  const feelsLike = convertTemp(weatherData.feelsLike);
  const deviation = unit === "F" 
    ? Math.round(weatherData.deviation * 9 / 5) 
    : weatherData.deviation;

  const convertNarrativeSummary = (narrative: string, deviationC: number): string => {
    if (unit === "C") {
      return narrative;
    }
    const deviationF = Math.round(deviationC * 9 / 5);
    const absDeviationC = Math.abs(deviationC);
    const absDeviationF = Math.abs(deviationF);
    return narrative.replaceAll(`${absDeviationC}°C`, `${absDeviationF}°F`);
  };

  const narrativeSummary = convertNarrativeSummary(weatherData.narrativeSummary, weatherData.deviation);

  const chartDataConverted = weatherData.chartData.map((d) => ({
    ...d,
    historicalMin: convertTemp(d.historicalMin),
    historicalMax: convertTemp(d.historicalMax),
    historicalAvg: convertTemp(d.historicalAvg),
    recordHighYear: d.recordHighYear,
    recordLowYear: d.recordLowYear,
    actualTemp: d.actualTemp !== undefined ? convertTemp(d.actualTemp) : undefined,
    forecastTemp: d.forecastTemp !== undefined ? convertTemp(d.forecastTemp) : undefined,
  }));

  const dailyForecastConverted = weatherData.dailyForecast.map((d) => ({
    ...d,
    temperature: convertTemp(d.temperature),
    high: convertTemp(d.high),
    low: convertTemp(d.low),
    deviation: unit === "F" ? Math.round(d.deviation * 9 / 5) : d.deviation,
  }));

  const locationDisplay = weatherData.location.country 
    ? `${weatherData.location.name}, ${weatherData.location.country}`
    : weatherData.location.name;

  return (
    <div className="min-h-screen bg-background">
      <Header
        unit={unit}
        onUnitChange={setUnit}
        onSearchClick={() => setSearchOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 pb-12">
        <div className="space-y-8 md:space-y-12">
          <CurrentWeather
            location={locationDisplay}
            temperature={currentTemp}
            feelsLike={feelsLike}
            deviation={deviation}
            unit={unit}
            narrativeSummary={narrativeSummary}
            onLocationClick={() => setSearchOpen(true)}
          />

          <TemperatureChart data={chartDataConverted} unit={unit} />

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">3-Day Forecast</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {dailyForecastConverted.map((day) => (
                <DailyAnomalyCard
                  key={day.dayLabel}
                  dayLabel={day.dayLabel}
                  temperature={day.temperature}
                  high={day.high}
                  low={day.low}
                  deviation={day.deviation}
                  precipitationProbability={day.precipitationProbability}
                  unit={unit}
                  isToday={day.isToday}
                />
              ))}
            </div>
          </section>

          <Collapsible className="mt-8 border-t pt-6" data-testid="collapsible-data-sources">
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2" data-testid="button-toggle-data-sources">
              <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
              <span>Data Sources & Technical Information</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Weather Forecast</h4>
                  <p>Current conditions and 7-day forecast data provided by <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Open-Meteo</a> Forecast API. Updates hourly.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Historical Normals</h4>
                  <p>Climate normals calculated from 30+ years of historical data (1991-2020) via the Open-Meteo Historical Weather API. Daily averages represent the typical temperature range for each calendar day.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Record Temperatures</h4>
                  <p>Record high and low temperatures derived from the historical archive, showing the most extreme temperatures recorded for each date since 1940.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Temperature Deviation</h4>
                  <p>Deviation values show how current or forecast temperatures compare to the historical average for that date. Positive values indicate warmer than normal; negative values indicate cooler than normal.</p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </main>

      <LocationSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onLocationSelect={handleLocationSelect}
        onUseMyLocation={handleUseMyLocation}
        isLoadingGeolocation={isLoadingGeolocation}
        recentLocations={recentLocations}
      />
    </div>
  );
}
