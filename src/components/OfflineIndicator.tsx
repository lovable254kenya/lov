import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className={cn(
        "w-full bg-amber-500 text-white py-1.5 px-4",
        "flex items-center justify-center gap-2 text-xs font-medium",
        "animate-fade-in"
      )}
    >
      <WifiOff className="h-4 w-4" />
      <span>You're offline. Showing cached content.</span>
    </div>
  );
};

/** Full-screen offline fallback for PWA when page fails to load */
export const OfflineFullScreen = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <WifiOff className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
        You're offline
      </p>
      <p className="text-xs text-muted-foreground">Please check your connection</p>
    </div>
  );
};
