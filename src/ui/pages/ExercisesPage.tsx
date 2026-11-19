import { CATEGORY_LABELS, EXERCISES, type ExerciseCategory } from '../../data/exercises';
import { useStored } from '../../store';
import { ExerciseCard } from '../ExerciseCard';

type Filter = ExerciseCategory | 'all';

export function ExercisesPage() {
  const [filter, setFilter] = useStored<Filter>('exercises.filter', 'all');
  const cats = Object.keys(CATEGORY_LABELS) as ExerciseCategory[];
  const shown = EXERCISES.filter((e) => filter === 'all' || e.category === filter);
  return (
    <div className="page">
      <section className="card">
        <div className="seg chips" role="group" aria-label="Exercise type">
          {(['all', ...cats] as Filter[]).map((c) => (
            <button key={c} className={filter === c ? 'on' : ''} aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {c === 'all' ? 'All' : CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <p className="muted small">
          Start at the suggested BPM. Move up 5 only after three clean, relaxed run-throughs. Speed comes from accuracy.
        </p>
      </section>
      {shown.map((e) => (
        <ExerciseCard key={e.id} exercise={e} />
      ))}
    </div>
  );
}
