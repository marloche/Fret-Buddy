import { CHORD_QUALITIES } from '../../data/chordQualities';
import { useStored } from '../../store';
import { buildChord, qualityById } from '../../theory/build';
import { pcAt, STANDARD } from '../../theory/fretboard';
import { degreeText } from '../../theory/notes';
import { voicingsFor, type Voicing } from '../../theory/voicings';
import { ChordDiagram } from '../ChordDiagram';
import { RootPicker } from '../RootPicker';

export function ChordsPage() {
  const [root, setRoot] = useStored('chord.root', 0); // C
  const [qualityId, setQualityId] = useStored('chord.quality', 'maj');
  const [helpOpen, setHelpOpen] = useStored('chord.helpOpen', true);
  const quality = qualityById(qualityId);
  const chord = buildChord(root, quality);
  const voicings = voicingsFor(root, quality.id);

  return (
    <div className="page">
      <section className="card">
        <RootPicker label="Root" value={root} onChange={setRoot} />
        <div className="field">
          <span className="label">Type</span>
          <div className="seg" role="group" aria-label="Chord type">
            {CHORD_QUALITIES.map((q) => (
              <button key={q.id} className={q.id === quality.id ? 'on' : ''} aria-pressed={q.id === quality.id} onClick={() => setQualityId(q.id)}>
                {q.symbol || 'maj'}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>
          {chord.symbol} <span className="muted">· {quality.name}</span>
        </h2>
        <p className="chord-blurb">{quality.blurb}</p>
        <div className="tone-row" aria-label="Chord tones">
          {chord.tones.map((t, i) => (
            <div key={t.degree} className={`tone${i === 0 ? ' root' : ''}`}>
              <span className="tone-name">{t.name}</span>
              <span className="tone-degree">{degreeText(t.degree)}</span>
            </div>
          ))}
        </div>

        <details
          className="explain"
          open={helpOpen}
          onToggle={(e) => setHelpOpen((e.currentTarget as HTMLDetailsElement).open)}
        >
          <summary>What am I looking at?</summary>
          {voicings[0] && <Explainer chord={chord} first={voicings[0]} count={voicings.length} typeName={quality.name.toLowerCase()} />}
        </details>

        <div className="voicings">
          {voicings.map((v) => (
            <figure key={v.id} className="voicing">
              <ChordDiagram voicing={v} chord={chord} />
              <figcaption>{v.label}</figcaption>
            </figure>
          ))}
        </div>
        <p className="muted small">
          Numbers are fingers (1 index … 4 pinky). × = don't play, ○ = open string. Red = root. Notes under each string show what
          sounds.
        </p>
      </section>
    </div>
  );
}

/** Explains the tone boxes vs the notes in the diagrams, using the chord on screen. */
function Explainer({ chord, first, count, typeName }: { chord: ReturnType<typeof buildChord>; first: Voicing; count: number; typeName: string }) {
  const sounding = first.frets
    .map((f, s) => (f === null ? null : chord.byPc.get(pcAt(STANDARD, s, f))?.name))
    .filter((n): n is string => !!n);
  const toneNames = chord.tones.map((t) => t.name);
  const missing = chord.tones.filter((t) => !sounding.includes(t.name));
  const repeats = sounding.length > new Set(sounding).size;

  return (
    <div className="explain-body">
      <p>
        <strong>The boxes above are the recipe.</strong> {chord.symbol} is built from {toneNames.length} notes:{' '}
        {toneNames.join(', ')}. The small numbers say which step of the scale each one is (1 = root, 3 = third…). Those steps
        are what make it {typeName.match(/^[aeiou]/i) ? 'an' : 'a'} {typeName} chord.
      </p>
      <p>
        <strong>The diagrams are ways to play it.</strong> A guitar has six strings but this chord only has {toneNames.length}{' '}
        notes{repeats ? ', so some notes appear twice, one an octave higher' : ''}. The first shape plays{' '}
        <span className="mono">{sounding.join(' ')}</span> from the lowest string up
        {repeats ? '. Doubling notes just makes the chord fuller; it\'s still the same chord' : ''}.
        {missing.length > 0 &&
          ` It leaves out ${missing.map((t) => `${t.name} (the ${degreeText(t.degree)})`).join(' and ')}: the 5th adds little color, so shapes often skip it to stay playable.`}
      </p>
      {count > 1 && (
        <p>
          <strong>Why {count} shapes?</strong> The same notes exist all over the neck. Each box is the same chord in a different
          spot: open position near the nut, or a barre shape further up. Pick whichever is closest to the chords around it.
        </p>
      )}
      <a className="next-lesson" href="#/learn/building-chords">
        More: How chords are built →
      </a>
    </div>
  );
}
