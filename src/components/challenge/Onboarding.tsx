import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOTAL_DAYS, type Challenge } from "@/lib/challenge";

const SUGGESTIONS = [
  "Träna 45 min",
  "Drick 3 liter vatten",
  "Läs 10 sidor",
  "Inget socker",
  "Promenad utomhus",
  "Meditera 10 min",
];

type Props = {
  today: string;
  onStart: (challenges: Challenge[], startDate: string) => void;
};

export function Onboarding({ today, onStart }: Props) {
  const [items, setItems] = useState<Challenge[]>([]);
  const [text, setText] = useState("");
  const [startDate, setStartDate] = useState(today);

  const add = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (items.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) return;
    setItems((prev) => [...prev, { id: crypto.randomUUID(), name: trimmed }]);
    setText("");
  };

  const unused = SUGGESTIONS.filter(
    (s) => !items.some((i) => i.name.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="bg-glow min-h-screen">
      <main className="mx-auto flex max-w-md flex-col px-5 pb-10 pt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Utmaningen
        </p>
        <h1 className="mt-3 text-6xl font-extrabold leading-[0.9] tracking-tight">
          <span className="text-flame">{TOTAL_DAYS}</span> dagar.
          <br />
          Inga ursäkter.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Lägg till de utmaningar du ska klara varje dag. Bocka av dem i {TOTAL_DAYS} dagar i
          rad.
        </p>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Dina utmaningar
          </h2>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              add(text);
            }}
          >
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="T.ex. Kallbad varje morgon"
              className="h-12 rounded-xl bg-card text-base"
              aria-label="Ny utmaning"
            />
            <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-xl" aria-label="Lägg till">
              <Plus />
            </Button>
          </form>

          {items.length > 0 && (
            <ul className="mt-4 space-y-2">
              {items.map((item, i) => (
                <li
                  key={item.id}
                  className="animate-pop flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
                >
                  <span className="font-display text-sm font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-medium">{item.name}</span>
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((p) => p.id !== item.id))}
                    className="rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`Ta bort ${item.name}`}
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {unused.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {unused.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s)}
                  className="rounded-full border border-dashed px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  + {s}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <label
            htmlFor="start-date"
            className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Startdatum
          </label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value || today)}
            className="mt-3 h-12 rounded-xl bg-card text-base"
          />
        </section>

        <Button
          variant="flame"
          size="xl"
          className="mt-10 w-full"
          disabled={items.length === 0}
          onClick={() => onStart(items, startDate)}
        >
          Starta {TOTAL_DAYS} dagar
        </Button>
        {items.length === 0 && (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Lägg till minst en utmaning för att börja.
          </p>
        )}
      </main>
    </div>
  );
}
