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
             practice.ts                     session clock, routine progress, log summary (tested)
  audio/     scheduler.ts                    Web Audio lookahead scheduler
             click.ts, chime.ts              synthesized click and "next item" chime
             wakeLock.ts                     keeps the screen on while playing or practicing
  theory/    notes.ts                        note spelling (E# vs F), degrees
             build.ts                        spelled scales and chords
             fretboard.ts                    tuning → notes on the neck
             voicings.ts                     chord shapes → voicings for any root
             tab.ts                          note lists → aligned text tab, pattern helpers
  data/      scaleTypes.ts, chordQualities.ts, chordShapes.ts, exercises.ts, lessons.ts   content only
  ui/        Fretboard.tsx, ChordDiagram.tsx, TabView.tsx   diagrams and tab
             MetronomeContext.tsx            one engine for the whole app
             PracticeContext.tsx             practice session, routine and log (survives tab switches and reloads)
             MetronomeBar.tsx                always-visible bar
             pages/                          one component per tab
  store.ts                                   localStorage, keys prefixed "fret-buddy:"
```

The metronome timer only fills a 100 ms buffer; each click is scheduled at an exact time on the audio clock, so it doesn't drift. A display loop lights the beat dot when its click's time arrives.

## Keyboard

`Space` start/stop · `↑`/`↓` BPM ±1 (`Shift` ±5) · `T` tap tempo

## Adding content

All music content is typed data in `src/data/`. Theory code in `src/theory/` turns it into notes, fretboard positions and diagrams, and the tests check it. Run `npm test` after any change.

**A scale.** Add a line to `src/data/scaleTypes.ts` with its degrees:
```ts
{ id: 'hungarian-minor', name: 'Hungarian minor', degrees: ['1', '2', 'b3', '#4', '5', 'b6', '7'], blurb: '…' },
```
Degrees count up from the root (`b3` = minor third, `#4` = raised fourth). The number picks the letter, so spelling comes out right in every key.

**A chord type.** Add a line to `src/data/chordQualities.ts` (e.g. `{ id: 'm9', symbol: 'm9', name: 'Minor 9', degrees: ['1', 'b3', '5', 'b7', '9'] }`), then give it at least one shape. A test fails until every chord type has a voicing for all 12 roots.

**A chord shape.** Shapes live in `src/data/chordShapes.ts`. Strings run low E → high e, `null` = muted, `0` = open:
- `OPEN_SHAPES`: one chord at its real frets, e.g. `{ root: 'G', quality: 'maj', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, null, null, null, 3] }`.
- `MOVABLE_SHAPES`: frets relative to the root on `rootString` (0 = low E, 1 = A). These slide to every key automatically.

The tests check every shape: only chord tones, root in the bass, the 3rd/7th/etc. present, a finger on every fretted string, and no stretch wider than 5 frets.

**An exercise.** Add an entry to `src/data/exercises.ts`. Tab is a list of notes, so it always prints aligned:
```ts
{
  id: 'my-drill', name: 'My drill', category: 'legato', level: 'beginner',
  startBpm: 60, goalBpm: 120, notesPerBeat: 2,   // notesPerBeat → the metronome's clicks per beat
  tab: [n(3, 5), n(3, 7, 'h'), n(3, 5), n(3, 8, 'h')],   // n(string 1=high e…6=low E, fret, technique)
  tips: ['…'],
},
```
Helpers in `src/theory/tab.ts` build common patterns: `spider([1, 3, 2, 4], 5)`, `chromaticOn([6, 4, 5, 3], 5)`, `upAndDown([[6, 5], [6, 8], …])`. Exercises without notes (stretches) use `steps: [...]` instead of `tab`. Tests check strings, frets, tempos, and that hammer-ons go up and pull-offs go down.

**A lesson.** Add an entry to `src/data/lessons.ts`. A lesson is a list of blocks: `p` (paragraph, `**bold**` allowed), `list`, `tip`, `table`, `tab`, `chord` (root + quality, optional `voicing` index) and `scale` (root + scale id). Diagrams come from the same code as the Chords and Scales tabs; tests check every referenced chord and scale exists.

## iPhone notes

- The ring/silent switch mutes web audio. Turn silent mode off to hear the click.
- Audio stops if you switch apps; keep Fret Buddy in front while practicing.
