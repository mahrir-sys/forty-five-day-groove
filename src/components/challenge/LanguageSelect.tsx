import { Languages, LoaderCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { resolveLanguage } from "@/lib/i18n";

export function LanguageSelect() {
  const { language, setLanguage, t, translating, translationError, retryTranslation } = useLanguage();
  return (
    <div className="flex min-w-0 max-w-full flex-col items-end gap-1">
    <Select value={language} onValueChange={(value) => setLanguage(resolveLanguage(value))}>
      <SelectTrigger aria-label={t("language")} className="w-[140px] shrink-0 gap-2 bg-card">
        <Languages className="size-4 shrink-0 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="sv">Svenska</SelectItem>
        <SelectItem value="fr">Français</SelectItem>
      </SelectContent>
    </Select>
    {translating && <span role="status" className="flex items-center gap-1 text-xs text-muted-foreground"><LoaderCircle className="size-3 animate-spin motion-reduce:animate-none" />{t("translatingNames")}</span>}
    {translationError && <div role="alert" className="flex max-w-full items-center gap-1 text-xs text-destructive"><span className="min-w-0 break-words">{translationError}</span><Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label={t("retryTranslation")} title={t("retryTranslation")} onClick={retryTranslation}><RotateCcw className="size-3" /></Button></div>}
    </div>
  );
}