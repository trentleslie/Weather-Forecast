import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2, Navigation } from "lucide-react";
import type { Location } from "@shared/schema";

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

  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const locations: Location[] = await response.json();
      setSearchResults(locations);
    } catch (error) {
      console.error("Location search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchLocations]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [open]);

  const handleLocationClick = (location: Location) => {
    onLocationSelect(location);
    setSearchQuery("");
    setSearchResults([]);
  };

  const formatLocationSubtext = (location: Location) => {
    const parts = [];
    if (location.admin1) {
      parts.push(location.admin1);
    }
    if (location.country) {
      parts.push(location.country);
    }
    return parts.join(", ");
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
                    <p className="text-xs text-muted-foreground">{formatLocationSubtext(location)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-results">
              No locations found for "{searchQuery}"
            </p>
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
                      <p className="text-xs text-muted-foreground">{formatLocationSubtext(location)}</p>
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
