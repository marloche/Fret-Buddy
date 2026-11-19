# Fret-Buddy (repo)

This project's notes, decisions, and rules live in my Obsidian vault. Read these before working. Claude Code loads them automatically; other tools should open them.

@C:/ObsidianVault/CLAUDE.md
@C:/ObsidianVault/10-Projects/Apps/CLAUDE.md
@C:/ObsidianVault/10-Projects/Apps/Fret-Buddy/CLAUDE.md

Inside this repo, the vault's folder and naming rules don't apply, but its safety rules and my preferences do. Record decisions in `C:/ObsidianVault/10-Projects/Apps/Fret-Buddy/Fret-Buddy-Log.md`.

## Repo specifics
- Language / framework: React + TypeScript + Vite. Installable PWA (hand-written `sw.js`, filled in at build by `vite.config.ts`).
- Install: `npm install`
- Run: `npm run dev` (no service worker in dev); `npm run build && npm run preview` for the real thing
- Test: `npm test` (Vitest; logic in `src/logic/` and `src/theory/` is pure and unit-tested)
- Lint / format: none yet; `tsc --noEmit` runs as part of `npm run build`
- Release / deploy: push to `main` triggers `.github/workflows/pages.yml` (always needs my OK)

## Conventions
- Code style: tempo/theory rules are pure functions in `src/logic/` and `src/theory/`; music content lives in `src/data/`; UI in `src/ui/`.
- The metronome engine (`src/audio/scheduler.ts`) schedules on the audio clock. Never play clicks straight from a timer.
- localStorage keys go through `src/store.ts` (prefix `fret-buddy:`).
- Sounds are synthesized, diagrams are SVG. No downloaded assets.
- Branches and commits: `main` only for now.

<!-- Setup: this assumes the vault is at C:/ObsidianVault. If it moves,
     update the paths above to match.
     The first time Claude Code sees these imports, it asks you to approve them. -->
