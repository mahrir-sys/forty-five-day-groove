import { LanguageSelect } from "./LanguageSelect";
import { Button } from "@/components/ui/button";
import { Sparkles, Target } from "lucide-react";
import { PartnerSheet } from "./PartnerSheet";
import { Reflection, FocusList, CoachingAndMilestones } from "./DailyExtras";
import { checkFeedback, celebrate, isSoundProfile, type SoundProfile } from "@/lib/check-feedback";
import { engagementCopy } from "@/lib/engagement-copy";
import { shouldAutoFocus } from "@/lib/engagement";
import { settingsCopy } from "@/lib/settings-copy";
import { useRef } from "react";
import { DailyMotivation } from "./DailyMotivation";
import { useLanguage } from "@/hooks/use-language";
import { useEffect, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { BarChart3, Check, ChevronLeft, ChevronRight, Flame, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  addDays,
  computeStats,
  dayNumber,
  dayProgress,
  endDate,
  parseISODate,
  reorderChallenge,
  periodStatus,
  toggleCheck,
  toggleNotApplicable,
  isNotApplicable,
  TOTAL_DAYS,
  type AppState,
} from "@/lib/challenge";
import { DayGrid } from "./DayGrid";
import { ManageSheet } from "./ManageSheet";
import { ReminderSheet } from "./ReminderSheet";
import { useReminders } from "@/hooks/use-reminders";
import { useInstallApp } from "@/hooks/use-install-app";

type Props = {
  state: AppState;
  today: string;
  update: (fn: (s: AppState) => AppState) => void;
};


export function Dashboard({ state, today, update }: Props) {
   const { t, dateLocale, challengeName, language, setLanguage } = useLanguage();
   const c = engagementCopy[language];
   const [focus, setFocus] = useState(false);
   const [sound, setSound] = useState(true);
   const [vibration, setVibration] = useState(true);
   const [soundProfile, setSoundProfile] = useState<SoundProfile>("harmonic");
   const [feedbackReady, setFeedbackReady] = useState(false);
   const autoFocusDay = useRef("");
   // Auto-focus once per app session and logical day, so returning from other pages lands on home.
   useEffect(() => {
     if (autoFocusDay.current === today) return;
     autoFocusDay.current = today;
     let seen = false;
     try { seen = sessionStorage.getItem('45days:autofocus') === today; sessionStorage.setItem('45days:autofocus', today); } catch {}
     if (!seen && shouldAutoFocus(state, today)) setFocus(true);
   }, [today]); // eslint-disable-line react-hooks/exhaustive-deps
   useEffect(() => {
     try { const saved = JSON.parse(localStorage.getItem('45days:feedback') ?? 'null'); if (saved) { setSound(saved.sound !== false); setVibration(saved.vibration !== false); if (isSoundProfile(saved.soundProfile)) setSoundProfile(saved.soundProfile); } } catch {}
     setFeedbackReady(true);
   }, []);
   useEffect(() => { if (feedbackReady) { try { localStorage.setItem('45days:feedback', JSON.stringify({sound, vibration, soundProfile})); } catch {} } }, [sound, vibration, soundProfile, feedbackReady]);
  const reminders = useReminders(state);
  const install = useInstallApp();
  const start = state.startDate ?? today;
  const fmt = (iso: string, pattern: string) => format(parseISODate(iso), pattern, { locale: dateLocale });
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
  const check = (id: string, date: string) => {
    const isNew = !(state.log[date] ?? []).includes(id);
    const progress = dayProgress(state, date);
    const final = isNew && progress.total > 0 && progress.done + 1 === progress.total;
    update(s => toggleCheck(s, date, id));
    if (isNew) checkFeedback(sound, vibration, final, soundProfile);
    if (final && date === today) void celebrate();
  };

  const selectedLabel =
    selected === today ? t("Idag") : selected === addDays(today, -1) ? t("Igår") : fmt(selected, "EEEE d MMM");

  return (
    <div className="bg-glow min-h-screen">
      <main className="mx-auto max-w-md px-5 pb-16 pt-6">
        <div className="mb-4 flex justify-end"><LanguageSelect /></div>
        {state.firstName?.trim() && <p className="mb-2 font-display text-lg font-semibold">{settingsCopy[language].hello} {state.firstName.trim()}!</p>}
        <header className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {TOTAL_DAYS} {t("days")}
          </p>
          <div className="flex items-center gap-1">
          {status === 'active' && <Button variant="ghost" size="icon" aria-label={c.focus} title={c.focus} onClick={() => setFocus(true)}><Target /></Button>}
          <PartnerSheet state={state} today={today} />
          <Link to="/pepp" aria-label="Pepp" className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Sparkles className="size-5" /></Link>
          <Link
            to="/statistik"
            aria-label={t("Statistik")}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <BarChart3 className="size-5" />
          </Link>
          <ReminderSheet reminders={reminders} install={install} />
          <ManageSheet
            state={state} today={today} sound={sound} vibration={vibration}
            setSound={setSound} setVibration={setVibration} soundProfile={soundProfile} setSoundProfile={setSoundProfile}
            onName={firstName=>update(s=>({...s,firstName}))}
            onRestore={backup=>{update(()=>backup.state);setLanguage(backup.preferences.language);setSound(backup.preferences.sound);setVibration(backup.preferences.vibration);setSoundProfile(backup.preferences.soundProfile);}}
            challenges={state.challenges}
            onAdd={(name) =>
              update((s) => ({
                ...s,
                challenges: [...s.challenges, { id: crypto.randomUUID(), name }],
              }))
            }
            onRename={(id, name) =>
              update((s) => ({
                ...s,
                challenges: s.challenges.map((c) => (c.id === id ? { ...c, name } : c)),
              }))
            }
            onRemove={(id) =>
              update((s) => ({ ...s, challenges: s.challenges.filter((c) => c.id !== id) }))
            }
            onReorder={(activeId, overId) => update((s) => reorderChallenge(s, activeId, overId))}
            onRestart={() => update((s) => ({ ...s, startDate: today, log: {} }))}
            onReset={() => update((s) => ({ startDate: null, challenges: [], log: {}, firstName: s.firstName ?? "" }))}
          />
          </div>
        </header>

        {/* Day counter */}
        <section className="mt-4">
          {status === "upcoming" ? (
            <>
              <p className="text-sm font-medium text-muted-foreground">{t("starts", { date: fmt(start, "d MMMM") })}</p>
              <h1 className="mt-1 text-7xl font-extrabold leading-none tracking-tight">
                <span className="text-flame">{daysLeft}</span>
                <span className="ml-2 text-3xl text-muted-foreground">
                  {daysLeft === 1 ? t("dag kvar") : t("dagar kvar")}
                </span>
              </h1>
            </>
          ) : status === "finished" ? (
            <div className="flex items-end gap-4">
              <Trophy className="mb-2 size-14 text-primary" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("Perioden är avslutad")}</p>
                <h1 className="text-5xl font-extrabold leading-none tracking-tight">
                  <span className="text-flame">{stats.completedDays}</span>
                  <span className="text-2xl text-muted-foreground"> / {TOTAL_DAYS} {t("hela dagar")}</span>
                </h1>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground">
                {fmt(start, "d MMM")} – {fmt(end, "d MMM")}
              </p>
              <h1 className="mt-1 flex items-baseline font-extrabold leading-none tracking-tight">
                <span className="mr-3 text-2xl text-muted-foreground">{t("Dag")}</span>
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
          <Stat label={t("Streak")} value={stats.streak} icon={<Flame className="size-4 text-primary" />} />
          <Stat label={t("Hela dagar")} value={stats.completedDays} />
          <Stat label={t("Missade")} value={stats.missedDays} muted={stats.missedDays === 0} />
        </section>

        {/* Checklist */}
        <DailyMotivation state={state} today={today} />
        <section id="today-list" className="mt-8">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelected(addDays(selected, -1))}
              disabled={selectedN <= 1}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
              aria-label={t("Föregående dag")}
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold capitalize">{selectedLabel}</h2>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {t("Dag")} {Math.max(1, selectedN)} · {done}/{total} {t("klara")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(addDays(selected, 1))}
              disabled={selected >= lastSelectable || status === "upcoming"}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
              aria-label={t("Nästa dag")}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {total === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
              {t("Inga utmaningar än. Lägg till via inställningarna uppe till höger.")}
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {state.challenges.map((c, i) => {
                const isDone = checked.has(c.id);
                const isNa = isNotApplicable(state, selected, c.id);
                const naLabel = (isNa ? { en: "Skipped", sv: "Hoppad över", fr: "Passé" } : { en: "Skip today", sv: "Hoppa över", fr: "Passer" })[language];
                return (
                  <li key={c.id} className="relative">
                    <button
                      type="button"
                      disabled={!canCheck || isNa}
                      onClick={() => check(c.id, selected)}
                      aria-pressed={isDone}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-2xl border px-4 pb-6 pt-4 text-left transition-all active:scale-[0.99] disabled:opacity-50",
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
                      <span className={cn("min-w-0 flex-1 break-words text-base font-semibold", isDone && "text-muted-foreground line-through decoration-primary/60", isNa && "text-muted-foreground opacity-60")}>
                        <span className="mr-2 font-display tabular-nums text-primary">{i + 1}.</span>
                        {challengeName(c.name)}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={!canCheck}
                      onClick={() => update(s => toggleNotApplicable(s, selected, c.id))}
                      aria-pressed={isNa}
                      aria-label={`${naLabel}: ${challengeName(c.name)}`}
                      className={cn(
                        "absolute bottom-1.5 right-3 rounded-full px-2 py-0.5 text-[11px] transition-colors disabled:opacity-40",
                        isNa ? "bg-muted font-semibold text-foreground" : "text-muted-foreground/70 hover:text-foreground",
                      )}
                    >
                      {naLabel}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {allDone && canCheck && (
            <p className="animate-pop mt-4 rounded-2xl bg-flame p-4 text-center font-display text-lg font-bold text-primary-foreground shadow-glow">
              {selected === today ? t("Dagen är klar. Starkt jobbat!") : t("Hela dagen avklarad!")}
            </p>
          )}
        </section>

        {canCheck && <Reflection state={state} date={selected} update={update} />}
        <CoachingAndMilestones state={state} today={today} />

        {/* Overview */}
        <section className="mt-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{t("Översikt")}</h2>
            <span className="text-sm font-semibold text-foreground">{stats.percent}% {t("avklarat")}</span>
          </div>
          <div className="rounded-2xl border bg-card p-3">
            <DayGrid state={state} today={today} selected={selected} onSelect={setSelected} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <Legend className="bg-flame" label={t("Klar")} />
            <Legend className="bg-primary/30" label={t("Delvis")} />
            <Legend className="bg-destructive/15" label={t("Missad")} />
            <Legend className="border border-dashed" label={t("Kommande")} />
          </div>
        </section>
      </main>
      {focus && <FocusList state={state} today={today} onCheck={id => check(id, today)} onExit={() => setFocus(false)} update={update} />}
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
