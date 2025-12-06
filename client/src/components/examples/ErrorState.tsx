import { ErrorState } from "../weather/ErrorState";

export default function ErrorStateExample() {
  return (
    <div className="w-full max-w-md">
      <ErrorState
        title="Failed to load weather data"
        message="We couldn't connect to the weather service. Please check your internet connection and try again."
        onRetry={() => console.log("Retry clicked")}
      />
    </div>
  );
}
