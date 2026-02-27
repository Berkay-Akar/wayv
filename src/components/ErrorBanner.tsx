"use client";

import { Button } from "./Button";

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-6 py-4">
      <p className="text-sm text-red-300">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-3">
          Try again
        </Button>
      )}
    </div>
  );
}
