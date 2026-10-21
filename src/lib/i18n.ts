export const LANGUAGES = ["en", "sv", "fr"] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";
export const LANGUAGE_STORAGE_KEY = "challenge45:language";
export function resolveLanguage(value: unknown): Language {
  return LANGUAGES.find((language) => language === value) ?? DEFAULT_LANGUAGE;
}
const messages = {
  "Utmaningen": {
    "en": "The challenge",
    "sv": "Utmaningen",
    "fr": "Le défi"
  },
  "dagar.": {
    "en": "days.",
    "sv": "dagar.",
    "fr": "jours."
  },
  "Inga ursäkter.": {
    "en": "No excuses.",
    "sv": "Inga ursäkter.",
    "fr": "Sans excuses."
  },
  "Dina utmaningar": {
    "en": "Your challenges",
    "sv": "Dina utmaningar",
    "fr": "Vos défis"
  },
  "T.ex. Kallbad varje morgon": {
    "en": "E.g. Cold plunge every morning",
    "sv": "T.ex. Kallbad varje morgon",
    "fr": "Ex. Bain froid chaque matin"
  },
  "Ny utmaning": {
    "en": "New challenge",
    "sv": "Ny utmaning",
    "fr": "Nouveau défi"
  },
  "Lägg till": {
    "en": "Add",
    "sv": "Lägg till",
    "fr": "Ajouter"
  },
  "Startdatum": {
    "en": "Start date",
    "sv": "Startdatum",
    "fr": "Date de début"
  },
  "Lägg till minst en utmaning för att börja.": {
    "en": "Add at least one challenge to begin.",
    "sv": "Lägg till minst en utmaning för att börja.",
    "fr": "Ajoutez au moins un défi pour commencer."
  },
  "Träna 45 min": {
    "en": "Exercise for 45 min",
    "sv": "Träna 45 min",
    "fr": "Faire du sport pendant 45 min"
  },
  "Drick 3 liter vatten": {
    "en": "Drink 3 litres of water",
    "sv": "Drick 3 liter vatten",
    "fr": "Boire 3 litres d’eau"
  },
  "Läs 10 sidor": {
    "en": "Read 10 pages",
    "sv": "Läs 10 sidor",
    "fr": "Lire 10 pages"
  },
  "Inget socker": {
    "en": "No sugar",
    "sv": "Inget socker",
    "fr": "Pas de sucre"
  },
  "Promenad utomhus": {
    "en": "Go for a walk outdoors",
    "sv": "Promenad utomhus",
    "fr": "Marcher en plein air"
  },
  "Meditera 10 min": {
    "en": "Meditate for 10 min",
    "sv": "Meditera 10 min",
    "fr": "Méditer pendant 10 min"
  },
  "Idag": {
    "en": "Today",
    "sv": "Idag",
    "fr": "Aujourd’hui"
  },
  "Igår": {
    "en": "Yesterday",
    "sv": "Igår",
    "fr": "Hier"
  },
  "Statistik": {
    "en": "Statistics",
    "sv": "Statistik",
    "fr": "Statistiques"
  },
  "dag kvar": {
    "en": "day left",
    "sv": "dag kvar",
    "fr": "jour restant"
  },
  "dagar kvar": {
    "en": "days left",
    "sv": "dagar kvar",
    "fr": "jours restants"
  },
  "Perioden är avslutad": {
    "en": "The period has ended",
    "sv": "Perioden är avslutad",
    "fr": "La période est terminée"
  },
  "hela dagar": {
    "en": "complete days",
    "sv": "hela dagar",
    "fr": "jours complets"
  },
  "Dag": {
    "en": "Day",
    "sv": "Dag",
    "fr": "Jour"
  },
  "Streak": {
    "en": "Streak",
    "sv": "Streak",
    "fr": "Série"
  },
  "Hela dagar": {
    "en": "Complete days",
    "sv": "Hela dagar",
    "fr": "Jours complets"
  },
  "Missade": {
    "en": "Missed",
    "sv": "Missade",
    "fr": "Manqués"
  },
  "Föregående dag": {
    "en": "Previous day",
    "sv": "Föregående dag",
    "fr": "Jour précédent"
  },
  "Nästa dag": {
    "en": "Next day",
    "sv": "Nästa dag",
    "fr": "Jour suivant"
  },
  "klara": {
    "en": "done",
    "sv": "klara",
    "fr": "terminés"
  },
  "Inga utmaningar än. Lägg till via inställningarna uppe till höger.": {
    "en": "No challenges yet.",
    "sv": "Inga utmaningar än. Lägg till via inställningarna uppe till höger.",
    "fr": "Aucun défi pour le moment."
  },
  "Dagen är klar. Starkt jobbat!": {
    "en": "Today is complete. Great work!",
    "sv": "Dagen är klar. Starkt jobbat!",
    "fr": "Journée terminée. Bravo !"
  },
  "Hela dagen avklarad!": {
    "en": "All done for this day!",
    "sv": "Hela dagen avklarad!",
    "fr": "Journée entièrement réussie !"
  },
  "Översikt": {
    "en": "Overview",
    "sv": "Översikt",
    "fr": "Vue d’ensemble"
  },
  "avklarat": {
    "en": "complete",
    "sv": "avklarat",
    "fr": "terminé"
  },
  "Klar": {
    "en": "Done",
    "sv": "Klar",
    "fr": "Terminé"
  },
  "Delvis": {
    "en": "Partial",
    "sv": "Delvis",
    "fr": "Partiel"
  },
  "Missad": {
    "en": "Missed",
    "sv": "Missad",
    "fr": "Manqué"
  },
  "Kommande": {
    "en": "Upcoming",
    "sv": "Kommande",
    "fr": "À venir"
  },
  "Hantera utmaningar": {
    "en": "Manage challenges",
    "sv": "Hantera utmaningar",
    "fr": "Gérer les défis"
  },
  "Lägg till eller ta bort. Ändringar gäller alla dagar.": {
    "en": "Add, rename or remove. Changes apply to every day.",
    "sv": "Lägg till eller ta bort. Ändringar gäller alla dagar.",
    "fr": "Ajoutez, renommez ou supprimez. Les modifications concernent tous les jours."
  },
  "Starta om från dag 1?": {
    "en": "Restart from day 1 ?",
    "sv": "Starta om från dag 1?",
    "fr": "Recommencer au jour 1 ?"
  },
  "Dina utmaningar behålls, men alla avbockningar raderas och perioden startar idag.": {
    "en": "Your challenges stay, but all checkmarks are deleted and the period starts today.",
    "sv": "Dina utmaningar behålls, men alla avbockningar raderas och perioden startar idag.",
    "fr": "Vos défis sont conservés, mais toutes les validations sont effacées et la période commence aujourd’hui."
  },
  "Avbryt": {
    "en": "Cancel",
    "sv": "Avbryt",
    "fr": "Annuler"
  },
  "Starta om": {
    "en": "Restart",
    "sv": "Starta om",
    "fr": "Recommencer"
  },
  "Radera allt": {
    "en": "Delete everything",
    "sv": "Radera allt",
    "fr": "Tout supprimer"
  },
  "Radera allt?": {
    "en": "Delete everything?",
    "sv": "Radera allt?",
    "fr": "Tout supprimer ?"
  },
  "Alla utmaningar och all historik tas bort. Det går inte att ångra.": {
    "en": "All challenges and history will be deleted. This cannot be undone.",
    "sv": "Alla utmaningar och all historik tas bort. Det går inte att ångra.",
    "fr": "Tous les défis et leur historique seront supprimés. Cette action est irréversible."
  },
  "Radera": {
    "en": "Delete",
    "sv": "Radera",
    "fr": "Supprimer"
  },
  "Nytt namn": {
    "en": "New name",
    "sv": "Nytt namn",
    "fr": "Nouveau nom"
  },
  "Spara namn": {
    "en": "Save name",
    "sv": "Spara namn",
    "fr": "Enregistrer le nom"
  },
  "Tillbaka": {
    "en": "Back",
    "sv": "Tillbaka",
    "fr": "Retour"
  },
  "Starta en period för att se statistik.": {
    "en": "Start a period to see statistics.",
    "sv": "Starta en period för att se statistik.",
    "fr": "Commencez une période pour voir les statistiques."
  },
  "Totalt": {
    "en": "Overall",
    "sv": "Totalt",
    "fr": "Total"
  },
  "Per utmaning": {
    "en": "By challenge",
    "sv": "Per utmaning",
    "fr": "Par défi"
  },
  "Inga utmaningar än.": {
    "en": "No challenges yet.",
    "sv": "Inga utmaningar än.",
    "fr": "Aucun défi pour le moment."
  },
  "Nuvarande streak": {
    "en": "Current streak",
    "sv": "Nuvarande streak",
    "fr": "Série actuelle"
  },
  "Bästa": {
    "en": "Best",
    "sv": "Bästa",
    "fr": "Record"
  },
  "Kollar notiser…": {
    "en": "Checking notifications…",
    "sv": "Kollar notiser…",
    "fr": "Vérification des notifications…"
  },
  "Kvällspåminnelser är tillåtna": {
    "en": "Evening reminders are enabled",
    "sv": "Kvällspåminnelser är tillåtna",
    "fr": "Les rappels du soir sont activés"
  },
  "Du får en notis runt kl 20 de kvällar du inte har bockat av något. Missas den försöker appen igen kl 21.": {
    "en": "You receive a notification around 8 pm on evenings when nothing is checked off. If missed, the app tries again at 9 pm.",
    "sv": "Du får en notis runt kl 20 de kvällar du inte har bockat av något. Missas den försöker appen igen kl 21.",
    "fr": "Vous recevez une notification vers 20 h si aucun défi n’est validé. En cas d’échec, l’application réessaie à 21 h."
  },
  "Kvällspåminnelser är av": {
    "en": "Evening reminders are off",
    "sv": "Kvällspåminnelser är av",
    "fr": "Les rappels du soir sont désactivés"
  },
  "Tryck på knappen nedan och välj Tillåt när telefonen frågar.": {
    "en": "Tap the button below and choose Allow when your phone asks.",
    "sv": "Tryck på knappen nedan och välj Tillåt när telefonen frågar.",
    "fr": "Appuyez sur le bouton ci-dessous et choisissez Autoriser lorsque votre téléphone vous le demande."
  },
  "Notiser är blockerade": {
    "en": "Notifications are blocked",
    "sv": "Notiser är blockerade",
    "fr": "Les notifications sont bloquées"
  },
  "Telefonen tillåter inte notiser från appen. Följ steg 4 i guiden nedan och tryck sedan på Kolla igen.": {
    "en": "Your phone is blocking app notifications. Follow step 4 below, then tap Check again.",
    "sv": "Telefonen tillåter inte notiser från appen. Följ steg 4 i guiden nedan och tryck sedan på Kolla igen.",
    "fr": "Votre téléphone bloque les notifications de l’application. Suivez l’étape 4 ci-dessous, puis appuyez sur Vérifier à nouveau."
  },
  "Öppna appen på din telefon": {
    "en": "Open the app on your phone",
    "sv": "Öppna appen på din telefon",
    "fr": "Ouvrez l’application sur votre téléphone"
  },
  "Notiser kan inte slås på i den här förhandsvisningen. Öppna appens länk i Chrome på din Android och följ guiden.": {
    "en": "Notifications cannot be enabled in this preview. Open the app’s link in Chrome on Android and follow the guide.",
    "sv": "Notiser kan inte slås på i den här förhandsvisningen. Öppna appens länk i Chrome på din Android och följ guiden.",
    "fr": "Les notifications ne peuvent pas être activées dans cet aperçu. Ouvrez le lien de l’application dans Chrome sur Android et suivez le guide."
  },
  "Den här webbläsaren saknar notiser": {
    "en": "This browser does not support notifications",
    "sv": "Den här webbläsaren saknar notiser",
    "fr": "Ce navigateur ne prend pas en charge les notifications"
  },
  "Öppna appen i Chrome på Android för att få kvällspåminnelser.": {
    "en": "Open the app in Chrome on Android to receive evening reminders.",
    "sv": "Öppna appen i Chrome på Android för att få kvällspåminnelser.",
    "fr": "Ouvrez l’application dans Chrome sur Android pour recevoir les rappels du soir."
  },
  "Påminnelser": {
    "en": "Reminders",
    "sv": "Påminnelser",
    "fr": "Rappels"
  },
  "Kvällspåminnelse": {
    "en": "Evening reminder",
    "sv": "Kvällspåminnelse",
    "fr": "Rappel du soir"
  },
  "Har du inte bockat av något när kvällen kommer får du en notis, även när appen är stängd.": {
    "en": "If nothing is checked off by evening, you receive a notification even when the app is closed.",
    "sv": "Har du inte bockat av något när kvällen kommer får du en notis, även när appen är stängd.",
    "fr": "Si aucun défi n’est validé le soir, vous recevez une notification, même lorsque l’application est fermée."
  },
  "Slå på kvällspåminnelse": {
    "en": "Enable evening reminder",
    "sv": "Slå på kvällspåminnelse",
    "fr": "Activer le rappel du soir"
  },
  "Skicka testnotis": {
    "en": "Send test notification",
    "sv": "Skicka testnotis",
    "fr": "Envoyer une notification de test"
  },
  "Stäng av påminnelser": {
    "en": "Disable reminders",
    "sv": "Stäng av påminnelser",
    "fr": "Désactiver les rappels"
  },
  "Kolla igen": {
    "en": "Check again",
    "sv": "Kolla igen",
    "fr": "Vérifier à nouveau"
  },
  "Appen är installerad på telefonen": {
    "en": "The app is installed on your phone",
    "sv": "Appen är installerad på telefonen",
    "fr": "L’application est installée sur votre téléphone"
  },
  "Lägg appen på hemskärmen": {
    "en": "Add the app to your home screen",
    "sv": "Lägg appen på hemskärmen",
    "fr": "Ajoutez l’application à votre écran d’accueil"
  },
  "Installera": {
    "en": "Install",
    "sv": "Installera",
    "fr": "Installer"
  },
  "Appen är inte installerad än. Se steg 1 nedan.": {
    "en": "The app is not installed yet. See step 1 below.",
    "sv": "Appen är inte installerad än. Se steg 1 nedan.",
    "fr": "L’application n’est pas encore installée. Consultez l’étape 1 ci-dessous."
  },
  "Så slår du på notiser på Android": {
    "en": "Notifications on Android",
    "sv": "Så slår du på notiser på Android",
    "fr": "Notifications sur Android"
  },
  "Installera appen": {
    "en": "Install the app",
    "sv": "Installera appen",
    "fr": "Installer l’application"
  },
  "Öppna från hemskärmen": {
    "en": "Open from your home screen",
    "sv": "Öppna från hemskärmen",
    "fr": "Ouvrir depuis l’écran d’accueil"
  },
  "Tillåt notiser": {
    "en": "Allow notifications",
    "sv": "Tillåt notiser",
    "fr": "Autoriser les notifications"
  },
  "Om notiser är blockerade": {
    "en": "If notifications are blocked",
    "sv": "Om notiser är blockerade",
    "fr": "Si les notifications sont bloquées"
  },
  "Testa": {
    "en": "Test",
    "sv": "Testa",
    "fr": "Tester"
  },
  "Något gick fel. Kontrollera att du har internet och försök igen.": {
    "en": "Something went wrong. Check your internet connection and try again.",
    "sv": "Något gick fel. Kontrollera att du har internet och försök igen.",
    "fr": "Une erreur est survenue. Vérifiez votre connexion Internet et réessayez."
  },
  "Kvällspåminnelsen är på": {
    "en": "Evening reminder enabled",
    "sv": "Kvällspåminnelsen är på",
    "fr": "Rappel du soir activé"
  },
  "Notiser är blockerade. Följ guiden för att tillåta dem.": {
    "en": "Notifications are blocked. Follow the guide to allow them.",
    "sv": "Notiser är blockerade. Följ guiden för att tillåta dem.",
    "fr": "Les notifications sont bloquées. Suivez le guide pour les autoriser."
  },
  "Kvällspåminnelsen är avstängd": {
    "en": "Evening reminder disabled",
    "sv": "Kvällspåminnelsen är avstängd",
    "fr": "Rappel du soir désactivé"
  },
  "Testnotis skickad. Den bör synas inom några sekunder.": {
    "en": "Test notification sent. It should appear within a few seconds.",
    "sv": "Testnotis skickad. Den bör synas inom några sekunder.",
    "fr": "Notification de test envoyée. Elle devrait apparaître dans quelques secondes."
  },
  "Telefonen är inte längre kopplad. Slå på påminnelsen igen.": {
    "en": "Your phone is no longer connected. Enable reminders again.",
    "sv": "Telefonen är inte längre kopplad. Slå på påminnelsen igen.",
    "fr": "Votre téléphone n’est plus connecté. Réactivez les rappels."
  },
  "Testnotisen kunde inte skickas. Försök igen om en stund.": {
    "en": "Could not send the test notification. Try again shortly.",
    "sv": "Testnotisen kunde inte skickas. Försök igen om en stund.",
    "fr": "Impossible d’envoyer la notification de test. Réessayez dans quelques instants."
  },
  "language": {
    "en": "Language",
    "sv": "Språk",
    "fr": "Langue"
  },
  "intro": {
    "en": "Add the challenges you want to complete every day. Check them off for {days} days in a row.",
    "sv": "Lägg till de utmaningar du ska klara varje dag. Bocka av dem i {days} dagar i rad.",
    "fr": "Ajoutez les défis à réaliser chaque jour. Validez-les pendant {days} jours consécutifs."
  },
  "start": {
    "en": "Start {days} days",
    "sv": "Starta {days} dagar",
    "fr": "Commencer les {days} jours"
  },
  "days": {
    "en": "days",
    "sv": "dagar",
    "fr": "jours"
  },
  "starts": {
    "en": "Starts {date}",
    "sv": "Startar {date}",
    "fr": "Début le {date}"
  },
  "remove": {
    "en": "Remove {name}",
    "sv": "Ta bort {name}",
    "fr": "Supprimer {name}"
  },
  "rename": {
    "en": "Rename {name}",
    "sv": "Byt namn på {name}",
    "fr": "Renommer {name}"
  },
  "restartPeriod": {
    "en": "Start a new {days}-day period",
    "sv": "Starta ny {days}-dagarsperiod",
    "fr": "Commencer une nouvelle période de {days} jours"
  },
  "gridLabel": {
    "en": "Day {n}, {done} of {total} done",
    "sv": "Dag {n}, {done} av {total} klara",
    "fr": "Jour {n}, {done} sur {total} terminés"
  },
  "checkedDays": {
    "en": "{checked} of {days} days checked off",
    "sv": "{checked} av {days} dagar avbockade",
    "fr": "{checked} jours validés sur {days}"
  },
  "elapsedDays": {
    "en": "{days} days elapsed",
    "sv": "{days} dagar har gått",
    "fr": "{days} jours écoulés"
  },
  "guideInstall": {
    "en": "Open the app’s link in Chrome. Tap ⋮ in the top right and choose Install app or Add to Home screen.",
    "sv": "Öppna appens länk i Chrome. Tryck på ⋮ uppe till höger och välj Installera app eller Lägg till på startskärmen.",
    "fr": "Ouvrez le lien de l’application dans Chrome. Appuyez sur ⋮ en haut à droite, puis sur Installer l’application ou Ajouter à l’écran d’accueil."
  },
  "guideOpen": {
    "en": "Launch 45 days from the home screen icon, not from Chrome.",
    "sv": "Starta 45 dagar från ikonen på hemskärmen, inte från Chrome.",
    "fr": "Ouvrez 45 jours depuis l’icône de l’écran d’accueil, et non depuis Chrome."
  },
  "guideAllow": {
    "en": "Tap the bell, then Enable evening reminder. Choose Allow when your phone asks.",
    "sv": "Tryck på klockan, sedan Slå på kvällspåminnelse. Välj Tillåt när telefonen frågar.",
    "fr": "Appuyez sur la cloche, puis sur Activer le rappel du soir. Choisissez Autoriser lorsque votre téléphone vous le demande."
  },
  "guideBlocked": {
    "en": "Press and hold the app icon → App info → Notifications → enable. In Chrome: ⋮ → Settings → Site settings → Notifications, then allow this app.",
    "sv": "Håll fingret på appikonen → Appinfo → Aviseringar → slå på. I Chrome: ⋮ → Inställningar → Webbplatsinställningar → Aviseringar och tillåt appen.",
    "fr": "Appuyez longuement sur l’icône → Informations sur l’application → Notifications → activez-les. Dans Chrome : ⋮ → Paramètres → Paramètres des sites → Notifications, puis autorisez l’application."
  },
  "guideTest": {
    "en": "Tap Send test notification. If it arrives, you are ready.",
    "sv": "Tryck på Skicka testnotis. Kommer notisen fram är du klar.",
    "fr": "Appuyez sur Envoyer une notification de test. Si elle arrive, tout est prêt."
  },
  "guideBattery": {
    "en": "Notifications late or missing? In Android settings → Apps → Chrome → Battery, choose Unrestricted so battery saver does not block notifications.",
    "sv": "Kommer notisen sent eller inte alls? Gå till Android-inställningar → Appar → Chrome → Batteri och välj Obegränsad så att batterisparläget inte stoppar notiserna.",
    "fr": "Notifications en retard ou absentes ? Dans les paramètres Android → Applications → Chrome → Batterie, choisissez Sans restriction pour éviter le blocage par l’économiseur de batterie."
  }
} as const;
export type MessageKey = keyof typeof messages;
export function translate(language: Language, key: MessageKey, values: Record<string, string | number> = {}): string {
  return messages[key][language].replace(/\{(\w+)\}/g, (match, name: string) => String(values[name] ?? match));
}
const suggestionKeys: MessageKey[] = ["Träna 45 min", "Drick 3 liter vatten", "Läs 10 sidor", "Inget socker", "Promenad utomhus", "Meditera 10 min"];
export function getSuggestions(language: Language): string[] {
  return suggestionKeys.map((key) => translate(language, key));
}
