import { AlertTriangle } from "lucide-react";
import Button from "./ui/Button.jsx";

export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="border-2 border-foreground bg-bauhaus-red p-4 text-white shadow-bauhaus lg:border-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0" strokeWidth={2.5} />
        <div className="flex-1">
          <p className="font-bold uppercase tracking-wide">Something went wrong</p>
          <p className="mt-1 font-medium text-white/90">{message}</p>
          {onRetry && (
            <Button
              variant="yellow"
              shape="square"
              onClick={onRetry}
              className="mt-4 !px-4 !py-2 text-xs"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
