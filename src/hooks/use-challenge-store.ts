import { useCallback, useEffect, useState } from "react";
import { challengeDate, emptyState, type AppState } from "@/lib/challenge";
import { useChallengeNames } from "./use-language";

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
      reflections: parsed.reflections ?? {},
      firstName: typeof parsed.firstName === "string" ? parsed.firstName.trim().slice(0,60) : "",
    };
  } catch {
    return emptyState;
  }
}

/** Challenge state persisted in this browser's localStorage. */
export function useChallengeStore() {
  const [state, setState] = useState<AppState>(emptyState);
  useChallengeNames(state.challenges.map((challenge) => challenge.name));
  const [loaded, setLoaded] = useState(false);
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setState(load());
    setLoaded(true);
    const refresh = () => setToday(challengeDate(new Date()));
    refresh();
    const timer = window.setInterval(refresh, 1_000);
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
