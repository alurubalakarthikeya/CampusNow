import { useEffect, useState } from 'react';

/**
 * A clock that re-renders on an interval. `enabled: false` freezes it, so a
 * screen with nothing live pays no timer at all.
 */
export function useNow(intervalMs = 1000, enabled = true): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs]);

  return now;
}
