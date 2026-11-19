// Finger exercises and warmups. Tab is written as note lists (see src/theory/tab.ts),
// so it renders aligned on any screen. To add an exercise, add an entry here;
// tests check strings, frets and tempos are sensible.
import { chromaticOn, spider, upAndDown, type TabNote } from '../theory/tab';
import type { Subdivision } from '../logic/tempo';

export type ExerciseCategory = 'warmup' | 'chromatic' | 'skipping' | 'independence' | 'legato' | 'picking' | 'scales';

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  warmup: 'Warmups',
  chromatic: 'Chromatic',
  skipping: 'String skipping',
  independence: 'Finger independence',
  legato: 'Legato',
  picking: 'Alternate picking',
  scales: 'Scale runs',
};

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  level: 'beginner' | 'intermediate';
  /** Suggested starting tempo. Go slower if it isn't clean. */
  startBpm: number;
  /** A tempo worth working toward. */
  goalBpm: number;
  /** Notes per click: "load into metronome" sets the clicks per beat to this. */
  notesPerBeat: Subdivision;
  /** Tab, if the exercise has notes to play. */
  tab?: TabNote[];
  /** Bar line every N notes in the printed tab (defaults to 4). */
  groupSize?: number;
  /** Step-by-step instructions for exercises without tab (stretches). */
  steps?: string[];
  tips: string[];
}

// Small helpers for writing tab by hand.
const n = (s: number, f: number, tech?: TabNote['tech']): TabNote => ({ s, f, tech });
const repeat = <T,>(xs: T[], times: number): T[] => Array.from({ length: times }, () => xs).flat();

export const EXERCISES: Exercise[] = [
  // ---------- Warmups ----------
  {
    id: 'hand-loosen',
    name: 'Loosen up (no guitar)',
    category: 'warmup',
    level: 'beginner',
    startBpm: 60,
    goalBpm: 60,
    notesPerBeat: 1,
    steps: [
      'Shake your hands out loosely for 10 seconds.',
      'Make a soft fist, then open and spread the fingers wide. 10 times, slowly.',
      'Touch each fingertip to your thumb in turn, index to pinky and back. 5 rounds per hand.',
      'Slow wrist circles, 5 each direction.',
      'Hold your fretting hand palm-up and gently ease the fingers back with the other hand for 10 seconds. Never to the point of pain.',
    ],
    tips: ['This is about blood flow, not flexibility. Everything gentle.', 'Stop if anything hurts or tingles.'],
  },
  {
    id: 'open-strings',
    name: 'Open-string picking',
    category: 'warmup',
    level: 'beginner',
    startBpm: 70,
    goalBpm: 120,
    notesPerBeat: 1,
    tab: [6, 5, 4, 3, 2, 1, 2, 3, 4, 5].flatMap((s) => repeat([n(s, 0)], 4)),
    tips: [
      'Four down-strokes per string, one per click. Then try down-up.',
      'Watch your picking hand: small movements, relaxed shoulder.',
      'Rest your palm lightly near the bridge to stop strings you are not playing from ringing.',
    ],
  },
  {
    id: 'chromatic-crawl',
    name: 'Chromatic crawl up the neck',
    category: 'warmup',
    level: 'beginner',
    startBpm: 60,
    goalBpm: 100,
    notesPerBeat: 2,
    tab: [
      ...[5, 6, 7, 8, 9].flatMap((start) => [0, 1, 2, 3].map((o) => n(2, start + o))),
      ...[9, 8, 7, 6, 5].flatMap((start) => [3, 2, 1, 0].map((o) => n(2, start + o))),
    ],
    tips: [
      'One finger per fret: index on the first note, pinky on the fourth.',
      'Shift your whole hand up one fret each time, keeping the fingers close to the strings.',
    ],
  },

  // ---------- Chromatic / spider ----------
  {
    id: 'spider-1234',
    name: 'Spider 1-2-3-4',
    category: 'chromatic',
    level: 'beginner',
    startBpm: 60,
    goalBpm: 120,
    notesPerBeat: 2,
    tab: spider([1, 2, 3, 4], 5),
    tips: [
      'Index on fret 5, middle 6, ring 7, pinky 8. Keep each finger down until you need it.',
      'Press just behind the fret wire, with only as much pressure as it takes to sound clean.',
      'Once it is even at 2 notes per click, try 4 notes per click at half the BPM.',
    ],
  },
  {
    id: 'spider-1324',
    name: 'Spider 1-3-2-4',
    category: 'chromatic',
    level: 'beginner',
    startBpm: 55,
    goalBpm: 110,
    notesPerBeat: 2,
    tab: spider([1, 3, 2, 4], 5),
    tips: ['Skipping a finger makes your hand think. Go slow enough that every note is in time.', 'Keep the pinky hovering low, not flying off.'],
  },
  {
    id: 'spider-1243',
    name: 'Spider 1-2-4-3',
    category: 'chromatic',
    level: 'intermediate',
    startBpm: 55,
    goalBpm: 110,
    notesPerBeat: 2,
    tab: spider([1, 2, 4, 3], 5),
    tips: ['The ring finger after the pinky is the hard part. Isolate those two notes if they stumble.'],
  },
  {
    id: 'spider-1423',
    name: 'Spider 1-4-2-3',
    category: 'chromatic',
    level: 'intermediate',
    startBpm: 50,
    goalBpm: 100,
    notesPerBeat: 2,
    tab: spider([1, 4, 2, 3], 5),
    tips: ['Big jump from index to pinky. Keep the thumb behind the neck so the hand can open.'],
  },

  // ---------- String skipping ----------
  {
    id: 'skip-chromatic',
    name: 'Chromatic with string skips',
    category: 'skipping',
    level: 'intermediate',
    startBpm: 55,
    goalBpm: 110,
    notesPerBeat: 2,
    tab: chromaticOn([6, 4, 5, 3, 4, 2, 3, 1], 5),
    tips: [
      'The pick jumps over a string each time. Mute the skipped string with the side of your fretting finger.',
      'Alternate pick strictly (down-up-down-up) even across the skips.',
    ],
  },

  // ---------- Finger independence ----------
  {
    id: 'pairs-crossing',
    name: 'Finger pairs across strings',
    category: 'independence',
    level: 'intermediate',
    startBpm: 50,
    goalBpm: 100,
    notesPerBeat: 2,
    tab: [
      ...[6, 5, 4, 3, 2].flatMap((low) => [n(low, 5), n(low - 1, 7), n(low, 6), n(low - 1, 8)]),
      ...[2, 3, 4, 5, 6].flatMap((low) => [n(low - 1, 8), n(low, 6), n(low - 1, 7), n(low, 5)]),
    ],
    tips: [
      'Fingers 1 and 3 work as a pair, then 2 and 4, on neighboring strings.',
      'Lift each finger only as far as it must. Watch for fingers that fly up when another one moves.',
    ],
  },

  // ---------- Legato ----------
  {
    id: 'hammer-ons',
    name: 'Hammer-ons',
    category: 'legato',
    level: 'beginner',
    startBpm: 60,
    goalBpm: 120,
    notesPerBeat: 2,
    tab: [6, 5, 4, 3, 2, 1].flatMap((s) => [n(s, 5), n(s, 7, 'h'), n(s, 5), n(s, 8, 'h')]),
    tips: [
      'Pick only the first note of each pair. The hammered note comes from the finger landing hard and fast.',
      'Aim for the hammered note to be as loud as the picked one.',
    ],
  },
  {
    id: 'pull-offs',
    name: 'Pull-offs',
    category: 'legato',
    level: 'beginner',
    startBpm: 60,
    goalBpm: 120,
    notesPerBeat: 2,
    tab: [1, 2, 3, 4, 5, 6].flatMap((s) => [n(s, 7), n(s, 5, 'p'), n(s, 8), n(s, 5, 'p')]),
    tips: [
      'Keep the index finger planted on fret 5 before you pull.',
      'Pull slightly down toward the floor, flicking the string, rather than lifting straight off.',
    ],
  },
  {
    id: 'trills',
    name: 'Trills (endurance)',
    category: 'legato',
    level: 'intermediate',
    startBpm: 60,
    goalBpm: 120,
    notesPerBeat: 4,
    groupSize: 4,
    tab: [n(3, 5), ...repeat([n(3, 7, 'h'), n(3, 5, 'p')], 7), n(3, 7, 'h')],
    tips: ['Pick once, then hammer and pull for the rest. Stop the moment your hand feels tight.', 'Swap the 7 for 8 (pinky) on the next round.'],
  },

  // ---------- Alternate picking ----------
  {
    id: 'tremolo-4',
    name: 'Four per fret (single string)',
    category: 'picking',
    level: 'beginner',
    startBpm: 60,
    goalBpm: 140,
    notesPerBeat: 4,
    tab: [5, 6, 7, 8, 7, 6].flatMap((f) => repeat([n(1, f)], 4)),
    tips: [
      'Strict down-up. Each group of four starts on a down-stroke.',
      'Move from the wrist, not the elbow. Keep the pick close to the string.',
    ],
  },
  {
    id: 'string-cross',
    name: 'Two-string crossing',
    category: 'picking',
    level: 'intermediate',
    startBpm: 60,
    goalBpm: 120,
    notesPerBeat: 2,
    tab: [5, 7, 8, 7].flatMap((f) => repeat([n(2, f), n(1, f)], 2)),
    tips: [
      'Down on the B string, up on the high e. This is "outside" picking.',
      'Then flip it: up on B, down on e ("inside"). Notice which one feels easier.',
    ],
  },

  // ---------- Scale runs ----------
  {
    id: 'pent-box-a',
    name: 'A minor pentatonic, box 1',
    category: 'scales',
    level: 'beginner',
    startBpm: 60,
    goalBpm: 120,
    notesPerBeat: 2,
    tab: upAndDown([
      [6, 5], [6, 8], [5, 5], [5, 7], [4, 5], [4, 7], [3, 5], [3, 7], [2, 5], [2, 8], [1, 5], [1, 8],
    ]),
    tips: [
      'Index on fret 5 the whole way. Ring finger for 7s, pinky for 8s.',
      'Say the root (A) out loud each time you hit it: low E fret 5, D fret 7, high e fret 5.',
    ],
  },
  {
    id: 'g-major-octave',
    name: 'G major, one octave',
    category: 'scales',
    level: 'beginner',
    startBpm: 60,
    goalBpm: 120,
    notesPerBeat: 2,
    tab: upAndDown([
      [6, 3], [6, 5], [5, 2], [5, 3], [5, 5], [4, 2], [4, 4], [4, 5],
    ]),
    tips: [
      'Fingers: 2-4 / 1-2-4 / 1-3-4. Your hand stays in one spot.',
      'Sing "do re mi" along with it. It ties the shape to the sound.',
    ],
  },
];

export function exerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
