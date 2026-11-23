import { CATEGORY_LABELS, EXERCISES, type ExerciseCategory } from '../../data/exercises';
import { useStored } from '../../store';
import { ChordChanges } from '../ChordChanges';
import { ExerciseCard } from '../ExerciseCard';

/** 'changes' is the chord changes drill, which isn't a tab exercise. */
type Filter = ExerciseCategory | 'all' | 'changes';

export function ExercisesPage() {
  const [filter, setFilter] = useStored<Filter>('exercises.filter', 'all');
  const cats = Object.keys(CATEGORY_LABELS) as ExerciseCategory[];
  const shown = EXERCISES.filter((e) => filter === 'all' || e.category === filter);
  const label = (c: Filter) => (c === 'all' ? 'All' : c === 'changes' ? 'Chord changes' : CATEGORY_LABELS[c]);
  return (
    <div className="page">
      <section className="card">
        <div className="seg chips" role="group" aria-label="Exercise type">
          {(['all', 'changes', ...cats] as Filter[]).map((c) => (
            <button key={c} className={filter === c ? 'on' : ''} aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {label(c)}
            </button>
          ))}
        </div>
        <p className="muted small">
          Start at the suggested BPM. Move up 5 only after three clean, relaxed run-throughs. Speed comes from accuracy. When a
          run is clean, tap "Played it clean" to save your best.
        </p>
      </section>
      {(filter === 'all' || filter === 'changes') && <ChordChanges />}
      {shown.map((e) => (
        <ExerciseCard key={e.id} exercise={e} />
      ))}
    </div>
  );
}
