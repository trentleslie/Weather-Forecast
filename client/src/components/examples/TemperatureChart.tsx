import { TemperatureChart } from "../weather/TemperatureChart";

const mockChartData = [
  { date: "2024-12-01", displayDate: "Dec 1", historicalMin: 38, historicalMax: 52, historicalAvg: 45, actualTemp: 48 },
  { date: "2024-12-02", displayDate: "Dec 2", historicalMin: 37, historicalMax: 51, historicalAvg: 44, actualTemp: 50 },
  { date: "2024-12-03", displayDate: "Dec 3", historicalMin: 36, historicalMax: 50, historicalAvg: 43, actualTemp: 52 },
  { date: "2024-12-04", displayDate: "Dec 4", historicalMin: 35, historicalMax: 49, historicalAvg: 42, actualTemp: 49 },
  { date: "2024-12-05", displayDate: "Dec 5", historicalMin: 35, historicalMax: 48, historicalAvg: 42, actualTemp: 51 },
  { date: "2024-12-06", displayDate: "Dec 6", historicalMin: 34, historicalMax: 48, historicalAvg: 41, actualTemp: 52, isToday: true },
  { date: "2024-12-07", displayDate: "Dec 7", historicalMin: 34, historicalMax: 47, historicalAvg: 41, forecastTemp: 54 },
  { date: "2024-12-08", displayDate: "Dec 8", historicalMin: 33, historicalMax: 47, historicalAvg: 40, forecastTemp: 58 },
  { date: "2024-12-09", displayDate: "Dec 9", historicalMin: 33, historicalMax: 46, historicalAvg: 40, forecastTemp: 55 },
  { date: "2024-12-10", displayDate: "Dec 10", historicalMin: 32, historicalMax: 46, historicalAvg: 39, forecastTemp: 48 },
  { date: "2024-12-11", displayDate: "Dec 11", historicalMin: 32, historicalMax: 45, historicalAvg: 39, forecastTemp: 46 },
  { date: "2024-12-12", displayDate: "Dec 12", historicalMin: 31, historicalMax: 45, historicalAvg: 38, forecastTemp: 44 },
];

export default function TemperatureChartExample() {
  return (
    <div className="w-full max-w-4xl">
      <TemperatureChart data={mockChartData} unit="F" />
    </div>
  );
}
