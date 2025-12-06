import { useState } from "react";
import { Header } from "../weather/Header";

export default function HeaderExample() {
  const [unit, setUnit] = useState<"F" | "C">("F");

  return (
    <div className="w-full">
      <Header
        unit={unit}
        onUnitChange={setUnit}
        onSearchClick={() => console.log("Search clicked")}
      />
    </div>
  );
}
