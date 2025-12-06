import { useState } from "react";
import { UnitToggle } from "../weather/UnitToggle";

export default function UnitToggleExample() {
  const [unit, setUnit] = useState<"F" | "C">("F");
  
  return (
    <UnitToggle unit={unit} onUnitChange={setUnit} />
  );
}
