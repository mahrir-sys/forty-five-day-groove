import { RELEASES, formatRelease } from "@/lib/changelog";
import type { SoundProfile } from "@/lib/check-feedback";
import { LanguageSelect } from "./LanguageSelect";
import { useLanguage } from "@/hooks/use-language";
import { useEffect, useState } from "react";
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

import { FeedbackControls } from './DailyExtras';
import { BackupControls } from './BackupControls';
import { settingsCopy } from '@/lib/settings-copy';
import type { AppState } from '@/lib/challenge';
import type { Backup } from '@/lib/backup';
type Props = {
  state: AppState; today: string; sound: boolean; vibration: boolean;
  setSound: (value:boolean)=>void; setVibration: (value:boolean)=>void;
  soundProfile: SoundProfile; setSoundProfile: (value:SoundProfile)=>void;
  onName: (name:string)=>void; onRestore: (backup:Backup)=>void;
  challenges: Challenge[];
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onRestart: () => void;
  onReset: () => void;
};

export function ManageSheet({ challenges, onAdd, onRename, onRemove, onReorder, onRestart, onReset, state, today, sound, vibration, setSound, setVibration, soundProfile, setSoundProfile, onName, onRestore }: Props) {
  const { t, language } = useLanguage();
  const copy = settingsCopy[language];
  const [text, setText] = useState("");
  const [nameDraft, setNameDraft] = useState(state.firstName ?? "");
  const [nameSaved, setNameSaved] = useState(false);
  useEffect(() => { setNameDraft(state.firstName ?? ""); }, [state.firstName]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={copy.settings}>
          <Settings2 className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-t bg-card">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-2xl">{copy.settings}</SheetTitle>
          <SheetDescription>{t("Lägg till eller ta bort. Ändringar gäller alla dagar.")}</SheetDescription>
        </SheetHeader>

        <div className="mt-5 flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{t("language")}</span><LanguageSelect /></div>
        <div className="mt-5"><label htmlFor="settings-name" className="text-sm text-muted-foreground">{copy.name}</label><form className="mt-2 flex gap-2" onSubmit={e=>{e.preventDefault();onName(nameDraft.trim());setNameSaved(true);}}><Input id="settings-name" autoComplete="given-name" maxLength={60} value={nameDraft} onChange={e=>{setNameDraft(e.target.value);setNameSaved(false);}} onBlur={()=>{if(nameDraft.trim()!==(state.firstName??'')){onName(nameDraft.trim());setNameSaved(true);}}} /><Button type="submit" variant="secondary">{nameSaved?copy.saved:copy.save}</Button></form></div>
        <FeedbackControls sound={sound} vibration={vibration} setSound={setSound} setVibration={setVibration} profile={soundProfile} setProfile={setSoundProfile} />
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

        <BackupControls state={state} today={today} sound={sound} vibration={vibration} soundProfile={soundProfile} onRestore={onRestore} />
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
        <AlertDialog><AlertDialogTrigger asChild><button type="button" className="mx-auto block pb-4 text-center text-xs text-muted-foreground underline-offset-4 hover:underline">{formatRelease(RELEASES[0])} · Made by MD · {copy.whatsNew}</button></AlertDialogTrigger><AlertDialogContent className="max-h-[85dvh] overflow-y-auto"><AlertDialogHeader><AlertDialogTitle>{copy.whatsNew}</AlertDialogTitle><AlertDialogDescription asChild><div className="space-y-5 text-left">{RELEASES.map((r,i)=><section key={r.version}><h3 className="text-sm font-semibold text-foreground">{formatRelease(r)}{i===0?' ·  ✦':''}</h3><ul className="mt-1 list-disc space-y-1 pl-5">{r.changes[language].map(item=><li key={item}>{item}</li>)}</ul></section>)}</div></AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>OK</AlertDialogCancel></AlertDialogFooter></AlertDialogContent></AlertDialog>
      </SheetContent>
    </Sheet>
  );
}
