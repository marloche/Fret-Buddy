import { CATEGORY_LABELS, type Exercise } from '../data/exercises';
import { SUBDIVISIONS } from '../logic/tempo';
import { LoadBpmButton } from './LoadBpmButton';
import { TabView } from './TabView';

export function ExerciseCard({ exercise: e }: { exercise: Exercise }) {
  const perBeat = SUBDIVISIONS.find((s) => s.value === e.notesPerBeat)?.label.toLowerCase();
  return (
    <article className="card exercise" id={`ex-${e.id}`}>
      <header className="exercise-head">
        <h2>{e.name}</h2>
        <div className="badges">
          <span className="badge">{CATEGORY_LABELS[e.category]}</span>
          <span className="badge">{e.level}</span>
          {e.tab && (
            <span className="badge">
              {e.startBpm}→{e.goalBpm} BPM · {perBeat}
            </span>
          )}
        </div>
      </header>
      {e.steps && (
        <ol className="steps">
          {e.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      )}
      {e.tab && <TabView notes={e.tab} groupSize={e.groupSize} label={e.name} />}
      <ul className="tips">
        {e.tips.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      {e.tab && <LoadBpmButton exercise={e} />}
    </article>
  );
}
