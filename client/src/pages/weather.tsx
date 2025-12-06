import { useState } from "react";
import { Header } from "@/components/weather/Header";
import { CurrentWeather } from "@/components/weather/CurrentWeather";
import { TemperatureChart } from "@/components/weather/TemperatureChart";
import { DailyAnomalyCard } from "@/components/weather/DailyAnomalyCard";
import { LocationSearch } from "@/components/weather/LocationSearch";
import { WeatherSkeleton } from "@/components/weather/WeatherSkeleton";
import { ErrorState } from "@/components/weather/ErrorState";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface Location {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

const mockChartData = [
  { date: "2024-12-01", displayDate: "Dec 1", historicalMin: 38, historicalMax: 52, historicalAvg: 45, recordHighYear: 2015, recordLowYear: 1998, actualTemp: 48 },
  { date: "2024-12-02", displayDate: "Dec 2", historicalMin: 37, historicalMax: 51, historicalAvg: 44, recordHighYear: 2019, recordLowYear: 1985, actualTemp: 50 },
  { date: "2024-12-03", displayDate: "Dec 3", historicalMin: 36, historicalMax: 50, historicalAvg: 43, recordHighYear: 2014, recordLowYear: 1990, actualTemp: 52 },
  { date: "2024-12-04", displayDate: "Dec 4", historicalMin: 35, historicalMax: 49, historicalAvg: 42, recordHighYear: 2017, recordLowYear: 1972, actualTemp: 49 },
  { date: "2024-12-05", displayDate: "Dec 5", historicalMin: 35, historicalMax: 48, historicalAvg: 42, recordHighYear: 2013, recordLowYear: 1983, actualTemp: 51 },
  { date: "2024-12-06", displayDate: "Dec 6", historicalMin: 34, historicalMax: 48, historicalAvg: 41, recordHighYear: 2018, recordLowYear: 1976, actualTemp: 52, isToday: true },
  { date: "2024-12-07", displayDate: "Dec 7", historicalMin: 34, historicalMax: 47, historicalAvg: 41, recordHighYear: 2015, recordLowYear: 1988, forecastTemp: 54 },
  { date: "2024-12-08", displayDate: "Dec 8", historicalMin: 33, historicalMax: 47, historicalAvg: 40, recordHighYear: 2012, recordLowYear: 1979, forecastTemp: 58 },
  { date: "2024-12-09", displayDate: "Dec 9", historicalMin: 33, historicalMax: 46, historicalAvg: 40, recordHighYear: 2016, recordLowYear: 1985, forecastTemp: 55 },
  { date: "2024-12-10", displayDate: "Dec 10", historicalMin: 32, historicalMax: 46, historicalAvg: 39, recordHighYear: 2014, recordLowYear: 1972, forecastTemp: 48 },
  { date: "2024-12-11", displayDate: "Dec 11", historicalMin: 32, historicalMax: 45, historicalAvg: 39, recordHighYear: 2019, recordLowYear: 1990, forecastTemp: 46 },
  { date: "2024-12-12", displayDate: "Dec 12", historicalMin: 31, historicalMax: 45, historicalAvg: 38, recordHighYear: 2017, recordLowYear: 1998, forecastTemp: 44 },
];

const mockDailyForecast = [
  { dayLabel: "Today", temperature: 52, high: 56, low: 45, deviation: 11, precipitationProbability: 20, isToday: true },
  { dayLabel: "Tomorrow", temperature: 54, high: 58, low: 48, deviation: 13, precipitationProbability: 0 },
  { dayLabel: "Sunday", temperature: 58, high: 62, low: 50, deviation: 18, precipitationProbability: 10 },
];

const recentLocations: Location[] = [
  { id: "r1", name: "Seattle", country: "United States", latitude: 47.6062, longitude: -122.3321 },
  { id: "r2", name: "Portland", country: "United States", latitude: 45.5152, longitude: -122.6784 },
];

export default function WeatherPage() {
  const [unit, setUnit] = useState<"F" | "C">("F");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location>({
    id: "1",
    name: "Seattle",
    country: "United States",
    latitude: 47.6062,
    longitude: -122.3321,
  });

  const convertTemp = (tempF: number): number => {
    if (unit === "C") {
      return ((tempF - 32) * 5) / 9;
    }
    return tempF;
  };

  const handleLocationSelect = (location: Location) => {
    setCurrentLocation(location);
    setSearchOpen(false);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleUseMyLocation = () => {
    setIsLoadingGeolocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            id: "current",
            name: "Current Location",
            country: "",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
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
    setError(null);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const currentTemp = convertTemp(52);
  const feelsLike = convertTemp(48);
  const deviation = unit === "F" ? 11 : Math.round((11 * 5) / 9);

  const narrativeSummary = `This week is running ${Math.abs(deviation)}°${unit} warmer than typical for early December. Expect continued above-average temperatures through Thursday before cooling off over the weekend.`;

  const chartDataConverted = mockChartData.map((d) => ({
    ...d,
    historicalMin: convertTemp(d.historicalMin),
    historicalMax: convertTemp(d.historicalMax),
    historicalAvg: convertTemp(d.historicalAvg),
    recordHighYear: d.recordHighYear,
    recordLowYear: d.recordLowYear,
    actualTemp: d.actualTemp ? convertTemp(d.actualTemp) : undefined,
    forecastTemp: d.forecastTemp ? convertTemp(d.forecastTemp) : undefined,
  }));

  const dailyForecastConverted = mockDailyForecast.map((d) => ({
    ...d,
    temperature: convertTemp(d.temperature),
    high: convertTemp(d.high),
    low: convertTemp(d.low),
    deviation: unit === "F" ? d.deviation : Math.round((d.deviation * 5) / 9),
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header
        unit={unit}
        onUnitChange={setUnit}
        onSearchClick={() => setSearchOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 pb-12">
        {isLoading ? (
          <WeatherSkeleton />
        ) : error ? (
          <div className="py-12">
            <ErrorState
              title="Failed to load weather data"
              message={error}
              onRetry={handleRetry}
            />
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            <CurrentWeather
              location={`${currentLocation.name}${currentLocation.country ? `, ${currentLocation.country}` : ""}`}
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
                {dailyForecastConverted.map((day, index) => (
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
        )}
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
