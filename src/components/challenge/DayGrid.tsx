import { cn } from "@/lib/utils";
import { addDays, dayNumber, dayProgress, TOTAL_DAYS, type AppState } from "@/lib/challenge";

type Props = {
  state: AppState;
  today: string;
  selected: string;
  onSelect: (date: string) => void;
};

export function DayGrid({ state, today, selected, onSelect }: Props) {
  const start = state.startDate!;
  const todayN = dayNumber(start, today);

  return (
    <div className="grid grid-cols-9 gap-1.5">
      {Array.from({ length: TOTAL_DAYS }, (_, i) => {
        const n = i + 1;
        const date = addDays(start, i);
        const { done, total } = dayProgress(state, date);
        const future = n > todayN;
        const isToday = n === todayN;
        const complete = total > 0 && done === total;
        const partial = done > 0 && !complete;
        const missed = !future && !isToday && !complete;

        return (
          <button
            key={date}
            type="button"
            disabled={future}
            onClick={() => onSelect(date)}
            aria-label={`Dag ${n}, ${done} av ${total} klara`}
            aria-pressed={selected === date}
            className={cn(
              "relative flex aspect-square items-center justify-center rounded-lg text-[11px] font-bold tabular-nums transition-all",
              future && "border border-dashed text-muted-foreground/50",
              complete && "bg-flame text-primary-foreground",
              partial && "bg-primary/30 text-foreground",
              missed && !partial && "bg-destructive/15 text-destructive",
              isToday && !complete && !partial && "bg-secondary text-foreground",
              isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
              selected === date && !isToday && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
