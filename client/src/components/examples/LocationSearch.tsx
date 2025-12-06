import { useState } from "react";
import { LocationSearch } from "../weather/LocationSearch";
import { Button } from "@/components/ui/button";

export default function LocationSearchExample() {
  const [open, setOpen] = useState(true);

  const recentLocations = [
    { id: "r1", name: "Seattle", country: "United States", latitude: 47.6062, longitude: -122.3321 },
    { id: "r2", name: "Portland", country: "United States", latitude: 45.5152, longitude: -122.6784 },
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Location Search</Button>
      <LocationSearch
        open={open}
        onOpenChange={setOpen}
        onLocationSelect={(loc) => {
          console.log("Selected:", loc);
          setOpen(false);
        }}
        onUseMyLocation={() => console.log("Use my location")}
        recentLocations={recentLocations}
      />
    </>
  );
}
