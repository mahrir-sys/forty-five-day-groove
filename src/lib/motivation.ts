import { addDays, dayNumber, isDayComplete, periodStatus, type AppState } from "./challenge";
import type { Language } from "./i18n";

import { personalText } from './personalization';

type Theme = "resolve" | "relationships" | "wellbeing" | "growth";
type Text = Record<Language, string>;
const quotes: Record<Theme, Text[]> = {
  resolve: [
    { en: "You don't need perfect motivation. One small action is enough to begin.", sv: "Du behöver inte perfekt motivation. En liten handling räcker för att börja.", fr: "Pas besoin d’une motivation parfaite. Un petit geste suffit pour commencer." },
    { en: "Willpower grows when you keep a small promise to yourself, one day at a time.", sv: "Viljan växer när du håller ett litet löfte till dig själv, en dag i taget.", fr: "La volonté grandit quand vous tenez une petite promesse envers vous-même, un jour à la fois." },
    { en: "Consistency isn't never falling behind. It's choosing to come back.", sv: "Att vara uthållig är inte att aldrig halka efter. Det är att välja att komma tillbaka.", fr: "La constance, ce n’est pas ne jamais prendre de retard. C’est choisir de revenir." },
  ],
  relationships: [
    { en: "A little attention, offered sincerely, can bring you closer to someone today.", sv: "Lite uppmärksamhet, given med omtanke, kan föra dig närmare någon idag.", fr: "Un peu d’attention sincère peut vous rapprocher de quelqu’un aujourd’hui." },
    { en: "Strong relationships grow through small moments of presence, not perfect words.", sv: "Starka relationer växer genom små stunder av närvaro, inte perfekta ord.", fr: "Les liens solides se nourrissent de petits moments de présence, pas de mots parfaits." },
    { en: "Listening, reaching out and showing kindness are small actions with lasting meaning.", sv: "Att lyssna, höra av sig och visa vänlighet är små handlingar som betyder mycket.", fr: "Écouter, prendre des nouvelles et faire preuve de gentillesse sont de petits gestes qui comptent longtemps." },
  ],
  wellbeing: [
    { en: "Caring for your body and mind today is a gift to your future self.", sv: "Att ta hand om kropp och sinne idag är en gåva till ditt framtida jag.", fr: "Prendre soin de votre corps et de votre esprit aujourd’hui est un cadeau pour votre avenir." },
    { en: "Choose a pace you can return to. Sustainable progress beats a perfect day.", sv: "Välj en takt du kan återvända till. Hållbara framsteg är viktigare än en perfekt dag.", fr: "Choisissez un rythme que vous pourrez retrouver. Un progrès durable vaut mieux qu’une journée parfaite." },
    { en: "Even a short pause or a little movement can be a meaningful step forward.", sv: "Även en kort paus eller lite rörelse kan vara ett betydelsefullt steg framåt.", fr: "Même une courte pause ou un peu de mouvement peut être un pas important." },
  ],
  growth: [
    { en: "Every page, every practice, every small attempt makes room for growth.", sv: "Varje sida, varje övning och varje litet försök ger utrymme att växa.", fr: "Chaque page, chaque exercice, chaque petit essai ouvre un espace pour grandir." },
    { en: "You don't have to master it today. Give yourself the chance to learn a little.", sv: "Du behöver inte bemästra det idag. Ge dig själv chansen att lära dig lite.", fr: "Vous n’avez pas à tout maîtriser aujourd’hui. Donnez-vous la chance d’apprendre un peu." },
    { en: "Progress can be quiet. The effort you put in today still matters.", sv: "Framsteg kan vara tysta. Ansträngningen du gör idag räknas ändå.", fr: "Les progrès peuvent être discrets. L’effort que vous faites aujourd’hui compte quand même." },
  ],
};

const recovery: Text[] = [{
  en: "Yesterday wasn't fully completed, and that's okay. It doesn't erase your effort. Don't give up — today is another chance, one challenge at a time.",
  sv: "Igår blev inte allt klart, och det är okej. Det tar inte bort din ansträngning. Ge inte upp — idag är en ny chans, en utmaning i taget.",
  fr: "Tout n’a pas été terminé hier, et ce n’est pas grave. Cela n’efface pas vos efforts. N’abandonnez pas : aujourd’hui est une nouvelle chance, un défi à la fois.",
}, {
  en: "Yesterday had unfinished steps. Start smaller today — coming back matters more than being perfect.",
  sv: "Igår fanns steg kvar att ta. Börja mindre idag — att komma tillbaka betyder mer än att vara perfekt.",
  fr: "Il restait des pas à faire hier. Commencez plus petit aujourd’hui : revenir compte plus que la perfection.",
}, {
  en: "You didn't finish everything yesterday. Your progress still counts. Give yourself a fresh start with one doable action.",
  sv: "Du hann inte med allt igår. Dina framsteg räknas ändå. Ge dig en ny start med en liten handling du kan göra.",
  fr: "Vous n’avez pas tout terminé hier. Vos progrès comptent toujours. Repartez avec une petite action réalisable.",
}, {
  en: "An incomplete yesterday isn't the end of your story. Be kind to yourself, adjust the plan and take the next step.",
  sv: "En ofullständig gårdag är inte slutet på din berättelse. Var snäll mot dig själv, anpassa planen och ta nästa steg.",
  fr: "Une journée incomplète n’est pas la fin de votre histoire. Soyez bienveillant, ajustez le plan et avancez d’un pas.",
}];
const celebrations: Text[] = [
  { en: "All your challenges are complete today. You showed up for yourself — let that be enough, and enjoy your evening.", sv: "Alla dina utmaningar är klara idag. Du fanns där för dig själv — låt det räcka och njut av kvällen.", fr: "Tous vos défis sont accomplis aujourd’hui. Vous avez été là pour vous-même : savourez cette réussite et votre soirée." },
  { en: "You turned today's intentions into action. Well done! Take a moment to feel proud and recharge for tomorrow.", sv: "Du gjorde dagens intentioner till handling. Starkt jobbat! Känn dig stolt en stund och samla kraft inför morgondagen.", fr: "Vous avez transformé vos intentions en actions. Bravo ! Prenez un moment pour savourer vos efforts et reprendre des forces pour demain." },
  { en: "Every challenge, checked. Today's effort is yours to celebrate — rest is part of moving forward too.", sv: "Varje utmaning, avbockad. Dagens insats är värd att fira — vila är också en del av att gå framåt.", fr: "Chaque défi est validé. Vos efforts d’aujourd’hui méritent d’être célébrés : le repos fait aussi partie du chemin." },
];

export const motivationLabels: Record<Language, { morning: string; evening: string; focus: string }> = {
  en: { morning: "A thought for today", evening: "Tonight, be proud", focus: "One step today" },
  sv: { morning: "En tanke för idag", evening: "Var stolt ikväll", focus: "Ett steg idag" },
  fr: { morning: "Une pensée pour aujourd’hui", evening: "Ce soir, soyez fier de vos efforts", focus: "Un pas aujourd’hui" },
};

/** Theme matching never changes names or progress; unknown/custom topics get general encouragement. */
export function motivationTheme(name: string): Theme {
  const value = name.toLocaleLowerCase();
  if (/relation|family|familj|famille|friend|vän|ami\b|partner|call|ringa|appel|listen|lyssna|écout|kind|snäll|gentil/.test(value)) return "relationships";
  if (/walk|promen|march|train|träna|sport|exerc|water|vatten|eau\b|sleep|sov|sömn|dorm|sommeil|medit|médit|yoga|run|löp|courir|health|hälsa|santé/.test(value)) return "wellbeing";
  if (/read|läs|lire|lecture|learn|lär|appren|study|stud|étud|write|skriv|écri|practice|öv|pratiq/.test(value)) return "growth";
  return "resolve";
}

/** Daily selection is stable across reloads/languages. Evening begins at 18:00 local time. */
export function dailyMotivation(state: AppState, today: string, localHour: number, language: Language) {
  if (!state.startDate || !state.challenges.length || periodStatus(state.startDate, today) !== "active") return null;
  const index = dayNumber(state.startDate, today) - 1;
  const challenge = state.challenges[index % state.challenges.length];
  if (!challenge) return null;
  const theme = motivationTheme(challenge.name);
  const pool = quotes[theme];
  const quote = pool[Math.floor(index / state.challenges.length) % pool.length];
  const celebration = celebrations[index % celebrations.length];
  const yesterday = addDays(today, -1);
  return {
    theme,
    challengeId: challenge.id,
    inspiration: personalText(quote?.[language] ?? quotes.resolve[0]?.[language] ?? "", state.firstName),
    recovery: localHour >= 5 && yesterday >= state.startDate && !isDayComplete(state, yesterday) ? recovery[index % recovery.length]?.[language] ?? null : null,
    celebration: (localHour >= 18 || localHour < 5) && isDayComplete(state, today) ? personalText(celebration?.[language] ?? "", state.firstName) : null,
  };
}