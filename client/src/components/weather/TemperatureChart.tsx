import {
  ComposedChart,
  Area,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

interface ChartDataPoint {
  date: string;
  displayDate: string;
  historicalMin: number;
  historicalMax: number;
  historicalAvg: number;
  recordHighYear?: number;
  recordLowYear?: number;
  actualTemp?: number;
  actualHigh?: number;
  actualLow?: number;
  forecastTemp?: number;
  forecastHigh?: number;
  forecastLow?: number;
  isToday?: boolean;
}

interface TemperatureChartProps {
  data: ChartDataPoint[];
  unit: "F" | "C";
}

// Custom shape for rendering vertical range lines (actual - solid)
function ActualRangeLine({ cx, cy, payload, yAxis }: any) {
  if (payload.actualHigh === undefined || payload.actualLow === undefined) return null;
  const yHigh = yAxis.scale(payload.actualHigh);
  const yLow = yAxis.scale(payload.actualLow);
  return (
    <line
      x1={cx}
      y1={yHigh}
      x2={cx}
      y2={yLow}
      stroke="hsl(var(--foreground))"
      strokeWidth={2.5}
    />
  );
}

// Custom shape for rendering vertical range lines (forecast - dashed)
function ForecastRangeLine({ cx, cy, payload, yAxis }: any) {
  if (payload.forecastHigh === undefined || payload.forecastLow === undefined) return null;
  const yHigh = yAxis.scale(payload.forecastHigh);
  const yLow = yAxis.scale(payload.forecastLow);
  return (
    <line
      x1={cx}
      y1={yHigh}
      x2={cx}
      y2={yLow}
      stroke="hsl(var(--foreground))"
      strokeWidth={2.5}
      strokeDasharray="3 3"
    />
  );
}

export function TemperatureChart({ data, unit }: TemperatureChartProps) {
  const todayIndex = data.findIndex((d) => d.isToday);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = data.find((d) => d.displayDate === label);
      const actualOrForecast = payload.find(
        (p: any) => p.dataKey === "actualTemp" || p.dataKey === "forecastTemp"
      );
      const historicalAvg = payload.find((p: any) => p.dataKey === "historicalAvg");

      return (
        <div className="bg-popover border border-popover-border rounded-md p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          {actualOrForecast && (
            <p className="text-sm">
              <span className="text-foreground font-medium">
                {actualOrForecast.dataKey === "actualTemp" ? "Actual" : "Forecast"}:{" "}
              </span>
              <span className="tabular-nums font-semibold">
                {Math.round(actualOrForecast.value)}°{unit}
              </span>
            </p>
          )}
          {historicalAvg && (
            <p className="text-sm text-muted-foreground">
              Historical avg: {Math.round(historicalAvg.value)}°{unit}
            </p>
          )}
          {dataPoint && (
            <div className="mt-2 pt-2 border-t border-popover-border space-y-1">
              <p className="text-sm text-temp-warm">
                Record high: {Math.round(dataPoint.historicalMax)}°{unit}
                {dataPoint.recordHighYear && (
                  <span className="text-muted-foreground ml-1">({dataPoint.recordHighYear})</span>
                )}
              </p>
              <p className="text-sm text-temp-cold">
                Record low: {Math.round(dataPoint.historicalMin)}°{unit}
                {dataPoint.recordLowYear && (
                  <span className="text-muted-foreground ml-1">({dataPoint.recordLowYear})</span>
                )}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 md:p-8" data-testid="chart-temperature">
      <h3 className="text-lg font-medium mb-6">Temperature vs. Historical Normal</h3>
      <div className="w-full" style={{ height: "320px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}°`}
              className="text-muted-foreground"
              domain={[(dataMin: number) => Math.floor(dataMin - 5), (dataMax: number) => Math.ceil(dataMax + 5)]}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Line
              type="monotone"
              dataKey="historicalAvg"
              stroke="hsl(var(--temp-avg))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Historical Avg"
            />

            <Scatter
              dataKey="historicalMax"
              fill="hsl(var(--temp-warm))"
              shape="circle"
              name="Record High"
            />

            <Scatter
              dataKey="historicalMin"
              fill="hsl(var(--temp-cold))"
              shape="circle"
              name="Record Low"
            />

            {/* Range lines rendered before dots so they appear behind */}
            <Scatter
              dataKey="actualTemp"
              shape={<ActualRangeLine />}
              legendType="none"
            />
            <Scatter
              dataKey="forecastTemp"
              shape={<ForecastRangeLine />}
              legendType="none"
            />

            <Line
              type="monotone"
              dataKey="actualTemp"
              stroke="hsl(var(--foreground))"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "hsl(var(--background))", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name="Actual"
              connectNulls={false}
            />

            <Line
              type="monotone"
              dataKey="forecastTemp"
              stroke="hsl(var(--foreground))"
              strokeWidth={2.5}
              strokeDasharray="3 3"
              dot={{ r: 4, fill: "hsl(var(--background))", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name="Forecast"
              connectNulls={false}
            />

            {todayIndex >= 0 && (
              <ReferenceLine
                x={data[todayIndex].displayDate}
                stroke="hsl(var(--primary))"
                strokeWidth={1}
                strokeDasharray="4 4"
                label={{
                  value: "Now",
                  position: "top",
                  fill: "hsl(var(--primary))",
                  fontSize: 12,
                }}
              />
            )}

            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value: string) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
