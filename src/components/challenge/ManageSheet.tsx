import { LanguageSelect } from "./LanguageSelect";
import { useLanguage } from "@/hooks/use-language";
import { useState } from "react";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, RotateCcw, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TOTAL_DAYS, type Challenge } from "@/lib/challenge";
import { ChallengeRow } from "./ChallengeRow";

type Props = {
  challenges: Challenge[];
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onRestart: () => void;
  onReset: () => void;
};

export function ManageSheet({ challenges, onAdd, onRename, onRemove, onReorder, onRestart, onReset }: Props) {
  const { t } = useLanguage();
  const [text, setText] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={t("Hantera utmaningar")}>
          <Settings2 className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-t bg-card">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-2xl">{t("Dina utmaningar")}</SheetTitle>
          <SheetDescription>{t("Lägg till eller ta bort. Ändringar gäller alla dagar.")}</SheetDescription>
        </SheetHeader>

        <div className="mt-5 flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{t("language")}</span><LanguageSelect /></div>
        <form
          className="mt-5 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            onAdd(text.trim());
            setText("");
          }}
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("Ny utmaning")}
            className="h-12 rounded-xl bg-background text-base"
            aria-label={t("Ny utmaning")}
          />
          <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-xl" aria-label={t("Lägg till")}>
            <Plus />
          </Button>
        </form>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id) onReorder(String(active.id), String(over.id));
        }}>
        <SortableContext items={challenges.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <ul className="mt-4 space-y-2">
          {challenges.map((c, i) => (
            <li key={c.id}>
              <ChallengeRow
                challenge={c}
                position={i + 1}
                onRename={(name) => onRename(c.id, name)}
                onRemove={() => onRemove(c.id)}
              />
            </li>
          ))}
        </ul>
        </SortableContext>
        </DndContext>

        <div className="mt-8 space-y-2 border-t pt-6 pb-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="min-h-12 h-auto w-full justify-start whitespace-normal rounded-xl bg-background py-3 text-left">
                <RotateCcw /> {t("restartPeriod", { days: TOTAL_DAYS })}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("Starta om från dag 1?")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("Dina utmaningar behålls, men alla avbockningar raderas och perioden startar idag.")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("Avbryt")}</AlertDialogCancel>
                <AlertDialogAction onClick={onRestart}>{t("Starta om")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 w-full justify-start rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 /> {t("Radera allt")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("Radera allt?")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("Alla utmaningar och all historik tas bort. Det går inte att ångra.")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("Avbryt")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onReset}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t("Radera")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <p className="pb-4 text-center text-xs text-muted-foreground">v1.1.0 · Made by MD</p>
      </SheetContent>
    </Sheet>
  );
}
