import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { localDateHour, shouldRemind, shouldRemindLunch, reminderMessage } from "@/lib/reminder";

import { resolveLanguage } from "@/lib/i18n";

// Called every hour by a scheduled job. Sends the evening reminder to phones where
// at least one challenge remains today (see shouldRemind for the exact rule).
export const Route = createFileRoute("/api/public/jobs/evening-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;

        const { getAdmin, getPushKeys, sendPush } = await import("@/lib/push.server");
        const db = await getAdmin();
        const { data: devices, error } = await db
          .from("push_devices")
          .select("id, endpoint, p256dh, auth, timezone, start_date, challenge_count, checked_dates, completed_dates, last_reminded_on, last_lunch_reminded_on, language, first_name")
          .not("start_date", "is", null)
          .gt("challenge_count", 0);
        if (error) return Response.json({ error: error.message }, { status: 500 });

        const now = new Date();
        const due = (devices ?? [])
          .map((d) => ({ d, local: localDateHour(now, d.timezone) }))
          .filter(({ d, local }) =>
            (local.hour === 12 ? shouldRemindLunch : shouldRemind)(
              {
                startDate: d.start_date,
                challengeCount: d.challenge_count,
                checkedDates: d.checked_dates ?? [],
                completedDates: d.completed_dates,
                lastRemindedOn: d.last_reminded_on,
                lastLunchRemindedOn: d.last_lunch_reminded_on,
              },
              local,
            ),
          );
        if (due.length === 0) return Response.json({ sent: 0, failed: 0 });

        const { privateJwk } = await getPushKeys();
        let sent = 0;
        let failed = 0;
        // At most 6 outgoing requests at a time.
        for (let i = 0; i < due.length; i += 6) {
          await Promise.all(
            due.slice(i, i + 6).map(async ({ d, local }) => {
              const kind = local.hour === 12 ? 'lunch' : 'evening';
              const result = await sendPush(privateJwk, d, reminderMessage(kind,local.date,resolveLanguage(d.language),d.first_name));
              if (result.ok) {
                sent++;
                await db.from("push_devices").update(kind === 'lunch' ? {last_lunch_reminded_on:local.date} : { last_reminded_on: local.date }).eq("id", d.id);
              } else {
                failed++;
                if (result.gone) await db.from("push_devices").delete().eq("id", d.id);
              }
            }),
          );
        }
        return Response.json({ sent, failed });
      },
    },
  },
});
