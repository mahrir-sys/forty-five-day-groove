import { useCallback, useEffect, useState } from "react";
import { emptyState, toISODate, type AppState } from "@/lib/challenge";

const STORAGE_KEY = "utmaning45:v1";

function load(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      startDate: parsed.startDate ?? null,
      challenges: parsed.challenges ?? [],
      log: parsed.log ?? {},
    };
  } catch {
    return emptyState;
  }
}

/** Challenge state persisted in this browser's localStorage. */
export function useChallengeStore() {
  const [state, setState] = useState<AppState>(emptyState);
  const [loaded, setLoaded] = useState(false);
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setState(load());
    setLoaded(true);
    const refresh = () => setToday(toISODate(new Date()));
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);

  return { state, update, ready: loaded && today !== null, today: today ?? "" };
}
