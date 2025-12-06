import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UnitToggle } from "./UnitToggle";

interface HeaderProps {
  unit: "F" | "C";
  onUnitChange: (unit: "F" | "C") => void;
  onSearchClick: () => void;
}

export function Header({ unit, onUnitChange, onSearchClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold hidden sm:block">Weather Context</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchClick}
            data-testid="button-search"
            aria-label="Search location"
          >
            <Search className="h-5 w-5" />
          </Button>
          <UnitToggle unit={unit} onUnitChange={onUnitChange} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
