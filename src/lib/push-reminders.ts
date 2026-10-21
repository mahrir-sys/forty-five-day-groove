// Browser side of evening reminders: permission, phone subscription and keeping the server in sync.
// Call only from effects or event handlers.
import {
  getReminderKey,
  removeReminderDevice,
  saveReminderDevice,
  sendTestReminder,
  syncReminderDevice,
} from "./push.functions";
import type { ReminderSnapshot } from "./reminder";

const DEVICE_KEY = "utmaning45:reminder-device";
const SW_URL = "/push-sw.js";

export type ReminderStatus = "loading" | "unsupported" | "in-preview" | "blocked" | "off" | "on";

type Device = { deviceId: string; secret: string };

function readDevice(): Device | null {
  try {
    const raw = window.localStorage.getItem(DEVICE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Device>) : null;
    return parsed?.deviceId && parsed.secret ? { deviceId: parsed.deviceId, secret: parsed.secret } : null;
  } catch {
    return null;
  }
}

function newDevice(): Device {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const secret = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return { deviceId: crypto.randomUUID(), secret };
}

const timezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Stockholm";

function inFrame(): boolean {
  try {
    return window.top !== window.self;
  } catch {
    return true;
  }
}

function supported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const b64 = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function sameKey(a: ArrayBuffer | null | undefined, b: Uint8Array): boolean {
  if (!a) return false;
  const x = new Uint8Array(a);
  return x.length === b.length && x.every((v, i) => v === b[i]);
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.getRegistration("/");
  return (await reg?.pushManager.getSubscription()) ?? null;
}

export async function getReminderStatus(): Promise<ReminderStatus> {
  if (inFrame()) return "in-preview";
  if (!supported()) return "unsupported";
  if (Notification.permission === "denied") return "blocked";
  if (Notification.permission !== "granted" || !readDevice()) return "off";
  return (await currentSubscription()) ? "on" : "off";
}

async function register(snapshot: ReminderSnapshot): Promise<void> {
  await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  const reg = await navigator.serviceWorker.ready;
  const { publicKey } = await getReminderKey();
  const key = keyBytes(publicKey);
  let sub = await reg.pushManager.getSubscription();
  if (sub && !sameKey(sub.options.applicationServerKey, key)) {
    await sub.unsubscribe();
    sub = null;
  }
  sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  const json = sub.toJSON();
  const device = readDevice() ?? newDevice();
  await saveReminderDevice({
    data: {
      ...device,
      ...snapshot,
      timezone: timezone(),
      subscription: { endpoint: json.endpoint ?? sub.endpoint, keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" } },
    },
  });
  window.localStorage.setItem(DEVICE_KEY, JSON.stringify(device));
}

/** Ask for permission (must run from a tap) and turn on evening reminders. */
export async function enableReminders(snapshot: ReminderSnapshot): Promise<ReminderStatus> {
  if (inFrame()) return "in-preview";
  if (!supported()) return "unsupported";
  const permission = await Notification.requestPermission();
  if (permission === "denied") return "blocked";
  if (permission !== "granted") return "off";
  await register(snapshot);
  return "on";
}

export async function disableReminders(): Promise<void> {
  const device = readDevice();
  const sub = await currentSubscription().catch(() => null);
  await sub?.unsubscribe().catch(() => false);
  if (device) await removeReminderDevice({ data: device }).catch(() => undefined);
  window.localStorage.removeItem(DEVICE_KEY);
}

/** Tell the server what is checked off, so it knows whether to remind tonight. */
export async function syncReminders(snapshot: ReminderSnapshot): Promise<void> {
  const device = readDevice();
  if (!device) return;
  const { found } = await syncReminderDevice({ data: { ...device, ...snapshot, timezone: timezone() } });
  if (!found && Notification.permission === "granted") await register(snapshot);
}

export async function sendTest(): Promise<"ok" | "not-registered" | "failed"> {
  const device = readDevice();
  if (!device) return "not-registered";
  const result = await sendTestReminder({ data: device });
  return result.ok ? "ok" : result.reason;
}
