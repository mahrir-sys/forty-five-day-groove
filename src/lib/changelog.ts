import type { Language } from "./i18n";

/** Full release history, newest first. Add new releases at the top; never remove old ones. */
export type Release = { date: string; changes: Record<Language, string[]> };

export const RELEASES: Release[] = [
  {
    date: "2026-11-04",
    changes: {
      en: ["Reflection appears in focus mode after the last check, with a skip button", "Full version history is kept here", "More reliable automatic update while the app is open"],
      sv: ["Reflektion visas i fokusläget efter sista avbockningen, med knapp för att hoppa över", "Hela versionshistoriken sparas här", "Säkrare automatisk uppdatering medan appen är öppen"],
      fr: ["La réflexion apparaît en mode concentration après le dernier défi, avec un bouton pour passer", "L’historique complet des versions est conservé ici", "Mise à jour automatique plus fiable quand l’application est ouverte"],
    },
  },
  {
    date: "2026-11-03",
    changes: {
      en: ["Automatic update of the installed app", "Four sound profiles with preview", "45 unique daily quotes"],
      sv: ["Automatisk uppdatering av den installerade appen", "Fyra ljudprofiler med provlyssning", "45 unika dagliga citat"],
      fr: ["Mise à jour automatique de l’application installée", "Quatre profils sonores avec écoute", "45 citations quotidiennes uniques"],
    },
  },
  {
    date: "2026-10-24",
    changes: {
      en: ["Sound and vibration settings, clearer 50 ms vibration", "New check-off chord and a festive fanfare for the last check", "Day rollover at 05:00", "Lunch reminder at 12 and evening reminder at 21, in your language", "Optional first name for personal encouragement", "Backup export and restore", "Focus mode opens automatically after your first check of the day"],
      sv: ["Ljud- och vibrationsinställningar, tydligare vibration på 50 ms", "Ny avbockningsklang och festlig fanfar vid sista avbockningen", "Dygnsbryt kl. 05:00", "Lunchpåminnelse kl. 12 och kvällspåminnelse kl. 21, på ditt språk", "Valfritt förnamn för personlig pepp", "Export och återställning av säkerhetskopia", "Fokusläget öppnas automatiskt efter dagens första avbockning"],
      fr: ["Réglages du son et des vibrations, vibration plus nette de 50 ms", "Nouvel accord de validation et fanfare festive pour le dernier défi", "Changement de jour à 5 h", "Rappel à midi et rappel à 21 h, dans votre langue", "Prénom facultatif pour des encouragements personnels", "Export et restauration de sauvegarde", "Le mode focus s’ouvre automatiquement après votre premier défi du jour"],
    },
  },
  {
    date: "2026-10-23",
    changes: {
      en: ["Daily reflection, partner link and focus mode", "Sound and vibration on check-off", "Milestones with confetti on days 7, 23, 40 and 45", "Varied recovery texts and coaching after repeated misses", "Morning inspiration and evening encouragement"],
      sv: ["Dagens reflektion, kompislänk och fokusläge", "Ljud och vibration vid avbockning", "Milstolpar med konfetti dag 7, 23, 40 och 45", "Varierad återhämtningstext och coachning vid upprepade missar", "Morgonpepp och kvällspepp"],
      fr: ["Réflexion du jour, lien partenaire et mode concentration", "Son et vibration à chaque défi validé", "Étapes avec confettis aux jours 7, 23, 40 et 45", "Textes de reprise variés et coaching après des oublis répétés", "Inspiration du matin et encouragements du soir"],
    },
  },
  {
    date: "2026-10-20",
    changes: {
      en: ["Drag-and-drop ordering with numbering", "Version number with Made by MD", "Reminder at 21 when a challenge remains", "App renamed to 45 days", "English, Swedish and French with translated challenge names", "Statistics page", "Installable app with reminders"],
      sv: ["Dra och släpp för ordning med numrering", "Versionsnummer med Made by MD", "Påminnelse kl. 21 när en utmaning återstår", "Appen heter nu 45 days", "Engelska, svenska och franska med översatta utmaningsnamn", "Statistiksida", "Installerbar app med påminnelser"],
      fr: ["Réorganisation par glisser-déposer avec numérotation", "Numéro de version avec Made by MD", "Rappel à 21 h s’il reste un défi", "L’application s’appelle 45 days", "Anglais, suédois et français avec noms de défis traduits", "Page de statistiques", "Application installable avec rappels"],
    },
  },
];
