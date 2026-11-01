import { useLanguage } from "@/hooks/use-language";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { AppState } from "@/lib/challenge";
import { reminderSnapshot } from "@/lib/reminder";
import {
  disableReminders,
  enableReminders,
  getReminderStatus,
  sendTest,
  syncReminders,
  type ReminderStatus,
} from "@/lib/push-reminders";

/** Evening reminder state for this phone, kept in sync with the challenge progress. */
export function useReminders(state: AppState) {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<ReminderStatus>("loading");
  const [busy, setBusy] = useState(false);
  const snapshot = useMemo(() => reminderSnapshot(state, language), [state, language]);
  const snapshotKey = JSON.stringify(snapshot);

  const refresh = useCallback(async () => {
    try {
      setStatus(await getReminderStatus());
    } catch {
      setStatus("off");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onVisible = () => document.visibilityState === "visible" && void refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  useEffect(() => {
    if (status !== "on") return;
    const timer = window.setTimeout(() => {
      syncReminders(JSON.parse(snapshotKey)).catch((e) => console.error("Reminder sync failed", e));
    }, 800);
    return () => window.clearTimeout(timer);
  }, [snapshotKey, status]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      console.error(e);
      toast.error(t("Något gick fel. Kontrollera att du har internet och försök igen."));
    } finally {
      setBusy(false);
    }
  };

  const enable = () =>
    run(async () => {
      const next = await enableReminders(snapshot);
      setStatus(next);
      if (next === "on") toast.success(t("Kvällspåminnelsen är på"));
      else if (next === "blocked") toast.error(t("Notiser är blockerade. Följ guiden för att tillåta dem."));
    });

  const disable = () =>
    run(async () => {
      await disableReminders();
      setStatus("off");
      toast(t("Kvällspåminnelsen är avstängd"));
    });

  const test = () =>
    run(async () => {
      const result = await sendTest();
      if (result === "ok") toast.success(t("Testnotis skickad. Den bör synas inom några sekunder."));
      else if (result === "not-registered") {
        setStatus("off");
        toast.error(t("Telefonen är inte längre kopplad. Slå på påminnelsen igen."));
      } else toast.error(t("Testnotisen kunde inte skickas. Försök igen om en stund."));
    });

  return { status, busy, enable, disable, test, refresh };
}

export type RemindersApi = ReturnType<typeof useReminders>;
