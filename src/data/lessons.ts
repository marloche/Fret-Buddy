// Short theory lessons. Each lesson is a list of blocks; diagrams are built from the
// same theory code as the Chords and Scales pages. Text supports **bold** only.
// To add a lesson, add an entry; a test checks every referenced chord/scale exists.
import type { TabNote } from '../theory/tab';

export type Block =
  | { type: 'h'; text: string }
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'tip'; text: string }
  | { type: 'tab'; notes: TabNote[]; caption?: string; groupSize?: number }
  | { type: 'chord'; root: string; quality: string; /** Which voicing from the Chords tab (default 0). */ voicing?: number; caption?: string }
  | { type: 'scale'; root: string; scale: string; maxFret?: number; labels?: 'names' | 'degrees'; caption?: string }
  | { type: 'table'; head: string[]; rows: string[][] };

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  blocks: Block[];
}

const n = (s: number, f: number, tech?: TabNote['tech']): TabNote => ({ s, f, tech });

export const LESSONS: Lesson[] = [
  {
    id: 'reading-tab',
    title: 'Reading tab',
    summary: 'Six lines, numbers for frets, read left to right.',
    blocks: [
      { type: 'p', text: 'Tab is a picture of the neck lying flat, seen from your eyes. Each of the six lines is a string. The **top line is the thinnest string** (high e) and the bottom line is the thickest (low E). That surprises everyone at first.' },
      { type: 'p', text: 'A number on a line means "press this string at this fret and play it". 0 means play the string open. Read left to right; numbers stacked straight above each other are played together.' },
      { type: 'tab', notes: [n(6, 0), n(6, 3), n(5, 0), n(5, 2), n(4, 0), n(4, 2), n(3, 0), n(3, 2)], caption: 'Low E open, then fret 3, A open, fret 2, and so on up.', groupSize: 4 },
      { type: 'p', text: 'Letters between numbers are techniques: **h** hammer-on (pick the first note, slam a finger down for the second), **p** pull-off (the reverse), **/** slide up, **\\** slide down.' },
      { type: 'tab', notes: [n(3, 5), n(3, 7, 'h'), n(3, 5, 'p'), n(3, 7, '/'), n(3, 5, '\\')], caption: 'Pick once, then hammer, pull, slide up, slide down.', groupSize: 5 },
      { type: 'tip', text: 'Plain tab rarely shows rhythm. Listen to the song, or use the metronome with one note per click.' },
    ],
  },
  {
    id: 'chord-diagrams',
    title: 'Reading chord diagrams',
    summary: 'The neck standing up: strings are vertical, frets horizontal.',
    blocks: [
      { type: 'p', text: 'A chord box shows the neck standing upright, facing you. Vertical lines are strings, with the **low E on the left**. Horizontal lines are frets; the thick line on top is the nut.' },
      { type: 'chord', root: 'C', quality: 'maj', caption: 'Open C major' },
      { type: 'list', items: ['Dots are where you press. The number is the finger: 1 index, 2 middle, 3 ring, 4 pinky.', '○ above a string: play it open.', '× above a string: don\'t play it (avoid it or mute it with a finger).', 'Red dots and rings are the root, the note the chord is named after.'] },
      { type: 'p', text: 'When a shape sits higher on the neck, the nut is replaced by a fret number like **5fr**, telling you which fret the top of the box is. A long bar means one finger (usually the index) presses several strings at once, a **barre**.' },
      { type: 'chord', root: 'F', quality: 'maj', caption: 'F major as an E-shape barre at fret 1' },
    ],
  },
  {
    id: 'fretboard-notes',
    title: 'Notes on the fretboard',
    summary: 'Twelve notes, each fret is one step, and it all repeats at fret 12.',
    blocks: [
      { type: 'p', text: 'Music uses 12 notes, then repeats higher. Each fret raises a note by one **half step** (semitone). Going up from A: A, A♯/B♭, B, C, C♯/D♭, D, D♯/E♭, E, F, F♯/G♭, G, G♯/A♭, and A again.' },
      { type: 'tip', text: 'There is **no sharp between B and C or between E and F**. Those pairs are only one fret apart. Every other natural note pair is two frets apart.' },
      { type: 'p', text: 'The open strings are E A D G B E (low to high). A saying helps: **E**ddie **A**te **D**ynamite, **G**ood **B**ye **E**ddie. Fret 12 is the same note as the open string, one octave up, which is why fret 12 has the double dot.' },
      { type: 'scale', root: 'A', scale: 'minor', maxFret: 12, caption: 'All the natural notes (no sharps or flats), shown as the A natural minor scale.' },
      { type: 'list', ordered: true, items: ['Learn the notes on the low E string first (fret 0 E, 1 F, 3 G, 5 A, 7 B, 8 C, 10 D, 12 E).', 'Then the A string (0 A, 2 B, 3 C, 5 D, 7 E, 8 F, 10 G, 12 A).', 'Those two strings give you the root for every barre chord.'] },
    ],
  },
  {
    id: 'intervals',
    title: 'Intervals',
    summary: 'The distance between two notes, and why it gives each chord its color.',
    blocks: [
      { type: 'p', text: 'An interval is the distance between two notes, counted in half steps (frets). Intervals are what you actually hear: a minor 3rd sounds dark, a major 3rd bright, a 5th solid and open.' },
      {
        type: 'table',
        head: ['Frets', 'Name', 'Degree', 'Sound'],
        rows: [
          ['0', 'Unison', '1', 'Same note'],
          ['1', 'Minor 2nd', '♭2', 'Tense, crunchy'],
          ['2', 'Major 2nd', '2', 'A step, open'],
          ['3', 'Minor 3rd', '♭3', 'Dark, sad'],
          ['4', 'Major 3rd', '3', 'Bright, happy'],
          ['5', 'Perfect 4th', '4', 'Hanging, wants to resolve'],
          ['6', 'Tritone', '♭5 / ♯4', 'Unstable, spooky'],
          ['7', 'Perfect 5th', '5', 'Strong, "power chord"'],
          ['8', 'Minor 6th', '♭6', 'Bittersweet'],
          ['9', 'Major 6th', '6', 'Sweet, warm'],
          ['10', 'Minor 7th', '♭7', 'Bluesy, unresolved'],
          ['11', 'Major 7th', '7', 'Dreamy, leans up'],
          ['12', 'Octave', '8', 'Same note, higher'],
        ],
      },
      { type: 'p', text: 'Guitar shortcut: on neighboring strings (except G to B), the note **two frets higher on the next string** is a 5th above, and **the same fret on the next string** is a 4th above.' },
      { type: 'tab', notes: [n(6, 5), n(5, 7), n(6, 5), n(5, 5)], caption: 'A then E (a 5th), A then D (a 4th).', groupSize: 2 },
    ],
  },
  {
    id: 'building-scales',
    title: 'How major and minor scales are built',
    summary: 'Whole and half steps in a fixed pattern.',
    blocks: [
      { type: 'p', text: 'A major scale is seven notes picked by a fixed pattern of steps: **W W H W W W H** (W = whole step = 2 frets, H = half step = 1 fret). Start on any note, follow the pattern, and you get that key\'s major scale.' },
      { type: 'scale', root: 'C', scale: 'major', maxFret: 12, labels: 'degrees', caption: 'C major, labelled by degree (1 = root).' },
      { type: 'p', text: 'The natural minor scale uses **W H W W H W W**. Compared with major, its 3rd, 6th and 7th are each one fret lower (♭3, ♭6, ♭7). The ♭3 is what makes it sound minor.' },
      { type: 'tip', text: 'Every major key has a "relative minor" with the same notes, starting on the 6th degree. C major and A minor share all seven notes; only the home note changes.' },
      { type: 'p', text: 'Pentatonic scales drop two notes to five. Minor pentatonic is 1 ♭3 4 5 ♭7: no half steps, so it\'s hard to hit a clashing note. That\'s why it\'s the first scale most players learn for soloing.' },
      { type: 'scale', root: 'A', scale: 'minor-pent', maxFret: 12, caption: 'A minor pentatonic. Box 1 is the cluster at frets 5–8.' },
    ],
  },
  {
    id: 'building-chords',
    title: 'How chords are built',
    summary: 'What chord names mean, and why a shape has more notes than the recipe.',
    blocks: [
      { type: 'h', text: 'The basic recipe' },
      { type: 'p', text: 'A basic chord (a **triad**) is three notes: the root, a 3rd, and a 5th. Take a scale, play note 1, skip one, play 3, skip one, play 5. In C major that gives C, E, G: a C major chord.' },
      { type: 'h', text: 'Reading a chord name' },
      { type: 'p', text: 'The letter is the **root**, the note the chord is built on. Everything after it is the **type**, which tells you which other notes to stack on top. No type at all means major: "C" is C major, "Cm" is C minor.' },
      { type: 'tip', text: 'The confusing one: a plain **7** (C7) means the ♭7, the bluesy one. Only **maj7** (Cmaj7) uses the 7 one fret below the root. The "maj" refers to the 7th, not to the chord.' },
      {
        type: 'table',
        head: ['Type', 'Recipe', 'In C', 'Sounds like'],
        rows: [
          ['Major', '1 3 5', 'C E G', 'Bright, home'],
          ['Minor (m)', '1 ♭3 5', 'C E♭ G', 'Darker, sad'],
          ['Dominant 7 (7)', '1 3 5 ♭7', 'C E G B♭', 'Bluesy, wants to move'],
          ['Major 7 (maj7)', '1 3 5 7', 'C E G B', 'Soft, dreamy'],
          ['Minor 7 (m7)', '1 ♭3 5 ♭7', 'C E♭ G B♭', 'Mellow, smooth'],
          ['Sus2 / Sus4', '1 2 5 / 1 4 5', 'C D G / C F G', 'Open / tense, no 3rd'],
          ['Diminished (dim)', '1 ♭3 ♭5', 'C E♭ G♭', 'Tense, passing'],
          ['Augmented (aug)', '1 3 ♯5', 'C E G♯', 'Eerie, rising'],
          ['Add 9 (add9)', '1 3 5 9', 'C E G D', 'Shimmery'],
        ],
      },
      { type: 'p', text: 'The **3rd** decides major (3) or minor (♭3). The extra notes (7ths, 9ths) add color on top. Sus chords drop the 3rd, which is why they sound unfinished.' },
      { type: 'h', text: 'Why a shape shows more notes than the recipe' },
      { type: 'p', text: 'A guitar has six strings, but most chords have only three or four notes. So shapes **repeat** some notes in a higher octave. Open E major plays E B E G♯ B E: six strings, but still only E, G♯ and B (1, 3 and 5). Doubling just makes the chord fuller.' },
      { type: 'chord', root: 'E', quality: 'maj', caption: 'E major: read the note names under the strings.' },
      { type: 'chord', root: 'E', quality: 'min', caption: 'E minor: one finger lifts and the 3rd (G♯) drops to ♭3 (G).' },
      { type: 'p', text: 'It also works the other way: a shape can **leave a note out**. Open C7 plays C E B♭ C E, with no G. The 5th adds the least character, so it\'s the note guitarists drop first when a shape would be too hard to finger.' },
      { type: 'chord', root: 'C', quality: '7', caption: 'C7: no G (the 5th) anywhere, and it still sounds like C7.' },
      { type: 'h', text: 'Why there are several shapes' },
      { type: 'p', text: 'Every note exists in several places on the neck, so every chord does too. The Chords tab shows an open shape near the nut and barre shapes further up. They are the same chord; pick the one closest to where your hand already is.' },
      { type: 'tip', text: 'Compare E and Em, or A and Am, on the Chords tab. Only one note changes, the 3rd, and the mood flips.' },
    ],
  },
  {
    id: 'caged',
    title: 'The CAGED idea',
    summary: 'Five open chord shapes that tile the whole neck.',
    blocks: [
      { type: 'p', text: 'There are five open major chord shapes: **C, A, G, E and D**. Any of them can be moved up the neck if a barre (or your index finger) takes the place of the nut. Each moved shape keeps its root on the same string it had in the open chord.' },
      { type: 'list', items: ['E-shape: root on the 6th string. The classic full barre chord.', 'A-shape: root on the 5th string.', 'C, G and D shapes: harder to barre, but great for partial chords and for seeing scales.'] },
      { type: 'p', text: 'The shapes link up in the order C → A → G → E → D → C… as you move up the neck, each one sharing notes with the next. Five shapes cover all 12 frets for any chord.' },
      { type: 'chord', root: 'C', quality: 'maj', voicing: 0, caption: 'C shape: open C' },
      { type: 'chord', root: 'C', quality: 'maj', voicing: 1, caption: 'A shape: C at fret 3' },
      { type: 'chord', root: 'C', quality: 'maj', voicing: 2, caption: 'E shape: C at fret 8' },
      { type: 'tip', text: 'Start with just two: E-shape and A-shape barre chords. With the notes on the low E and A strings, they play every major and minor chord.' },
    ],
  },
  {
    id: 'metronome-practice',
    title: 'Practicing with a metronome',
    summary: 'Slow, clean, then a little faster.',
    blocks: [
      { type: 'p', text: 'The metronome isn\'t there to push you. It shows you honestly whether you\'re in time. Speed is a side effect of playing something cleanly many times.' },
      { type: 'list', ordered: true, items: ['Find a tempo where you can play the exercise **perfectly, relaxed, three times in a row**. That\'s often slower than you\'d think.', 'Raise it by 5 BPM (or less). Repeat.', 'When you make mistakes twice in a row, drop back 10 BPM. That\'s your edge; most of the gain comes from just under it.', 'Note the top clean tempo in the practice log. Next session, start 10–15 BPM below it.'] },
      { type: 'tip', text: 'The Speed trainer on the Metronome tab does steps 2–3 for you: it adds a few BPM every few bars.' },
      { type: 'p', text: 'Next step: halve the BPM and hear each click as beats 2 and 4 of a 4/4 bar (the snare backbeat). You fill in beats 1 and 3 yourself, which trains your inner pulse instead of leaning on every click.' },
      { type: 'p', text: 'Short daily sessions beat long weekly ones. Fifteen focused minutes with a plan (warmup, one technique, one scale, one song) adds up fast.' },
    ],
  },
];

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
