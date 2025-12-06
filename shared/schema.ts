import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, date, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Climate normals cache - stores historical averages for each day of year per location
export const climateNormals = pgTable("climate_normals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  dayOfYear: integer("day_of_year").notNull(), // 1-366
  avgTemp: real("avg_temp").notNull(), // in Celsius
  minTemp: real("min_temp").notNull(), // historical min for this day
  maxTemp: real("max_temp").notNull(), // historical max for this day
  recordHighYear: integer("record_high_year"),
  recordLowYear: integer("record_low_year"),
}, (table) => ({
  locationDayUnique: unique().on(table.latitude, table.longitude, table.dayOfYear),
}));

export const insertClimateNormalSchema = createInsertSchema(climateNormals).omit({ id: true });
export type InsertClimateNormal = z.infer<typeof insertClimateNormalSchema>;
export type ClimateNormal = typeof climateNormals.$inferSelect;

// Zod schemas for API validation
export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  admin1: z.string().optional(),
});

export type Location = z.infer<typeof locationSchema>;

export const weatherDataSchema = z.object({
  current: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    weatherCode: z.number(),
  }),
  daily: z.array(z.object({
    date: z.string(),
    tempMax: z.number(),
    tempMin: z.number(),
    precipitationProbability: z.number(),
    weatherCode: z.number(),
  })),
});

export type WeatherData = z.infer<typeof weatherDataSchema>;

export const chartDataPointSchema = z.object({
  date: z.string(),
  displayDate: z.string(),
  historicalMin: z.number(),
  historicalMax: z.number(),
  historicalAvg: z.number(),
  recordHighYear: z.number().optional(),
  recordLowYear: z.number().optional(),
  actualTemp: z.number().optional(),
  forecastTemp: z.number().optional(),
  isToday: z.boolean().optional(),
});

export type ChartDataPoint = z.infer<typeof chartDataPointSchema>;

export const dailyForecastSchema = z.object({
  dayLabel: z.string(),
  temperature: z.number(),
  high: z.number(),
  low: z.number(),
  deviation: z.number(),
  precipitationProbability: z.number(),
  isToday: z.boolean().optional(),
});

export type DailyForecast = z.infer<typeof dailyForecastSchema>;

export const weatherResponseSchema = z.object({
  location: locationSchema,
  currentTemp: z.number(),
  feelsLike: z.number(),
  deviation: z.number(),
  narrativeSummary: z.string(),
  chartData: z.array(chartDataPointSchema),
  dailyForecast: z.array(dailyForecastSchema),
});

export type WeatherResponse = z.infer<typeof weatherResponseSchema>;
