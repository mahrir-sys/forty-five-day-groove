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
- Challenge rules (period length, day numbering, stats) live as pure functions in `src/lib/challenge.ts` with tests beside it; UI only calls them, so rules stay testable in one place.
- App state is stored in the browser's localStorage via `src/hooks/use-challenge-store.ts`, read after hydration to avoid SSR mismatches; there is no backend.
