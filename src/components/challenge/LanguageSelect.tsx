import { Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { resolveLanguage } from "@/lib/i18n";

export function LanguageSelect() {
  const { language, setLanguage, t } = useLanguage();
  return (
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
  );
}