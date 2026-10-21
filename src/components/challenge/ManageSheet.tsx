import { useState } from "react";
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
  onRestart: () => void;
  onReset: () => void;
};

export function ManageSheet({ challenges, onAdd, onRename, onRemove, onRestart, onReset }: Props) {
  const [text, setText] = useState("");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Hantera utmaningar">
          <Settings2 className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-t bg-card">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-2xl">Dina utmaningar</SheetTitle>
          <SheetDescription>Lägg till eller ta bort. Ändringar gäller alla dagar.</SheetDescription>
        </SheetHeader>

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
            placeholder="Ny utmaning"
            className="h-12 rounded-xl bg-background text-base"
            aria-label="Ny utmaning"
          />
          <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-xl" aria-label="Lägg till">
            <Plus />
          </Button>
        </form>

        <ul className="mt-4 space-y-2">
          {challenges.map((c) => (
            <li key={c.id}>
              <ChallengeRow challenge={c} onRename={(name) => onRename(c.id, name)} onRemove={() => onRemove(c.id)} />
            </li>
          ))}
        </ul>

        <div className="mt-8 space-y-2 border-t pt-6 pb-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="h-12 w-full justify-start rounded-xl bg-background">
                <RotateCcw /> Starta ny {TOTAL_DAYS}-dagarsperiod
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Starta om från dag 1?</AlertDialogTitle>
                <AlertDialogDescription>
                  Dina utmaningar behålls, men alla avbockningar raderas och perioden startar idag.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction onClick={onRestart}>Starta om</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 w-full justify-start rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 /> Radera allt
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Radera allt?</AlertDialogTitle>
                <AlertDialogDescription>
                  Alla utmaningar och all historik tas bort. Det går inte att ångra.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onReset}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Radera
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
