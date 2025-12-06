import { DailyAnomalyCard } from "../weather/DailyAnomalyCard";

export default function DailyAnomalyCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
      <DailyAnomalyCard
        dayLabel="Today"
        temperature={52}
        high={56}
        low={45}
        deviation={6}
        precipitationProbability={20}
        unit="F"
        isToday
      />
      <DailyAnomalyCard
        dayLabel="Tomorrow"
        temperature={58}
        high={62}
        low={48}
        deviation={9}
        precipitationProbability={0}
        unit="F"
      />
      <DailyAnomalyCard
        dayLabel="Saturday"
        temperature={48}
        high={52}
        low={42}
        deviation={-2}
        precipitationProbability={65}
        unit="F"
      />
    </div>
  );
}
