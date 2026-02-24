import { useEffect, useState } from "react";

/**
 * Dev-only hook: Shows skeletons when ?devSkeletons=true is in URL
 * Use for testing skeleton UI without waiting for AI responses
 */
export function useDevSkeletonPreview(): boolean {
  const [showSkeletons, setShowSkeletons] = useState(false);

  useEffect(() => {
    // Only in development
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const preview = params.get("devSkeletons") === "true";

    if (preview) {
      console.log("[DEV] Skeleton preview enabled via ?devSkeletons=true");
    }

    setShowSkeletons(preview);
  }, []);

  return showSkeletons;
}
