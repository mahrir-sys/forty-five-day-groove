import { RoutePanel } from "@/components/challenge/RoutePanel";
import { useLanguage } from "@/hooks/use-language";
import { createFileRoute } from "@tanstack/react-router";
import { Flame, Trophy } from "lucide-react";
import { useChallengeStore } from "@/hooks/use-challenge-store";
import { computeChallengeStats, computeStats, TOTAL_DAYS } from "@/lib/challenge";

export const Route = createFileRoute("/statistik")({
  head: () => ({
    meta: [
      { title: "Challenge statistics – 45 days" },
      { name: "description", content: "See completed days, percentages and streaks for each of your 45-day challenges." },
      { property: "og:title", content: "Challenge statistics – 45 days" },
      { property: "og:description", content: "Completed days, percentages and streaks for every challenge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const { t, challengeName } = useLanguage();
  const { state, ready, today } = useChallengeStore();
  if (!ready) return <RoutePanel title={t("Statistik")}>{null}</RoutePanel>;

  const overall = computeStats(state, today);
  const items = computeChallengeStats(state, today);

  return (
    <RoutePanel title={t("Statistik")}>

        {!state.startDate ? (
          <p className="mt-6 rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
            {t("Starta en period för att se statistik.")}
          </p>
        ) : (
          <>
            <section className="mt-5 grid grid-cols-3 gap-2">
              <Box label={t("Dag")} value={`${overall.currentDay}/${TOTAL_DAYS}`} />
              <Box label={t("Hela dagar")} value={String(overall.completedDays)} />
              <Box label={t("Totalt")} value={`${overall.percent}%`} />
            </section>

            <section className="mt-8 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {t("Per utmaning")}
              </h2>
              {items.length === 0 && (
                <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
                  {t("Inga utmaningar än.")}
                </p>
              )}
              {items.map((c, i) => (
                <article key={c.id} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="min-w-0 break-words text-lg font-bold"><span className="mr-2 text-primary tabular-nums">{i + 1}.</span>{challengeName(c.name)}</h3>
                    <span className="shrink-0 font-display text-2xl font-extrabold tabular-nums text-primary">
                      {c.percent}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("checkedDays", { checked: c.checkedDays, days: TOTAL_DAYS })}
                    {c.elapsedDays < TOTAL_DAYS && ` · ${t("elapsedDays", { days: c.elapsedDays })}`}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="bg-flame h-full rounded-full transition-all duration-500"
                      style={{ width: `${(c.checkedDays / TOTAL_DAYS) * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Flame className="size-4 text-primary" />
                      {t("Nuvarande streak")} <b className="tabular-nums">{c.currentStreak}</b>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Trophy className="size-4 text-primary" />
                      {t("Bästa")} <b className="tabular-nums">{c.bestStreak}</b>
                    </span>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
    </RoutePanel>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card px-3 py-3">
      <p className="font-display text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
