import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeviationBadgeProps {
  deviation: number;
  unit: "F" | "C";
  size?: "sm" | "lg";
}

export function DeviationBadge({ deviation, unit, size = "sm" }: DeviationBadgeProps) {
  const isWarm = deviation > 0;
  const isCold = deviation < 0;
  const isNormal = deviation === 0;

  const displayValue = Math.abs(deviation).toFixed(0);
  const Icon = isWarm ? ArrowUp : isCold ? ArrowDown : Minus;

  const sizeClasses = size === "lg" 
    ? "text-base px-3 py-1.5" 
    : "text-xs px-2 py-0.5";

  return (
    <Badge
      variant="outline"
      className={`
        ${sizeClasses}
        font-medium
        ${isWarm ? "text-temp-warm border-temp-warm/30 bg-temp-warm/10" : ""}
        ${isCold ? "text-temp-cold border-temp-cold/30 bg-temp-cold/10" : ""}
        ${isNormal ? "text-muted-foreground border-muted bg-muted/50" : ""}
      `}
      data-testid="badge-deviation"
    >
      <Icon className={`${size === "lg" ? "h-4 w-4" : "h-3 w-3"} mr-1`} />
      {isWarm ? "+" : isCold ? "-" : ""}{displayValue}°{unit}
      <span className="ml-1 opacity-70">
        {isWarm ? "above" : isCold ? "below" : "at"} avg
      </span>
    </Badge>
  );
}
