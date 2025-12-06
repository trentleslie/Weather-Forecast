import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function CurrentWeatherSkeleton() {
  return (
    <div className="text-center py-12 md:py-16" data-testid="skeleton-current-weather">
      <Skeleton className="h-6 w-32 mx-auto mb-4" />
      <div className="flex items-center justify-center gap-4 mb-4">
        <Skeleton className="h-24 w-32" />
        <Skeleton className="h-8 w-28" />
      </div>
      <Skeleton className="h-5 w-36 mx-auto mb-6" />
      <Skeleton className="h-16 w-96 max-w-full mx-auto" />
    </div>
  );
}

export function DailyCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="skeleton-daily-cards">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-4 w-16 mx-auto mb-3" />
          <Skeleton className="h-12 w-20 mx-auto mb-2" />
          <Skeleton className="h-5 w-24 mx-auto mb-3" />
          <Skeleton className="h-4 w-28 mx-auto" />
        </Card>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="p-6 md:p-8" data-testid="skeleton-chart">
      <Skeleton className="h-6 w-64 mb-6" />
      <Skeleton className="h-80 w-full" />
    </Card>
  );
}

export function WeatherSkeleton() {
  return (
    <div className="space-y-8">
      <div className="text-center pt-8 pb-4">
        <p className="text-muted-foreground text-lg animate-pulse">
          Gathering weather data...
        </p>
      </div>
      <CurrentWeatherSkeleton />
      <ChartSkeleton />
      <DailyCardsSkeleton />
    </div>
  );
}
