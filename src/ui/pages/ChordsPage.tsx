import { CHORD_QUALITIES } from '../../data/chordQualities';
import { useStored } from '../../store';
import { buildChord, qualityById } from '../../theory/build';
import { degreeText } from '../../theory/notes';
import { voicingsFor } from '../../theory/voicings';
import { ChordDiagram } from '../ChordDiagram';
import { RootPicker } from '../RootPicker';

export function ChordsPage() {
  const [root, setRoot] = useStored('chord.root', 0); // C
  const [qualityId, setQualityId] = useStored('chord.quality', 'maj');
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
        <div className="tone-row" aria-label="Chord tones">
          {chord.tones.map((t, i) => (
            <div key={t.degree} className={`tone${i === 0 ? ' root' : ''}`}>
              <span className="tone-name">{t.name}</span>
              <span className="tone-degree">{degreeText(t.degree)}</span>
            </div>
          ))}
        </div>
        <div className="voicings">
          {voicings.map((v) => (
            <figure key={v.id} className="voicing">
              <ChordDiagram voicing={v} chord={chord} />
              <figcaption>{v.label}</figcaption>
            </figure>
          ))}
        </div>
        <p className="muted small">
          Numbers are fingers (1 index … 4 pinky). × = don't play, ○ = open string. Highlighted = root. Notes under each string
          show what sounds.
        </p>
      </section>
    </div>
  );
}
