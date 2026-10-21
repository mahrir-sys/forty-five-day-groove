import { createFileRoute } from "@tanstack/react-router";
import { Onboarding } from "@/components/challenge/Onboarding";
import { Dashboard } from "@/components/challenge/Dashboard";
import { useChallengeStore } from "@/hooks/use-challenge-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "45 dagar – din personliga utmaning" },
      {
        name: "description",
        content: "Lägg in dina utmaningar och bocka av dem varje dag i 45 dagar. Följ streak och framsteg.",
      },
      { property: "og:title", content: "45 dagar – din personliga utmaning" },
      {
        property: "og:description",
        content: "Lägg in dina utmaningar och bocka av dem varje dag i 45 dagar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { state, update, ready, today } = useChallengeStore();

  if (!ready) return <div className="min-h-screen bg-background" />;

  if (!state.startDate) {
    return (
      <Onboarding
        today={today}
        onStart={(challenges, startDate) => update(() => ({ startDate, challenges, log: {} }))}
      />
    );
  }

  return <Dashboard state={state} today={today} update={update} />;
}
