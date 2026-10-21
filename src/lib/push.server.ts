// Server-only helpers for evening reminder notifications. Import with `await import()` inside handlers.
import { buildPushHTTPRequest } from "@pushforge/builder";

export type StoredSubscription = { endpoint: string; p256dh: string; auth: string };

export async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function hashSecret(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return base64url(new Uint8Array(digest));
}

/** Sender keys, created once and kept in the database. */
export async function getPushKeys(): Promise<{ publicKey: string; privateJwk: JsonWebKey }> {
  const db = await getAdmin();
  const read = async () => {
    const { data, error } = await db.from("push_keys").select("public_key, private_jwk").eq("id", 1).maybeSingle();
    if (error) throw new Error(`Could not read push keys: ${error.message}`);
    return data ? { publicKey: data.public_key, privateJwk: data.private_jwk as JsonWebKey } : null;
  };
  const existing = await read();
  if (existing) return existing;

  const pair = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
    "sign",
    "verify",
  ])) as CryptoKeyPair;
  const privateJwk = (await crypto.subtle.exportKey("jwk", pair.privateKey)) as JsonWebKey;
  const raw = new Uint8Array((await crypto.subtle.exportKey("raw", pair.publicKey)) as ArrayBuffer);
  const { error } = await db
    .from("push_keys")
    .upsert(
      { id: 1, public_key: base64url(raw), private_jwk: JSON.parse(JSON.stringify(privateJwk)) },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (error) throw new Error(`Could not save push keys: ${error.message}`);
  const created = await read();
  if (!created) throw new Error("Push keys missing after creation");
  return created;
}

export type PushPayload = { title: string; body: string; url?: string; tag?: string };

/** Send one notification. `gone` means the phone no longer accepts notifications for this subscription. */
export async function sendPush(
  privateJwk: JsonWebKey,
  sub: StoredSubscription,
  payload: PushPayload,
): Promise<{ ok: boolean; gone: boolean; status: number; detail: string }> {
  const { endpoint, headers, body } = await buildPushHTTPRequest({
    privateJWK: privateJwk,
    subscription: { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
    message: {
      payload,
      adminContact: "https://forty-five-day-spark.lovable.app",
      options: { ttl: 3 * 3600, urgency: "high", topic: "evening-reminder" },
    },
  });
  const res = await fetch(endpoint, { method: "POST", headers, body });
  const detail = res.ok ? "" : await res.text().catch(() => "");
  if (!res.ok) console.error(`Push failed [${res.status}]: ${detail}`);
  return { ok: res.ok, gone: res.status === 404 || res.status === 410, status: res.status, detail };
}
