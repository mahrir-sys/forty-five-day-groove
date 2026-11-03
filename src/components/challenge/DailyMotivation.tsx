import { useEffect, useState } from "react";
import { Heart, Sparkles, Sunrise } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { AppState } from "@/lib/challenge";
import { dailyMotivation, motivationLabels } from "@/lib/motivation";

export function DailyMotivation({ state, today }: { state: AppState; today: string }) {
  const { language } = useLanguage();
  const [hour, setHour] = useState(0);
  useEffect(() => {
    const refresh = () => setHour(new Date().getHours());
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  const message = dailyMotivation(state, today, hour, language);
  if (!message) return null;
  const labels = motivationLabels[language];
  return (
    <section aria-label={labels.morning} className="mt-7 border-y border-border py-5">
      <div className="flex items-center gap-2 text-primary">
        <Sunrise aria-hidden="true" className="size-4 shrink-0" />
        <h2 className="text-xs font-semibold uppercase tracking-wider">{labels.morning}</h2>
      </div>
      <p className="mt-3 font-display text-lg font-medium leading-relaxed">{message.inspiration}</p>
      {message.author && <p className="mt-2 text-xs text-muted-foreground">— {message.author}</p>}
      {message.recovery && (
        <div className="mt-4 flex items-start gap-2 border-l-2 border-primary pl-3">
          <Heart aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-muted-foreground">{message.recovery}</p>
        </div>
      )}
      {message.celebration && (
        <div role="status" className="mt-5 border-t border-border pt-4">
          <div className="flex items-start gap-2 text-primary">
            <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <h3 className="text-sm font-semibold">{labels.evening}</h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed">{message.celebration}</p>
        </div>
      )}
    </section>
  );
}