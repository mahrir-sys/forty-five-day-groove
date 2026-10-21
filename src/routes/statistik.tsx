import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Flame, Trophy } from "lucide-react";
import { useChallengeStore } from "@/hooks/use-challenge-store";
import { computeChallengeStats, computeStats, TOTAL_DAYS } from "@/lib/challenge";

export const Route = createFileRoute("/statistik")({
  head: () => ({
    meta: [
      { title: "Statistik – 45 dagar" },
      { name: "description", content: "Se hur det går för varje utmaning: avbockade dagar, procent och streaks." },
      { property: "og:title", content: "Statistik – 45 dagar" },
      { property: "og:description", content: "Avbockade dagar, procent och streaks per utmaning." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const { state, ready, today } = useChallengeStore();
  if (!ready) return <div className="min-h-screen bg-background" />;

  const overall = computeStats(state, today);
  const items = computeChallengeStats(state, today);

  return (
    <div className="bg-glow min-h-screen">
      <main className="mx-auto max-w-md px-5 pb-16 pt-6">
        <header className="flex items-center gap-2">
          <Link
            to="/"
            aria-label="Tillbaka"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">Statistik</h1>
        </header>

        {!state.startDate ? (
          <p className="mt-6 rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
            Starta en period för att se statistik.
          </p>
        ) : (
          <>
            <section className="mt-5 grid grid-cols-3 gap-2">
              <Box label="Dag" value={`${overall.currentDay}/${TOTAL_DAYS}`} />
              <Box label="Hela dagar" value={String(overall.completedDays)} />
              <Box label="Totalt" value={`${overall.percent}%`} />
            </section>

            <section className="mt-8 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Per utmaning
              </h2>
              {items.length === 0 && (
                <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
                  Inga utmaningar än.
                </p>
              )}
              {items.map((c) => (
                <article key={c.id} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-bold">{c.name}</h3>
                    <span className="font-display text-2xl font-extrabold tabular-nums text-primary">
                      {c.percent}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{c.checkedDays}</span> av {TOTAL_DAYS} dagar
                    avbockade
                    {c.elapsedDays < TOTAL_DAYS && ` · ${c.elapsedDays} dagar har gått`}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="bg-flame h-full rounded-full transition-all duration-500"
                      style={{ width: `${(c.checkedDays / TOTAL_DAYS) * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 flex gap-5 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Flame className="size-4 text-primary" />
                      Nuvarande streak <b className="tabular-nums">{c.currentStreak}</b>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Trophy className="size-4 text-primary" />
                      Bästa <b className="tabular-nums">{c.bestStreak}</b>
                    </span>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
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
