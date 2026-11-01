import { createFileRoute } from "@tanstack/react-router";
import { Onboarding } from "@/components/challenge/Onboarding";
import { Dashboard } from "@/components/challenge/Dashboard";
import { useChallengeStore } from "@/hooks/use-challenge-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "45 days – your personal challenge" },
      {
        name: "description",
        content: "Track your daily challenges for 45 days. Follow your streaks and progress in English, Swedish or French.",
      },
      { property: "og:title", content: "45 days – your personal challenge" },
      {
        property: "og:description",
        content: "Track your daily challenges for 45 days in English, Swedish or French.",
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
        onStart={(challenges, startDate, firstName) => update(() => ({ startDate, challenges, firstName, log: {} }))}
      />
    );
  }

  return <Dashboard state={state} today={today} update={update} />;
}
