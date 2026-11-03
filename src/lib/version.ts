import { APP_BUILD } from "./build-info";

/** Single source of truth for the running bundle's version. */
export const APP_VERSION = APP_BUILD;

/** Pure: an update is needed only when the server reports a different, non-empty version. */
export function needsUpdate(current: string, remote: unknown): remote is string {
  return typeof remote === "string" && remote.length > 0 && remote !== current;
}

const RELOAD_KEY = "45days:update-reload";
let checking = false;

/** Fetches the deployed version and reloads once if it differs. Network failures are ignored (offline-safe). */
export async function checkForUpdate() {
  if (checking || import.meta.env.DEV || typeof window === "undefined" || !navigator.onLine) return;
  checking = true;
  try {
    const res = await fetch(`/api/public/version?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return;
    const { version } = (await res.json()) as { version?: unknown };
    if (!needsUpdate(APP_VERSION, version)) { sessionStorage.removeItem(RELOAD_KEY); return; }
    // Avoid reload loops if the CDN still serves the old bundle for this version.
    if (sessionStorage.getItem(RELOAD_KEY) === version) return;
    sessionStorage.setItem(RELOAD_KEY, version);
    window.location.reload();
  } catch {
    /* offline or blocked: stay silent */
  } finally {
    checking = false;
  }
}
