import { CurrentWeather } from "../weather/CurrentWeather";

export default function CurrentWeatherExample() {
  return (
    <CurrentWeather
      location="Seattle, WA"
      temperature={52}
      feelsLike={48}
      deviation={6}
      unit="F"
      narrativeSummary="This week is running 6°F warmer than typical for early December. Expect continued above-average temperatures through Thursday."
      onLocationClick={() => console.log("Location clicked")}
    />
  );
}
