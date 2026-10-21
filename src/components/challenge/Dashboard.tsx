import { useEffect, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Check, ChevronLeft, ChevronRight, Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addDays,
  computeStats,
  dayNumber,
  dayProgress,
  endDate,
  parseISODate,
  periodStatus,
  toggleCheck,
  TOTAL_DAYS,
  type AppState,
} from "@/lib/challenge";
import { DayGrid } from "./DayGrid";
import { ManageSheet } from "./ManageSheet";

type Props = {
  state: AppState;
  today: string;
  update: (fn: (s: AppState) => AppState) => void;
};

const fmt = (iso: string, pattern: string) => format(parseISODate(iso), pattern, { locale: sv });

export function Dashboard({ state, today, update }: Props) {
  const start = state.startDate!;
  const end = endDate(start);
  const status = periodStatus(start, today);
  const stats = computeStats(state, today);
  const lastSelectable = status === "finished" ? end : today;

  const [selected, setSelected] = useState(status === "upcoming" ? start : lastSelectable);
  useEffect(() => {
    setSelected(status === "upcoming" ? start : lastSelectable);
  }, [lastSelectable, start, status]);

  const selectedN = dayNumber(start, selected);
  const { done, total } = dayProgress(state, selected);
  const checked = new Set(state.log[selected] ?? []);
  const canCheck = status !== "upcoming" && selected <= today;
  const allDone = total > 0 && done === total;
  const daysLeft = dayNumber(today, start) - 1;

  const selectedLabel =
    selected === today ? "Idag" : selected === addDays(today, -1) ? "Igår" : fmt(selected, "EEEE d MMM");

  return (
    <div className="bg-glow min-h-screen">
      <main className="mx-auto max-w-md px-5 pb-16 pt-6">
        <header className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {TOTAL_DAYS} dagar
          </p>
          <ManageSheet
            challenges={state.challenges}
            onAdd={(name) =>
              update((s) => ({
                ...s,
                challenges: [...s.challenges, { id: crypto.randomUUID(), name }],
              }))
            }
            onRemove={(id) =>
              update((s) => ({ ...s, challenges: s.challenges.filter((c) => c.id !== id) }))
            }
            onRestart={() => update((s) => ({ ...s, startDate: today, log: {} }))}
            onReset={() => update(() => ({ startDate: null, challenges: [], log: {} }))}
          />
        </header>

        {/* Day counter */}
        <section className="mt-4">
          {status === "upcoming" ? (
            <>
              <p className="text-sm font-medium text-muted-foreground">Startar {fmt(start, "d MMMM")}</p>
              <h1 className="mt-1 text-7xl font-extrabold leading-none tracking-tight">
                <span className="text-flame">{daysLeft}</span>
                <span className="ml-2 text-3xl text-muted-foreground">
                  {daysLeft === 1 ? "dag kvar" : "dagar kvar"}
                </span>
              </h1>
            </>
          ) : status === "finished" ? (
            <div className="flex items-end gap-4">
              <Trophy className="mb-2 size-14 text-primary" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Perioden är avslutad</p>
                <h1 className="text-5xl font-extrabold leading-none tracking-tight">
                  <span className="text-flame">{stats.completedDays}</span>
                  <span className="text-2xl text-muted-foreground"> / {TOTAL_DAYS} hela dagar</span>
                </h1>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground">
                {fmt(start, "d MMM")} – {fmt(end, "d MMM")}
              </p>
              <h1 className="mt-1 flex items-baseline font-extrabold leading-none tracking-tight">
                <span className="mr-3 text-2xl text-muted-foreground">Dag</span>
                <span className="text-flame text-[7rem] leading-[0.85]">{stats.currentDay}</span>
                <span className="ml-2 text-3xl text-muted-foreground">/{TOTAL_DAYS}</span>
              </h1>
            </>
          )}
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="bg-flame h-full rounded-full transition-all duration-500"
              style={{ width: `${(stats.currentDay / TOTAL_DAYS) * 100}%` }}
            />
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid grid-cols-3 gap-2">
          <Stat label="Streak" value={stats.streak} icon={<Flame className="size-4 text-primary" />} />
          <Stat label="Hela dagar" value={stats.completedDays} />
          <Stat label="Missade" value={stats.missedDays} muted={stats.missedDays === 0} />
        </section>

        {/* Checklist */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelected(addDays(selected, -1))}
              disabled={selectedN <= 1}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
              aria-label="Föregående dag"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold capitalize">{selectedLabel}</h2>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Dag {Math.max(1, selectedN)} · {done}/{total} klara
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(addDays(selected, 1))}
              disabled={selected >= lastSelectable || status === "upcoming"}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
              aria-label="Nästa dag"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {total === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
              Inga utmaningar än. Lägg till via inställningarna uppe till höger.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {state.challenges.map((c) => {
                const isDone = checked.has(c.id);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      disabled={!canCheck}
                      onClick={() => update((s) => toggleCheck(s, selected, c.id))}
                      aria-pressed={isDone}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all active:scale-[0.99] disabled:opacity-50",
                        isDone ? "border-primary/60 bg-primary/10" : "bg-card hover:border-muted-foreground/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                          isDone ? "animate-pop bg-flame border-transparent text-primary-foreground" : "border-muted-foreground/40",
                        )}
                      >
                        {isDone && <Check className="size-4" strokeWidth={3} />}
                      </span>
                      <span className={cn("flex-1 text-base font-semibold", isDone && "text-muted-foreground line-through decoration-primary/60")}>
                        {c.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {allDone && canCheck && (
            <p className="animate-pop mt-4 rounded-2xl bg-flame p-4 text-center font-display text-lg font-bold text-primary-foreground shadow-glow">
              {selected === today ? "Dagen är klar. Starkt jobbat!" : "Hela dagen avklarad!"}
            </p>
          )}
        </section>

        {/* Overview */}
        <section className="mt-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Översikt</h2>
            <span className="text-sm font-semibold text-foreground">{stats.percent}% avklarat</span>
          </div>
          <div className="rounded-2xl border bg-card p-3">
            <DayGrid state={state} today={today} selected={selected} onSelect={setSelected} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <Legend className="bg-flame" label="Klar" />
            <Legend className="bg-primary/30" label="Delvis" />
            <Legend className="bg-destructive/15" label="Missad" />
            <Legend className="border border-dashed" label="Kommande" />
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  muted,
}: {
  label: string;
  value: number;
  icon?: ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-card px-3 py-3">
      <div className="flex items-center gap-1">
        <span className={cn("font-display text-3xl font-extrabold tabular-nums", muted && "text-muted-foreground")}>
          {value}
        </span>
        {icon}
      </div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-3 rounded", className)} />
      {label}
    </span>
  );
}
