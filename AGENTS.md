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
- Engagement rules live in pure tested helpers; daily reflections stay in local state and never enter shared snapshots.
- Partner sharing stores only date, period day, streak and daily totals; write access requires a hashed device secret, reads use a separate unguessable revocable capability and a narrow database function.
- Coaching is evaluated on the first local opening per period/day, after three consecutive past misses of one challenge; milestones celebrate a fully checked milestone day once per period.
- Daily motivation uses a localized curated library and pure rules in `src/lib/motivation.ts`, with local date/hour and current challenge themes; this avoids sending progress to AI or charging for daily text.
- App language is shared by a root LanguageProvider and stored independently after hydration; UI resolves challenge names through a display-only translation cache, never rewriting source names, challenge IDs or progress.
- Challenge-name translations use tested pure helpers and a public, input-bounded server function with a private persisted safety gate; AI receives only names, returns all supported languages once, and results are cached locally to avoid repeat charges.
- Challenge rules (period length, day numbering, stats) live as pure functions in `src/lib/challenge.ts` with tests beside it; UI only calls them, so rules stay testable in one place.
- App state is stored in the browser's localStorage via `src/hooks/use-challenge-store.ts`, read after hydration to avoid SSR mismatches; the backend never holds the full challenge data.
- Lunch and evening reminder rules live in `src/lib/reminder.ts` (pure, tested) and share the existing hourly job; separate sent-date fields keep lunch from suppressing evening delivery. Device snapshots include bounded language and optional name, never reflections.
- Reminder snapshots preserve legacy checked dates and add completed dates; null uses the conservative legacy rule until the device syncs, so old installed clients remain compatible.
- Challenge management uses dnd-kit handle-activated pointer and keyboard sorting with a pure id-based reorder helper, so touch scrolling and history stay independent of ordering.
- Reminders use standard Web Push (VAPID via `@pushforge/builder`, workerd-safe); sender keys are generated server-side and stored in `push_keys`, so no secret passes through chat or code.
- Devices have no login: each phone owns a random secret whose hash is stored in `push_devices`; all reads/writes go through server functions with the admin client (tables have RLS and no policies).
- `public/push-sw.js` is notification-only (no fetch/caching) so it cannot serve stale app files; installability is manifest-only.
- The hourly managed HTTP schedule calls `/api/public/jobs/evening-reminders`, authenticated by `authenticateCronRequest`.
- `challengeDate` is the shared local logical-day boundary used by the store and all progress consumers; calendar dates and real timestamps remain unchanged.
- JSON backups use a versioned, size-bounded, validated allowlist in `src/lib/backup.ts`; restore requires confirmation and excludes push-device secrets and partner capabilities.
- Release stamps are injected by Vite at build time, so the displayed stamp belongs to the bundle being viewed without introducing caching workers or update polling.
