import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <Card className="p-6 text-center" data-testid="error-state">
      <div className="flex justify-center mb-4">
        <div className="p-3 rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          disabled={isRetrying}
          data-testid="button-retry"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "Retrying..." : "Try again"}
        </Button>
      )}
    </Card>
  );
}
