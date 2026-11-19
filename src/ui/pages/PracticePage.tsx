import { EXERCISES, exerciseById } from '../../data/exercises';
import {
  elapsed,
  formatClock,
  formatDuration,
  itemRemaining,
  summarize,
  totalMinutes,
  type RoutineItem,
} from '../../logic/practice';
import { ExerciseCard } from '../ExerciseCard';
import { useNow, usePractice } from '../PracticeContext';

const MINUTE_CHOICES = [1, 2, 3, 5, 10, 15, 20, 30];

export function PracticePage() {
  const p = usePractice();
  return (
    <div className="page">
      {p.session ? <SessionView /> : <StartView />}
      <LogView />
    </div>
  );
}

function StartView() {
  const p = usePractice();
  return (
    <>
      <section className="card center">
        <h2>Practice session</h2>
        <p className="muted">The timer keeps running while you switch tabs. The metronome's top tempo is recorded.</p>
        <div className="step-row">
          <button className="play-btn big" onClick={() => p.start(true)} disabled={!p.routine.length}>
            ▶ Routine · {totalMinutes(p.routine)} min
          </button>
          <button className="big" onClick={() => p.start(false)}>
            Free timer
          </button>
        </div>
      </section>
      <RoutineEditor />
    </>
  );
}

function RoutineEditor() {
  const { routine, setRoutine } = usePractice();
  const update = (i: number, patch: Partial<RoutineItem>) => setRoutine(routine.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= routine.length) return;
    const next = [...routine];
    [next[i], next[j]] = [next[j], next[i]];
    setRoutine(next);
  };
  const add = (value: string) => {
    if (!value) return;
    const id = `r${Date.now()}`;
    const ex = exerciseById(value);
    const item: RoutineItem = ex
      ? { id, kind: 'exercise', exerciseId: ex.id, label: ex.name, minutes: 5 }
      : value === 'scales'
        ? { id, kind: 'scales', label: 'Scales', minutes: 5 }
        : value === 'chords'
          ? { id, kind: 'chords', label: 'Chord changes', minutes: 5 }
          : value === 'learn'
            ? { id, kind: 'learn', label: 'Read a lesson', minutes: 5 }
            : { id, kind: 'free', label: 'Play a song', minutes: 10 };
    setRoutine([...routine, item]);
  };

  return (
    <section className="card">
      <h2>My routine</h2>
      {routine.length === 0 && <p className="muted">Empty. Add something below.</p>}
      <ol className="routine">
        {routine.map((r, i) => (
          <li key={r.id}>
            <input
              className="routine-label"
              value={r.label}
              aria-label="Item name"
              onChange={(e) => update(i, { label: e.target.value })}
            />
            <select value={r.minutes} aria-label="Minutes" onChange={(e) => update(i, { minutes: Number(e.target.value) })}>
              {MINUTE_CHOICES.map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
            <span className="routine-btns">
              <button aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                ↑
              </button>
              <button aria-label="Move down" onClick={() => move(i, 1)} disabled={i === routine.length - 1}>
                ↓
              </button>
              <button aria-label="Remove" onClick={() => setRoutine(routine.filter((_, j) => j !== i))}>
                ✕
              </button>
            </span>
          </li>
        ))}
      </ol>
      <label className="field">
        <span className="label">Add to routine</span>
        <select value="" onChange={(e) => add(e.target.value)}>
          <option value="">Choose…</option>
          <optgroup label="Exercises">
            {EXERCISES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Other">
            <option value="scales">Scales</option>
            <option value="chords">Chord changes</option>
            <option value="learn">Read a lesson</option>
            <option value="free">Play a song / free play</option>
          </optgroup>
        </select>
      </label>
      <p className="muted small">Total: {totalMinutes(routine)} min. Item names can be edited, e.g. the song you're learning.</p>
    </section>
  );
}

const LINKS: Partial<Record<RoutineItem['kind'], [string, string]>> = {
  scales: ['#/scales', 'Open Scales'],
  chords: ['#/chords', 'Open Chords'],
  learn: ['#/learn', 'Open Learn'],
};

function SessionView() {
  const p = usePractice();
  const s = p.session!;
  const running = s.resumedAt !== null;
  const now = useNow(running);
  const total = elapsed(s, now);
  const item = s.index !== null ? p.routine[s.index] : undefined;
  const left = itemRemaining(s, p.routine, now);
  const exercise = item?.exerciseId ? exerciseById(item.exerciseId) : undefined;
  const link = item ? LINKS[item.kind] : undefined;

  const finish = () => {
    const saved = p.finish();
    if (!saved) alert('Sessions under 10 seconds are not saved.');
  };

  return (
    <>
      <section className="card center session">
        {s.done ? (
          <h2>Routine complete ✓</h2>
        ) : item ? (
          <>
            <p className="muted small">
              Item {s.index! + 1} of {p.routine.length}
            </p>
            <h2>{item.label}</h2>
            <div className={`big-clock${left !== null && left < 10_000 ? ' warn' : ''}`}>{formatClock(left ?? 0)}</div>
          </>
        ) : (
          <>
            <h2>Free practice</h2>
            <div className="big-clock">{formatClock(total)}</div>
          </>
        )}
        <p className="muted">
          Session {formatClock(total)}
          {s.maxBpm !== null && ` · top tempo ${s.maxBpm} BPM`}
          {!running && !s.done && ' · paused'}
        </p>
        <div className="step-row">
          {s.index !== null && (
            <button onClick={p.prev} disabled={s.index === 0 && !s.done} aria-label="Previous item">
              ⏮
            </button>
          )}
          {running ? (
            <button className="play-btn playing" onClick={p.pause}>
              ❚❚ Pause
            </button>
          ) : (
            !s.done && (
              <button className="play-btn" onClick={p.resume}>
                ▶ Resume
              </button>
            )
          )}
          {s.index !== null && !s.done && (
            <button onClick={p.next} aria-label="Next item">
              ⏭
            </button>
          )}
        </div>
        <div className="step-row">
          <button className="play-btn" onClick={finish}>
            Finish &amp; save
          </button>
          <button
            onClick={() => {
              if (confirm('Discard this session without saving it?')) p.finish(true);
            }}
          >
            Discard
          </button>
        </div>
        {link && !s.done && (
          <a className="next-lesson" href={link[0]}>
            {link[1]} →
          </a>
        )}
      </section>
      {exercise && !s.done && <ExerciseCard exercise={exercise} />}
    </>
  );
}

function LogView() {
  const p = usePractice();
  const sum = summarize(p.log, Date.now());
  return (
    <section className="card">
      <h2>Practice log</h2>
      <div className="stats">
        <div>
          <strong>{formatDuration(sum.weekMs)}</strong>
          <span className="muted small">last 7 days</span>
        </div>
        <div>
          <strong>{sum.weekSessions}</strong>
          <span className="muted small">sessions</span>
        </div>
        <div>
          <strong>{sum.streakDays}</strong>
          <span className="muted small">day streak</span>
        </div>
      </div>
      {p.log.length === 0 ? (
        <p className="muted">No sessions yet. Finished sessions show up here.</p>
      ) : (
        <ul className="log">
          {p.log.map((e) => (
            <li key={e.id}>
              <div className="log-head">
                <strong>
                  {new Date(e.start).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}{' '}
                  <span className="muted">{new Date(e.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </strong>
                <span>
                  {formatDuration(e.durationMs)}
                  {e.maxBpm !== null && ` · ${e.maxBpm} BPM`}
                </span>
              </div>
              <div className="muted small">{e.items.join(' · ')}</div>
              <button
                className="link small"
                onClick={() => {
                  if (confirm('Delete this log entry? This cannot be undone.')) p.deleteEntry(e.id);
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
