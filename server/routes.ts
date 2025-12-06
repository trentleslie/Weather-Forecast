import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchLocations, getWeatherData } from "./weather";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Geocoding - search for locations
  app.get("/api/locations/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        return res.json([]);
      }
      
      const locations = await searchLocations(query.trim());
      res.json(locations);
    } catch (error) {
      console.error("Location search error:", error);
      res.status(500).json({ error: "Failed to search locations" });
    }
  });

  // Get weather data for coordinates
  app.get("/api/weather", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      const name = (req.query.name as string) || "Unknown";
      const country = (req.query.country as string) || "";
      
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      
      const weatherData = await getWeatherData(lat, lon, name, country);
      res.json(weatherData);
    } catch (error) {
      console.error("Weather data error:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // Reverse geocoding - get location name from coordinates (for geolocation)
  app.get("/api/locations/reverse", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      
      // Use a simple reverse geocoding approach - search for nearby location
      // Open-Meteo doesn't have true reverse geocoding, so we return a generic response
      res.json({
        id: `${lat},${lon}`,
        name: "Current Location",
        country: "",
        latitude: lat,
        longitude: lon,
      });
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      res.status(500).json({ error: "Failed to reverse geocode" });
    }
  });

  return httpServer;
}
