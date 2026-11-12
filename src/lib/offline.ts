// Single registrar for the offline app worker (/sw.js). Refuses dev, iframes and Lovable previews.
const PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;

export function offlineAllowed(): boolean {
  if (!import.meta.env.PROD || typeof window === "undefined") return false;
  try { if (window.top !== window.self) return false; } catch { return false; }
  if (new URLSearchParams(window.location.search).get("sw") === "off") return false;
  const h = window.location.hostname.toLowerCase();
  const label = h.split(".")[0];
  for (const d of ["lovable.app", "gpt-eng.com", "gptengineer.run"]) {
    if (h.endsWith("." + d) && (PREVIEW_LABEL.test(label) || /^project--.+-dev$/.test(label))) return false;
  }
  for (const d of ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"]) {
    if (h === d || h.endsWith("." + d)) return false;
  }
  return true;
}

/** Worker the reminders should register: the offline worker includes push handling. */
export const workerUrl = () => (offlineAllowed() ? "/sw.js" : "/push-sw.js");

export async function setupOffline(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (offlineAllowed()) {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    return;
  }
  const regs = await navigator.serviceWorker.getRegistrations().catch(() => []);
  await Promise.all(regs.filter((r) => r.active?.scriptURL.endsWith("/sw.js")).map((r) => r.unregister()));
}
