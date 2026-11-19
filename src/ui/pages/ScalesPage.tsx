import { SCALE_TYPES } from '../../data/scaleTypes';
import { useStored } from '../../store';
import { buildScale, scaleTypeById } from '../../theory/build';
import { degreeText } from '../../theory/notes';
import { Fretboard } from '../Fretboard';
import { RootPicker } from '../RootPicker';

export function ScalesPage() {
  const [root, setRoot] = useStored('scale.root', 9); // A
  const [typeId, setTypeId] = useStored('scale.type', 'minor-pent');
  const [labels, setLabels] = useStored<'names' | 'degrees'>('scale.labels', 'names');
  const type = scaleTypeById(typeId);
  const built = buildScale(root, type);

  return (
    <div className="page">
      <section className="card">
        <RootPicker label="Key" value={root} onChange={setRoot} />
        <label className="field">
          <span className="label">Scale</span>
          <select value={type.id} onChange={(e) => setTypeId(e.target.value)}>
            {SCALE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="card">
        <h2>
          {built.rootName} {type.name.toLowerCase().replace(/\(.*\)/, '').trim()}
        </h2>
        <p className="muted">{type.blurb}</p>
        <div className="tone-row" aria-label="Scale notes">
          {built.tones.map((t, i) => (
            <div key={t.degree} className={`tone${i === 0 ? ' root' : ''}`}>
              <span className="tone-name">{t.name}</span>
              <span className="tone-degree">{degreeText(t.degree)}</span>
            </div>
          ))}
        </div>
        <div className="field-inline">
          <span className="label">Show on neck</span>
          <div className="seg small-seg">
            <button className={labels === 'names' ? 'on' : ''} aria-pressed={labels === 'names'} onClick={() => setLabels('names')}>
              Note names
            </button>
            <button className={labels === 'degrees' ? 'on' : ''} aria-pressed={labels === 'degrees'} onClick={() => setLabels('degrees')}>
              Degrees
            </button>
          </div>
        </div>
        <Fretboard built={built} labels={labels} />
        <p className="muted small">
          Highlighted dots are the root ({built.rootName}). High e string on top, like tab. Scroll sideways on a phone to see the whole neck.
        </p>
      </section>
    </div>
  );
}
