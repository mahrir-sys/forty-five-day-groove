import { useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Dashboard } from "./Dashboard";
import { useChallengeStore } from "@/hooks/use-challenge-store";

/** Shows a page as a bottom sheet over the home screen; closing (swipe, X, outside) returns home. */
export function RoutePanel({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const { state, ready, today, update } = useChallengeStore();
  const [open, setOpen] = useState(true);
  const close = (o: boolean) => {
    if (o) return;
    setOpen(false);
    window.setTimeout(() => void navigate({ to: "/" }), 250);
  };
  return (
    <>
      {ready && state.startDate ? <Dashboard state={state} today={today} update={update} /> : <div className="bg-glow min-h-screen" />}
      <Sheet open={open} onOpenChange={close}>
        <SheetContent side="bottom" className="mx-auto max-h-[90dvh] max-w-md overflow-y-auto rounded-t-3xl border-t bg-card">
          <SheetTitle className="font-display text-2xl font-extrabold tracking-tight">{title}</SheetTitle>
          <SheetDescription className="sr-only">{title}</SheetDescription>
          {children}
        </SheetContent>
      </Sheet>
    </>
  );
}
