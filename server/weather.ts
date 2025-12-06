import { format, subDays, addDays, getDayOfYear, parseISO } from "date-fns";
import type { Location, ChartDataPoint, DailyForecast, WeatherResponse } from "@shared/schema";

const OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_ARCHIVE = "https://archive-api.open-meteo.com/v1/archive";
const OPEN_METEO_GEOCODING = "https://geocoding-api.open-meteo.com/v1/search";

interface ForecastResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
  };
}

interface ArchiveResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    temperature_2m_mean: number[];
  };
}

interface GeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    country: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }>;
}

// Search for locations by name
export async function searchLocations(query: string): Promise<Location[]> {
  const url = `${OPEN_METEO_GEOCODING}?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status}`);
  }
  
  const data: GeocodingResponse = await response.json();
  
  if (!data.results) {
    return [];
  }
  
  return data.results.map((r) => ({
    id: r.id.toString(),
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

// Fetch current weather and 7-day forecast
async function fetchForecast(lat: number, lon: number): Promise<ForecastResponse> {
  const url = `${OPEN_METEO_FORECAST}?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Forecast API error: ${response.status}`);
  }
  
  return response.json();
}

// Fetch historical data for computing normals
async function fetchHistoricalData(lat: number, lon: number, startDate: string, endDate: string): Promise<ArchiveResponse> {
  const url = `${OPEN_METEO_ARCHIVE}?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Archive API error: ${response.status}`);
  }
  
  return response.json();
}

// Calculate historical normals for a range of dates
async function calculateHistoricalNormals(
  lat: number,
  lon: number,
  dates: Date[]
): Promise<Map<string, { avg: number; min: number; max: number; recordHighYear?: number; recordLowYear?: number }>> {
  const normals = new Map<string, { avg: number; min: number; max: number; recordHighYear?: number; recordLowYear?: number }>();
  
  // Get 30 years of historical data (1993-2022)
  const yearsToFetch = 30;
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - yearsToFetch;
  
  // Group dates by month-day for fetching
  const monthDays = new Set<string>();
  dates.forEach(date => {
    monthDays.add(format(date, "MM-dd"));
  });
  
  // Fetch historical data in chunks to avoid API limits
  const allHistoricalData: { date: string; max: number; min: number; mean: number }[] = [];
  
  for (let year = startYear; year < currentYear; year++) {
    // Fetch one month around the dates we need
    const minMonth = Math.min(...dates.map(d => d.getMonth()));
    const maxMonth = Math.max(...dates.map(d => d.getMonth()));
    
    const startDate = `${year}-${String(minMonth + 1).padStart(2, "0")}-01`;
    const endMonth = maxMonth + 1;
    const lastDay = new Date(year, endMonth, 0).getDate();
    const endDate = `${year}-${String(endMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    
    try {
      const data = await fetchHistoricalData(lat, lon, startDate, endDate);
      
      if (data.daily) {
        for (let i = 0; i < data.daily.time.length; i++) {
          allHistoricalData.push({
            date: data.daily.time[i],
            max: data.daily.temperature_2m_max[i],
            min: data.daily.temperature_2m_min[i],
            mean: data.daily.temperature_2m_mean[i],
          });
        }
      }
    } catch (err) {
      console.error(`Failed to fetch historical data for ${year}:`, err);
    }
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Calculate normals for each date
  for (const date of dates) {
    const monthDay = format(date, "MM-dd");
    const matchingDays = allHistoricalData.filter(d => d.date.endsWith(monthDay));
    
    if (matchingDays.length > 0) {
      const avgTemp = matchingDays.reduce((sum, d) => sum + d.mean, 0) / matchingDays.length;
      
      // Find record high and low
      let recordHigh = { temp: -Infinity, year: 0 };
      let recordLow = { temp: Infinity, year: 0 };
      
      for (const day of matchingDays) {
        const year = parseInt(day.date.substring(0, 4));
        if (day.max > recordHigh.temp) {
          recordHigh = { temp: day.max, year };
        }
        if (day.min < recordLow.temp) {
          recordLow = { temp: day.min, year };
        }
      }
      
      normals.set(format(date, "yyyy-MM-dd"), {
        avg: avgTemp,
        min: recordLow.temp,
        max: recordHigh.temp,
        recordHighYear: recordHigh.year,
        recordLowYear: recordLow.year,
      });
    }
  }
  
  return normals;
}

// Fetch past week's actual temperatures
async function fetchPastWeekActuals(lat: number, lon: number): Promise<Map<string, number>> {
  const actuals = new Map<string, number>();
  const today = new Date();
  const weekAgo = subDays(today, 7);
  
  const startDate = format(weekAgo, "yyyy-MM-dd");
  const endDate = format(subDays(today, 1), "yyyy-MM-dd");
  
  try {
    const data = await fetchHistoricalData(lat, lon, startDate, endDate);
    
    if (data.daily) {
      for (let i = 0; i < data.daily.time.length; i++) {
        // Use mean temperature as the "actual"
        actuals.set(data.daily.time[i], data.daily.temperature_2m_mean[i]);
      }
    }
  } catch (err) {
    console.error("Failed to fetch past week data:", err);
  }
  
  return actuals;
}

// Generate narrative summary
function generateNarrativeSummary(deviation: number): string {
  const today = new Date();
  const month = format(today, "MMMM");
  const dayOfMonth = today.getDate();
  
  let timeDescriptor: string;
  if (dayOfMonth <= 10) {
    timeDescriptor = `early ${month}`;
  } else if (dayOfMonth <= 20) {
    timeDescriptor = `mid-${month}`;
  } else {
    timeDescriptor = `late ${month}`;
  }
  
  const absDeviation = Math.abs(deviation);
  const direction = deviation > 0 ? "warmer" : "cooler";
  const intensity = absDeviation > 10 ? "significantly" : absDeviation > 5 ? "noticeably" : "slightly";
  
  return `This week is running ${intensity} ${direction} than typical for ${timeDescriptor}, about ${absDeviation}°C ${deviation > 0 ? "above" : "below"} average. Expect ${deviation > 0 ? "above" : "below"}-average temperatures through the week.`;
}

// Get complete weather data for a location
export async function getWeatherData(lat: number, lon: number, locationName: string, country: string): Promise<WeatherResponse> {
  const today = new Date();
  
  // Generate date range: past 5 days + today + next 6 days = 12 days
  const dates: Date[] = [];
  for (let i = -5; i <= 6; i++) {
    dates.push(addDays(today, i));
  }
  
  // Fetch all data in parallel where possible
  const [forecast, pastWeekActuals, historicalNormals] = await Promise.all([
    fetchForecast(lat, lon),
    fetchPastWeekActuals(lat, lon),
    calculateHistoricalNormals(lat, lon, dates),
  ]);
  
  // Build chart data
  const chartData: ChartDataPoint[] = dates.map((date, index) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const displayDate = format(date, "MMM d");
    const isToday = index === 5; // 5 days ago means index 5 is today
    const isPast = index < 5;
    
    const normal = historicalNormals.get(dateStr) || { avg: 0, min: 0, max: 0 };
    
    // Get actual temp from past data or current
    let actualTemp: number | undefined;
    if (isPast) {
      actualTemp = pastWeekActuals.get(dateStr);
    } else if (isToday) {
      actualTemp = forecast.current.temperature_2m;
    }
    
    // Get forecast temp for future days
    let forecastTemp: number | undefined;
    if (!isPast && !isToday) {
      const forecastIndex = forecast.daily.time.indexOf(dateStr);
      if (forecastIndex >= 0) {
        forecastTemp = (forecast.daily.temperature_2m_max[forecastIndex] + forecast.daily.temperature_2m_min[forecastIndex]) / 2;
      }
    }
    
    return {
      date: dateStr,
      displayDate,
      historicalMin: normal.min,
      historicalMax: normal.max,
      historicalAvg: normal.avg,
      recordHighYear: normal.recordHighYear,
      recordLowYear: normal.recordLowYear,
      actualTemp,
      forecastTemp,
      isToday,
    };
  });
  
  // Build daily forecast (today + next 2 days)
  const dailyForecast: DailyForecast[] = [];
  const dayLabels = ["Today", "Tomorrow"];
  
  for (let i = 0; i < 3; i++) {
    if (i >= forecast.daily.time.length) break;
    
    const date = parseISO(forecast.daily.time[i]);
    const dateStr = forecast.daily.time[i];
    const normal = historicalNormals.get(dateStr);
    const avgTemp = (forecast.daily.temperature_2m_max[i] + forecast.daily.temperature_2m_min[i]) / 2;
    const deviation = normal ? avgTemp - normal.avg : 0;
    
    dailyForecast.push({
      dayLabel: i < 2 ? dayLabels[i] : format(date, "EEEE"),
      temperature: avgTemp,
      high: forecast.daily.temperature_2m_max[i],
      low: forecast.daily.temperature_2m_min[i],
      deviation: Math.round(deviation),
      precipitationProbability: forecast.daily.precipitation_probability_max[i] || 0,
      isToday: i === 0,
    });
  }
  
  // Calculate overall deviation
  const todayNormal = historicalNormals.get(format(today, "yyyy-MM-dd"));
  const currentDeviation = todayNormal ? forecast.current.temperature_2m - todayNormal.avg : 0;
  
  return {
    location: {
      id: `${lat},${lon}`,
      name: locationName,
      country,
      latitude: lat,
      longitude: lon,
    },
    currentTemp: forecast.current.temperature_2m,
    feelsLike: forecast.current.apparent_temperature,
    deviation: Math.round(currentDeviation),
    narrativeSummary: generateNarrativeSummary(Math.round(currentDeviation)),
    chartData,
    dailyForecast,
  };
}
