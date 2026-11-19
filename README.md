# Fret Buddy

Guitar practice app: a metronome that keeps playing while you browse chords, scales, finger exercises, warmups and short lessons. Works on desktop and phone, installable, offline after the first visit.

## Setup

```bash
npm install
```

## Run, test, build

```bash
npm run dev       # dev server at http://localhost:5173
npm test          # unit tests (Vitest)
npm run build     # icons + type check + production build into dist/
npm run preview   # serve dist/ (service worker active here, not in dev)
```

## How it fits together

```
src/
  logic/     tempo.ts, tap.ts, trainer.ts   pure metronome math (tested)
  audio/     scheduler.ts                    Web Audio lookahead scheduler
             click.ts                        synthesized click sound
             wakeLock.ts                     keeps the screen on while playing
  ui/        MetronomeContext.tsx            one engine for the whole app
             MetronomeBar.tsx                always-visible bar
             pages/                          one component per tab
  store.ts                                   localStorage, keys prefixed "fret-buddy:"
```

The metronome timer only fills a 100 ms buffer; each click is scheduled at an exact time on the audio clock, so it doesn't drift. A display loop lights the beat dot when its click's time arrives.

## Keyboard

`Space` start/stop · `↑`/`↓` BPM ±1 (`Shift` ±5) · `T` tap tempo

## Adding content

Chords, scales, exercises and lessons arrive in phases 2–4 as typed data files in `src/data/`. This section will explain how to add each one.

## iPhone notes

- The ring/silent switch mutes web audio. Turn silent mode off to hear the click.
- Audio stops if you switch apps; keep Fret Buddy in front while practicing.
