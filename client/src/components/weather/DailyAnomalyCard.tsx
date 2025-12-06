import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Droplets } from "lucide-react";

interface DailyAnomalyCardProps {
  dayLabel: string;
  temperature: number;
  high: number;
  low: number;
  deviation: number;
  precipitationProbability: number;
  unit: "F" | "C";
  isToday?: boolean;
}

export function DailyAnomalyCard({
  dayLabel,
  temperature,
  high,
  low,
  deviation,
  precipitationProbability,
  unit,
  isToday = false,
}: DailyAnomalyCardProps) {
  const isWarm = deviation > 0;
  const isCold = deviation < 0;

  return (
    <Card
      className={`p-6 text-center hover-elevate ${isToday ? "ring-2 ring-primary/20" : ""}`}
      data-testid={`card-daily-${dayLabel.toLowerCase()}`}
    >
      <p className="text-sm font-medium text-muted-foreground mb-3">
        {isToday ? "TODAY" : dayLabel.toUpperCase()}
      </p>

      <p
        className="text-4xl md:text-5xl font-semibold tabular-nums mb-2"
        data-testid={`text-temp-${dayLabel.toLowerCase()}`}
      >
        {Math.round(temperature)}°
      </p>

      <div
        className={`inline-flex items-center gap-1 text-sm font-medium mb-3 ${
          isWarm ? "text-temp-warm" : isCold ? "text-temp-cold" : "text-muted-foreground"
        }`}
        data-testid={`text-deviation-${dayLabel.toLowerCase()}`}
      >
        {isWarm ? (
          <ArrowUp className="h-4 w-4" />
        ) : isCold ? (
          <ArrowDown className="h-4 w-4" />
        ) : null}
        {isWarm ? "+" : ""}
        {Math.round(deviation)}°
        <span className="opacity-70 ml-1">
          {isWarm ? "above" : isCold ? "below" : "at"} avg
        </span>
      </div>

      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span className="tabular-nums">
          H: {Math.round(high)}° L: {Math.round(low)}°
        </span>
      </div>

      {precipitationProbability > 0 && (
        <div className="flex items-center justify-center gap-1 mt-3 text-sm text-temp-cold">
          <Droplets className="h-3.5 w-3.5" />
          <span className="tabular-nums">{precipitationProbability}%</span>
        </div>
      )}
    </Card>
  );
}
