import { Button } from "@/components/ui/button";

interface UnitToggleProps {
  unit: "F" | "C";
  onUnitChange: (unit: "F" | "C") => void;
}

export function UnitToggle({ unit, onUnitChange }: UnitToggleProps) {
  return (
    <div className="flex items-center rounded-md border border-border p-0.5 gap-0.5">
      <Button
        variant={unit === "F" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onUnitChange("F")}
        data-testid="button-unit-fahrenheit"
        className="px-3 text-sm font-medium"
      >
        °F
      </Button>
      <Button
        variant={unit === "C" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onUnitChange("C")}
        data-testid="button-unit-celsius"
        className="px-3 text-sm font-medium"
      >
        °C
      </Button>
    </div>
  );
}
