import { useLanguage } from "@/hooks/use-language";
import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Challenge } from "@/lib/challenge";

type Props = {
  challenge: Challenge;
  onRename: (name: string) => void;
  onRemove: () => void;
};

export function ChallengeRow({ challenge: c, onRename, onRemove }: Props) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(c.name);

  if (editing) {
    return (
      <form
        className="flex items-center gap-2 rounded-xl border border-primary/60 bg-background px-2 py-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) onRename(text.trim());
          setEditing(false);
        }}
      >
        <Input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-10 flex-1 rounded-lg text-base"
          aria-label={t("Nytt namn")}
        />
        <button type="submit" className="rounded-full p-1.5 text-primary hover:bg-primary/15" aria-label={t("Spara namn")}>
          <Check className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setText(c.name);
            setEditing(false);
          }}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
          aria-label={t("Avbryt")}
        >
          <X className="size-4" />
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-xl border bg-background px-4 py-3">
      <span className="flex-1 font-medium">{c.name}</span>
      <button
        type="button"
        onClick={() => {
          setText(c.name);
          setEditing(true);
        }}
        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label={t("rename", { name: c.name })}
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
        aria-label={t("remove", { name: c.name })}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
