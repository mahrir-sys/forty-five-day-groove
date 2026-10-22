import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timezone = z
  .string()
  .min(1)
  .max(64)
  .refine((tz) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }, "Invalid time zone");

const deviceAuth = z.object({ deviceId: z.string().uuid(), secret: z.string().min(32).max(128) });

const snapshot = z.object({
  timezone,
  startDate: isoDate.nullable(),
  challengeCount: z.number().int().min(0).max(500),
  checkedDates: z.array(isoDate).max(60),
});

const subscription = z.object({
  endpoint: z.string().url().max(1000).startsWith("https://"),
  keys: z.object({ p256dh: z.string().min(10).max(200), auth: z.string().min(8).max(100) }),
});

/** Public key the phone needs to subscribe to evening reminders. */
export const getReminderKey = createServerFn({ method: "GET" }).handler(async () => {
  const { getPushKeys } = await import("./push.server");
  const { publicKey } = await getPushKeys();
  return { publicKey };
});

/** Register (or re-register) this phone for evening reminders. */
export const saveReminderDevice = createServerFn({ method: "POST" })
  .validator((input: unknown) => deviceAuth.merge(snapshot).extend({ subscription }).parse(input))
  .handler(async ({ data }) => {
    const { getAdmin, hashSecret } = await import("./push.server");
    const db = await getAdmin();
    const secretHash = await hashSecret(data.secret);

    const { data: existing } = await db.from("push_devices").select("secret_hash").eq("id", data.deviceId).maybeSingle();
    if (existing && existing.secret_hash !== secretHash) throw new Error("Forbidden");

    // The same phone subscribing again under a new id replaces its old row.
    await db.from("push_devices").delete().eq("endpoint", data.subscription.endpoint).neq("id", data.deviceId);

    const { error } = await db.from("push_devices").upsert({
      id: data.deviceId,
      secret_hash: secretHash,
      endpoint: data.subscription.endpoint,
      p256dh: data.subscription.keys.p256dh,
      auth: data.subscription.keys.auth,
      timezone: data.timezone,
      start_date: data.startDate,
      challenge_count: data.challengeCount,
      checked_dates: data.checkedDates,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Could not save reminder: ${error.message}`);
    return { ok: true };
  });

/** Keep the server's view of today's progress up to date. */
export const syncReminderDevice = createServerFn({ method: "POST" })
  .validator((input: unknown) => deviceAuth.merge(snapshot).parse(input))
  .handler(async ({ data }) => {
    const { getAdmin, hashSecret } = await import("./push.server");
    const db = await getAdmin();
    const { data: rows, error } = await db
      .from("push_devices")
      .update({
        timezone: data.timezone,
        start_date: data.startDate,
        challenge_count: data.challengeCount,
        checked_dates: data.checkedDates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.deviceId)
      .eq("secret_hash", await hashSecret(data.secret))
      .select("id");
    if (error) throw new Error(`Could not sync reminder: ${error.message}`);
    return { found: (rows ?? []).length > 0 };
  });

export const removeReminderDevice = createServerFn({ method: "POST" })
  .validator((input: unknown) => deviceAuth.parse(input))
  .handler(async ({ data }) => {
    const { getAdmin, hashSecret } = await import("./push.server");
    const db = await getAdmin();
    await db.from("push_devices").delete().eq("id", data.deviceId).eq("secret_hash", await hashSecret(data.secret));
    return { ok: true };
  });

/** Send a test notification right away to this phone. */
export const sendTestReminder = createServerFn({ method: "POST" })
  .validator((input: unknown) => deviceAuth.parse(input))
  .handler(async ({ data }) => {
    const { getAdmin, hashSecret, getPushKeys, sendPush } = await import("./push.server");
    const db = await getAdmin();
    const { data: device } = await db
      .from("push_devices")
      .select("id, endpoint, p256dh, auth")
      .eq("id", data.deviceId)
      .eq("secret_hash", await hashSecret(data.secret))
      .maybeSingle();
    if (!device) return { ok: false, reason: "not-registered" as const };
    const { privateJwk } = await getPushKeys();
    const result = await sendPush(privateJwk, device, {
      title: "Test notification from 45 days",
      body: "Det fungerar! Så här ser kvällspåminnelsen ut.",
      tag: "test",
    });
    if (result.gone) await db.from("push_devices").delete().eq("id", device.id);
    return result.ok
      ? { ok: true as const }
      : { ok: false, reason: result.gone ? ("not-registered" as const) : ("failed" as const) };
  });
