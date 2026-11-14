import { RoutePanel } from "@/components/challenge/RoutePanel";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChallengeStore } from "@/hooks/use-challenge-store";
import { useLanguage } from "@/hooks/use-language";
import { generatePep } from "@/lib/pep.functions";
import { buildPepSummary, pepLevel, PEP_CACHE_KEY, type PepResult } from "@/lib/pep";

export const Route = createFileRoute("/pepp")({
  head: () => ({
    meta: [
      { title: "Your personal pep talk – 45 days" },
      { name: "description", content: "A personal AI pep talk based on how your 45-day challenges are going." },
      { property: "og:title", content: "Your personal pep talk – 45 days" },
      { property: "og:description", content: "Encouragement and tips tailored to your challenges." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PepPage,
});

const copy = {
  en: { title: "Pep talk", back: "Back", refresh: "New pep talk", loading: "Reading your progress…", tips: "Small steps", none: "Start a period with challenges to get a personal pep talk.", hard: "Needs extra love", good: "Going strong", onWay: "On the right track", retry: "Try again" },
  sv: { title: "Pepp", back: "Tillbaka", refresh: "Ny pepp", loading: "Läser av hur det går…", tips: "Små steg", none: "Starta en period med utmaningar för att få personlig pepp.", hard: "Behöver extra kärlek", good: "Går starkt", onWay: "På god väg", retry: "Försök igen" },
  fr: { title: "Encouragements", back: "Retour", refresh: "Nouvel encouragement", loading: "Analyse de vos progrès…", tips: "Petits pas", none: "Commencez une période avec des défis pour recevoir des encouragements personnels.", hard: "À soutenir", good: "Ça roule", onWay: "En bonne voie", retry: "Réessayer" },
} as const;

type Cached = { date: string; language: string; pep: PepResult };

function PepPage() {
  const { language, challengeName } = useLanguage();
  const c = copy[language];
  const { state, ready, today } = useChallengeStore();
  const run = useServerFn(generatePep);
  const [pep, setPep] = useState<PepResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const summary = ready ? buildPepSummary(state, today) : null;

  const load = useCallback(async () => {
    const s = ready ? buildPepSummary(state, today) : null;
    if (!s) return;
    setLoading(true); setError(null);
    try {
      const res = await run({ data: { language, summary: s } });
      if (res.pep) {
        setPep(res.pep);
        try { localStorage.setItem(PEP_CACHE_KEY, JSON.stringify({ date: today, language, pep: res.pep } satisfies Cached)); } catch {}
      } else setError(res.error);
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }, [ready, state, today, language, run]);

  // One automatic pep talk per logical day and language; the button makes a fresh one.
  useEffect(() => {
    if (!ready) return;
    try {
      const cached = JSON.parse(localStorage.getItem(PEP_CACHE_KEY) ?? "null") as Cached | null;
      if (cached && cached.date === today && cached.language === language) { setPep(cached.pep); return; }
    } catch {}
    void load();
  }, [ready, today, language]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <RoutePanel title={c.title}>{null}</RoutePanel>;

  return (
    <RoutePanel title={c.title}>

        {!summary ? (
          <p className="mt-6 rounded-2xl border border-dashed p-6 text-center text-muted-foreground">{c.none}</p>
        ) : (
          <>
            <section className="mt-6 rounded-3xl border bg-card p-6 shadow-sm">
              <Sparkles className="size-6 text-primary" />
              {loading && !pep && <p className="mt-3 animate-pulse text-muted-foreground">{c.loading}</p>}
              {pep && (
                <div className={loading ? "opacity-50" : undefined}>
                  <h2 className="mt-3 font-display text-xl font-bold">{pep.headline}</h2>
                  <p className="mt-3 leading-relaxed">{pep.message}</p>
                  {pep.tips.length > 0 && <>
                    <h3 className="mt-5 text-xs font-semibold uppercase tracking-widest text-primary">{c.tips}</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5">{pep.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
                  </>}
                </div>
              )}
              {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
              <Button className="mt-5 w-full rounded-xl" variant="secondary" disabled={loading} onClick={() => void load()}>
                <RefreshCw className={loading ? "animate-spin" : undefined} /> {error && !pep ? c.retry : c.refresh}
              </Button>
            </section>

            <ul className="mt-5 space-y-2">
              {summary.challenges.map((ch, i) => {
                const level = pepLevel(ch);
                const style = level === "hard" ? "bg-destructive/10 text-destructive" : level === "onWay" ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary";
                const label = level === "hard" ? c.hard : level === "onWay" ? c.onWay : c.good;
                return (
                  <li key={i} className="flex flex-col gap-1.5 rounded-2xl border bg-card px-4 py-3">
                    <span className="min-w-0 break-words font-medium">{challengeName(ch.name)}</span>
                    <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>{label} · {Math.round(ch.percent)}%</span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
    </RoutePanel>
  );
}
