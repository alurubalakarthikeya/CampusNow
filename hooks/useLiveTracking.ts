import { useEffect } from 'react';

import { useAppStore } from '@/stores/appStore';

/**
 * Drives the lifecycle of reports filed from this device.
 *
 * One interval for the whole app, and only while something is still moving.
 * Every transition is committed to the store, so the report feed, the
 * counters and the notification list all agree with the tracker.
 */
export function useLiveTracking() {
  const tracking = useAppStore((state) =>
    state.reports.some((report) => report.live && report.status !== 'resolved'),
  );
  const advanceLiveReports = useAppStore((state) => state.advanceLiveReports);

  useEffect(() => {
    if (!tracking) return;
    const id = setInterval(advanceLiveReports, 1000);
    return () => clearInterval(id);
  }, [advanceLiveReports, tracking]);

  // The very first tick is applied immediately so a fresh report is already
  // in the right stage on first paint.
  useEffect(() => {
    if (tracking) advanceLiveReports();
  }, [advanceLiveReports, tracking]);
}
