import { DeviationBadge } from "../weather/DeviationBadge";

export default function DeviationBadgeExample() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <DeviationBadge deviation={6} unit="F" size="lg" />
      <DeviationBadge deviation={-4} unit="F" size="lg" />
      <DeviationBadge deviation={0} unit="F" size="sm" />
      <DeviationBadge deviation={9} unit="C" size="sm" />
    </div>
  );
}
