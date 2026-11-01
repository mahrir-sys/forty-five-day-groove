import { useLanguage } from "@/hooks/use-language";
import type { ReactNode } from "react";
import { Bell, BellOff, BellRing, CheckCircle2, Download, ExternalLink, Loader2, ShieldAlert, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { RemindersApi } from "@/hooks/use-reminders";
import type { InstallApi } from "@/hooks/use-install-app";
import type { ReminderStatus } from "@/lib/push-reminders";
import { settingsCopy } from "@/lib/settings-copy";
import type { MessageKey } from "@/lib/i18n";

type Props = { reminders: RemindersApi; install: InstallApi };

const STATUS: Record<ReminderStatus, { icon: ReactNode; title: MessageKey; text: MessageKey | ""; tone: "on" | "warn" | "off" }> = {
  loading: { icon: <Loader2 className="size-6 animate-spin" />, title: "Kollar notiser…", text: "", tone: "off" },
  on: {
    icon: <BellRing className="size-6" />,
    title: "Kvällspåminnelser är tillåtna",
    text: "reminderTiming",
    tone: "on",
  },
  off: {
    icon: <BellOff className="size-6" />,
    title: "Kvällspåminnelser är av",
    text: "Tryck på knappen nedan och välj Tillåt när telefonen frågar.",
    tone: "off",
  },
  blocked: {
    icon: <ShieldAlert className="size-6" />,
    title: "Notiser är blockerade",
    text: "Telefonen tillåter inte notiser från appen. Följ steg 4 i guiden nedan och tryck sedan på Kolla igen.",
    tone: "warn",
  },
  "in-preview": {
    icon: <ExternalLink className="size-6" />,
    title: "Öppna appen på din telefon",
    text: "Notiser kan inte slås på i den här förhandsvisningen. Öppna appens länk i Chrome på din Android och följ guiden.",
    tone: "warn",
  },
  unsupported: {
    icon: <Smartphone className="size-6" />,
    title: "Den här webbläsaren saknar notiser",
    text: "Öppna appen i Chrome på Android för att få kvällspåminnelser.",
    tone: "warn",
  },
};

export function ReminderSheet({ reminders, install }: Props) {
  const { t, language } = useLanguage();
  const c = settingsCopy[language];
  const { status, busy } = reminders;
  const info = STATUS[status];

  return (
    <Sheet onOpenChange={(open) => open && void reminders.refresh()}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label={t("Påminnelser")}>
          <Bell className="size-5" />
          {status === "on" && <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" aria-hidden />}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-3xl border-t bg-card">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-2xl">{t("Påminnelser")}</SheetTitle>
          <SheetDescription>
            {c.summary}
          </SheetDescription>
        </SheetHeader>

        <div
          role="status"
          className={cn(
            "mt-5 flex gap-3 rounded-2xl border p-4",
            info.tone === "on" && "border-primary/60 bg-primary/10",
            info.tone === "warn" && "border-destructive/50 bg-destructive/10",
            info.tone === "off" && "bg-background",
          )}
        >
          <span className={cn("mt-0.5 shrink-0", info.tone === "on" ? "text-primary" : info.tone === "warn" ? "text-destructive" : "text-muted-foreground")}>
            {info.icon}
          </span>
          <div>
            <p className="font-semibold">{status === "on" ? c.on : status === "off" ? c.off : t(info.title)}</p>
            {info.text && <p className="mt-1 text-sm text-muted-foreground">{status === "on" ? c.timing : t(info.text)}</p>}
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {status === "off" && (
            <Button className="h-12 w-full rounded-xl text-base" onClick={reminders.enable} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <BellRing />} {c.enable}
            </Button>
          )}
          {status === "on" && (
            <>
              <Button className="h-12 w-full rounded-xl text-base" onClick={reminders.test} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <Bell />} {t("Skicka testnotis")}
              </Button>
              <Button variant="ghost" className="h-11 w-full rounded-xl text-muted-foreground" onClick={reminders.disable} disabled={busy}>
                <BellOff /> {t("Stäng av påminnelser")}
              </Button>
            </>
          )}
          {status === "blocked" && (
            <Button variant="outline" className="h-12 w-full rounded-xl bg-background" onClick={() => void reminders.refresh()}>
              {t("Kolla igen")}
            </Button>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border bg-background p-4">
          {install.installed ? (
            <>
              <CheckCircle2 className="size-6 shrink-0 text-primary" />
              <p className="text-sm font-semibold">{t("Appen är installerad på telefonen")}</p>
            </>
          ) : install.canInstall ? (
            <>
              <Download className="size-6 shrink-0 text-primary" />
              <p className="flex-1 text-sm font-semibold">{t("Lägg appen på hemskärmen")}</p>
              <Button size="sm" className="rounded-lg" onClick={() => void install.install()}>
                {t("Installera")}
              </Button>
            </>
          ) : (
            <>
              <Smartphone className="size-6 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("Appen är inte installerad än. Se steg 1 nedan.")}</p>
            </>
          )}
        </div>

        <section className="mt-8 pb-6">
          <details className="border-t py-4"><summary className="cursor-pointer text-sm font-semibold">{c.android}</summary>
          <ol className="mt-4 space-y-4">
            <Step n={1} title={t("Installera appen")}>
              {t("guideInstall")}
            </Step>
            <Step n={2} title={t("Öppna från hemskärmen")}>
              {t("guideOpen")}
            </Step>
            <Step n={3} title={t("Tillåt notiser")}>
              {c.enable} → {t("Tillåt notiser")}
            </Step>
            <Step n={4} title={t("Om notiser är blockerade")}>
              {t("guideBlocked")}
            </Step>
            <Step n={5} title={t("Testa")}>
              {t("guideTest")}
            </Step>
          </ol>
          <p className="mt-5 rounded-xl bg-secondary p-3 text-sm text-muted-foreground">
             {t("guideBattery")}
           </p></details>
          <details className="border-t py-4"><summary className="cursor-pointer text-sm font-semibold">{c.ios}</summary><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.iosGuide}</p></details>
        </section>
      </SheetContent>
    </Sheet>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-flame text-sm font-bold text-primary-foreground">
        {n}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{children}</p>
      </div>
    </li>
  );
}
