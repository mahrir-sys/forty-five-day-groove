import { useLanguage } from "@/hooks/use-language";
import { useState } from "react";
import { Check, GripVertical, Pencil, Trash2, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { Challenge } from "@/lib/challenge";

type Props = {
  challenge: Challenge;
  position: number;
  onRename: (name: string) => void;
  onRemove: () => void;
};

export function ChallengeRow({ challenge: c, position, onRename, onRemove }: Props) {
  const { t, challengeName } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(c.name);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: c.id, disabled: editing });

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
        <Button variant="ghost" size="icon" type="submit" className="shrink-0 rounded-full text-primary" aria-label={t("Spara namn")}>
          <Check className="size-4" />
        </Button>
        <Button variant="ghost" size="icon"
          type="button"
          onClick={() => {
            setText(c.name);
            setEditing(false);
          }}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
          aria-label={t("Avbryt")}
        >
          <X className="size-4" />
        </Button>
      </form>
    );
  }

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("relative flex items-center gap-1 rounded-xl border bg-background py-2 pl-2 pr-3", isDragging && "z-10 border-primary shadow-lg")}>
      <Button data-no-swipe ref={setActivatorNodeRef} variant="ghost" size="icon" type="button" {...attributes} {...listeners} className="shrink-0 touch-none cursor-grab text-muted-foreground active:cursor-grabbing" aria-label={t("reorder", { name: challengeName(c.name) })} title={t("reorder", { name: challengeName(c.name) })}>
        <GripVertical className="size-5" />
      </Button>
      <span className="w-6 shrink-0 text-center font-display font-extrabold tabular-nums text-primary">{position}</span>
      <span className="min-w-0 flex-1 break-words font-medium">{challengeName(c.name)}</span>
      <Button variant="ghost" size="icon"
        type="button"
        onClick={() => {
          setText(c.name);
          setEditing(true);
        }}
        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label={t("rename", { name: challengeName(c.name) })}
      >
        <Pencil className="size-4" />
      </Button>
      <Button variant="ghost" size="icon"
        type="button"
        onClick={onRemove}
        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
        aria-label={t("remove", { name: challengeName(c.name) })}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
