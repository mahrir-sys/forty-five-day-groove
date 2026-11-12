import type { Language } from "./i18n";

/** Full release history, newest first. Add new releases at the top; never remove old ones. */
/** Semantic version (Major.Minor.Patch): bump patch for fixes or extra releases the same day, minor for new features. */
export type Release = { version: string; date: string; changes: Record<Language, string[]> };

export const RELEASES: Release[] = [
  {
    version: "1.8.0",
    date: "2026-11-12",
    changes: {
      en: ["The app opens without internet, e.g. in flight mode"],
      sv: ["Appen öppnas utan internet, t.ex. i flygplansläge"],
      fr: ["L’application s’ouvre sans internet, par ex. en mode avion"],
    },
  },
  {
    version: "1.7.0",
    date: "2026-11-08",
    changes: {
      en: ["Mark a challenge as N/A for a day (e.g. while travelling) without hurting your stats or streak", "Smoother swipe-down closing of panels", "Focus mode can be swiped down to close", "Clearer, colour-filled tabs in Settings"],
      sv: ["Markera en utmaning som N/A för en dag (t.ex. på resa) utan att statistik eller streak påverkas", "Mjukare stängning av paneler när man sveper nedåt", "Fokusläget kan stängas genom att svepa nedåt", "Tydligare, färgfyllda flikar i Inställningar"],
      fr: ["Marquer un défi N/A pour une journée (en voyage par ex.) sans affecter statistiques ni série", "Fermeture plus fluide des panneaux en glissant vers le bas", "Le mode concentration se ferme en glissant vers le bas", "Onglets plus visibles et colorés dans les Paramètres"],
    },
  },
  {
    version: "1.6.0",
    date: "2026-11-06",
    changes: {
      en: ["Settings split into two tabs: Challenges and Settings", "Focus mode no longer opens when all challenges are done", "Going back from statistics or pep talk lands on the home screen"],
      sv: ["Inställningar uppdelade i två flikar: Utmaningar och Inställningar", "Fokusläget öppnas inte när alla utmaningar är klara", "Tillbaka från statistik eller pepp leder till hemskärmen"],
      fr: ["Paramètres répartis en deux onglets : Défis et Paramètres", "Le mode concentration ne s’ouvre plus quand tous les défis sont faits", "Revenir des statistiques ou des encouragements ramène à l’accueil"],
    },
  },
  {
    version: "1.5.0",
    date: "2026-11-05",
    changes: {
      en: ["Version number with date, so several updates on the same day are easy to tell apart"],
      sv: ["Versionsnummer med datum, så att flera uppdateringar samma dag går att skilja åt"],
      fr: ["Numéro de version avec date, pour distinguer plusieurs mises à jour le même jour"],
    },
  },
  {
    version: "1.4.0",
    date: "2026-11-04",
    changes: {
      en: ["Test of the automatic app update", "Reflection appears in focus mode after the last check, with a skip button", "Full version history is kept here", "More reliable automatic update while the app is open"],
      sv: ["Test av automatisk uppdatering av appen", "Reflektion visas i fokusläget efter sista avbockningen, med knapp för att hoppa över", "Hela versionshistoriken sparas här", "Säkrare automatisk uppdatering medan appen är öppen"],
      fr: ["Test de la mise à jour automatique de l’application", "La réflexion apparaît en mode concentration après le dernier défi, avec un bouton pour passer", "L’historique complet des versions est conservé ici", "Mise à jour automatique plus fiable quand l’application est ouverte"],
    },
  },
  {
    version: "1.3.0",
    date: "2026-11-03",
    changes: {
      en: ["Automatic update of the installed app", "Four sound profiles with preview", "45 unique daily quotes"],
      sv: ["Automatisk uppdatering av den installerade appen", "Fyra ljudprofiler med provlyssning", "45 unika dagliga citat"],
      fr: ["Mise à jour automatique de l’application installée", "Quatre profils sonores avec écoute", "45 citations quotidiennes uniques"],
    },
  },
  {
    version: "1.2.0",
    date: "2026-10-24",
    changes: {
      en: ["Sound and vibration settings, clearer 50 ms vibration", "New check-off chord and a festive fanfare for the last check", "Day rollover at 05:00", "Lunch reminder at 12 and evening reminder at 21, in your language", "Optional first name for personal encouragement", "Backup export and restore", "Focus mode opens automatically after your first check of the day"],
      sv: ["Ljud- och vibrationsinställningar, tydligare vibration på 50 ms", "Ny avbockningsklang och festlig fanfar vid sista avbockningen", "Dygnsbryt kl. 05:00", "Lunchpåminnelse kl. 12 och kvällspåminnelse kl. 21, på ditt språk", "Valfritt förnamn för personlig pepp", "Export och återställning av säkerhetskopia", "Fokusläget öppnas automatiskt efter dagens första avbockning"],
      fr: ["Réglages du son et des vibrations, vibration plus nette de 50 ms", "Nouvel accord de validation et fanfare festive pour le dernier défi", "Changement de jour à 5 h", "Rappel à midi et rappel à 21 h, dans votre langue", "Prénom facultatif pour des encouragements personnels", "Export et restauration de sauvegarde", "Le mode focus s’ouvre automatiquement après votre premier défi du jour"],
    },
  },
  {
    version: "1.1.0",
    date: "2026-10-23",
    changes: {
      en: ["Daily reflection, partner link and focus mode", "Sound and vibration on check-off", "Milestones with confetti on days 7, 23, 40 and 45", "Varied recovery texts and coaching after repeated misses", "Morning inspiration and evening encouragement"],
      sv: ["Dagens reflektion, kompislänk och fokusläge", "Ljud och vibration vid avbockning", "Milstolpar med konfetti dag 7, 23, 40 och 45", "Varierad återhämtningstext och coachning vid upprepade missar", "Morgonpepp och kvällspepp"],
      fr: ["Réflexion du jour, lien partenaire et mode concentration", "Son et vibration à chaque défi validé", "Étapes avec confettis aux jours 7, 23, 40 et 45", "Textes de reprise variés et coaching après des oublis répétés", "Inspiration du matin et encouragements du soir"],
    },
  },
  {
    version: "1.0.0",
    date: "2026-10-20",
    changes: {
      en: ["Drag-and-drop ordering with numbering", "Version number with Made by MD", "Reminder at 21 when a challenge remains", "App renamed to 45 days", "English, Swedish and French with translated challenge names", "Statistics page", "Installable app with reminders"],
      sv: ["Dra och släpp för ordning med numrering", "Versionsnummer med Made by MD", "Påminnelse kl. 21 när en utmaning återstår", "Appen heter nu 45 days", "Engelska, svenska och franska med översatta utmaningsnamn", "Statistiksida", "Installerbar app med påminnelser"],
      fr: ["Réorganisation par glisser-déposer avec numérotation", "Numéro de version avec Made by MD", "Rappel à 21 h s’il reste un défi", "L’application s’appelle 45 days", "Anglais, suédois et français avec noms de défis traduits", "Page de statistiques", "Application installable avec rappels"],
    },
  },
];

/** Display label for the newest release, e.g. "v1.5.0 · 2026-11-05". */
export const formatRelease = (r: Release) => `v${r.version} · ${r.date}`;
