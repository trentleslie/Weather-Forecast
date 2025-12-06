import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2, Navigation } from "lucide-react";

interface Location {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface LocationSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: Location) => void;
  onUseMyLocation: () => void;
  isLoadingGeolocation?: boolean;
  recentLocations?: Location[];
}

export function LocationSearch({
  open,
  onOpenChange,
  onLocationSelect,
  onUseMyLocation,
  isLoadingGeolocation = false,
  recentLocations = [],
}: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const mockResults: Location[] = [
      { id: "1", name: "Seattle", country: "United States", latitude: 47.6062, longitude: -122.3321 },
      { id: "2", name: "San Francisco", country: "United States", latitude: 37.7749, longitude: -122.4194 },
      { id: "3", name: "New York", country: "United States", latitude: 40.7128, longitude: -74.006 },
      { id: "4", name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 },
      { id: "5", name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
    ].filter((loc) =>
      loc.name.toLowerCase().includes(query.toLowerCase()) ||
      loc.country.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(mockResults);
    setIsSearching(false);
  };

  const handleLocationClick = (location: Location) => {
    onLocationSelect(location);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="dialog-location-search">
        <DialogHeader>
          <DialogTitle>Search Location</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search city or coordinates..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              data-testid="input-location-search"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={onUseMyLocation}
            disabled={isLoadingGeolocation}
            data-testid="button-use-my-location"
          >
            {isLoadingGeolocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Use my location
          </Button>

          {searchResults.length > 0 && (
            <div className="border rounded-md divide-y">
              {searchResults.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationClick(location)}
                  className="w-full flex items-center gap-3 p-3 text-left hover-elevate active-elevate-2"
                  data-testid={`button-location-${location.id}`}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{location.name}</p>
                    <p className="text-xs text-muted-foreground">{location.country}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {recentLocations.length > 0 && searchQuery.length === 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Recent</p>
              <div className="border rounded-md divide-y">
                {recentLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationClick(location)}
                    className="w-full flex items-center gap-3 p-3 text-left hover-elevate active-elevate-2"
                    data-testid={`button-recent-location-${location.id}`}
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{location.name}</p>
                      <p className="text-xs text-muted-foreground">{location.country}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
