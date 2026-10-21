<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- App language is shared by a root LanguageProvider, stored independently from challenge data after hydration, and translated through src/lib/i18n.ts; changing language must never rename existing challenges or reset progress.
- Challenge rules (period length, day numbering, stats) live as pure functions in `src/lib/challenge.ts` with tests beside it; UI only calls them, so rules stay testable in one place.
- App state is stored in the browser's localStorage via `src/hooks/use-challenge-store.ts`, read after hydration to avoid SSR mismatches; the backend never holds the full challenge data.
- Evening reminder rules live in `src/lib/reminder.ts` (pure, tested) and are used both by the client snapshot and the hourly job, so "when to remind" has one source of truth.
- Reminders use standard Web Push (VAPID via `@pushforge/builder`, workerd-safe); sender keys are generated server-side and stored in `push_keys`, so no secret passes through chat or code.
- Devices have no login: each phone owns a random secret whose hash is stored in `push_devices`; all reads/writes go through server functions with the admin client (tables have RLS and no policies).
- `public/push-sw.js` is notification-only (no fetch/caching) so it cannot serve stale app files; installability is manifest-only.
- The hourly managed HTTP schedule calls `/api/public/jobs/evening-reminders`, authenticated by `authenticateCronRequest`.
