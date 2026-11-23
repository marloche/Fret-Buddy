// Chord changes drill: pick two chords, switch between them for one minute, then enter how many
// switches you made. Keeps your best per pair. You count yourself: tapping the screen would stop your hands.
import { useEffect, useRef, useState } from 'react';
import { chime, primeChime } from '../audio/chime';
import { keepAwake } from '../audio/wakeLock';
import { CHORD_QUALITIES } from '../data/chordQualities';
import { localDate, recordBest } from '../logic/bests';
import { pairKey, parsePairKey, ROUND_S, roundState, type ChordRef } from '../logic/changes';
import { useStored } from '../store';
import { buildChord, qualityById } from '../theory/build';
import { ROOTS } from '../theory/notes';
import { voicingsFor } from '../theory/voicings';
import { useChangeBests } from './bestsStore';
import { ChordDiagram } from './ChordDiagram';

const symbolOf = (c: ChordRef) => buildChord(c.root, qualityById(c.quality)).symbol;

const C = (root: number, quality = 'maj'): ChordRef => ({ root, quality });
/** Open-chord pairs most beginners work on first. */
const COMMON: [ChordRef, ChordRef][] = [
  [C(9), C(2)], // A–D
  [C(0), C(7)], // C–G
  [C(7), C(2)], // G–D
  [C(4, 'min'), C(0)], // Em–C
  [C(9, 'min'), C(4)], // Am–E
  [C(2), C(4, 'min')], // D–Em
];

export function ChordChanges() {
  const [a, setA] = useStored<ChordRef>('changes.a', C(9));
  const [b, setB] = useStored<ChordRef>('changes.b', C(2));
  const [bests, setBests] = useChangeBests();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [count, setCount] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const chimed = useRef(false);

  const key = pairKey(a, b);
  const best = bests[key];
  const state = startedAt === null ? null : roundState(now - startedAt);
  const phase = state?.phase ?? 'idle';
  const active = phase === 'countdown' || phase === 'running';

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (phase === 'done' && !chimed.current) {
      chimed.current = true;
      chime(2);
      keepAwake('changes', false);
    }
  }, [phase]);
  useEffect(() => () => keepAwake('changes', false), []);

  const go = () => {
    primeChime(); // inside the tap, so iOS lets the chime play later
    chimed.current = false;
    const t = Date.now();
    setNow(t);
    setStartedAt(t);
    setCount('');
    setNote(null);
    keepAwake('changes', true);
  };
  const stop = () => {
    setStartedAt(null);
    keepAwake('changes', false);
  };
  const save = () => {
    const n = Math.round(Number(count));
    if (!Number.isFinite(n) || n <= 0) return;
    if (best && best.value >= n) setNote(`${n} changes. Your best for this pair is still ${best.value}.`);
    else {
      setBests((prev) => recordBest(prev, key, n, localDate()));
      setNote(best ? `New best: ${n} changes, up from ${best.value}!` : `First score saved: ${n} changes.`);
    }
    setStartedAt(null);
  };
  const choose = ([x, y]: [ChordRef, ChordRef]) => {
    setA(x);
    setB(y);
    setNote(null);
  };

  const pairs = Object.entries(bests)
    .map(([k, v]) => ({ key: k, pair: parsePairKey(k), ...v }))
    .filter((p): p is typeof p & { pair: [ChordRef, ChordRef] } => p.pair !== null)
    .sort((x, y) => y.date.localeCompare(x.date));

  return (
    <article className="card changes" id="chord-changes">
      <header className="exercise-head">
        <h2>Chord changes</h2>
        <div className="badges">
          <span className="badge">1 minute</span>
          <span className="badge">beginner</span>
        </div>
      </header>
      <p>
        Switch between two chords for one minute, strumming once each time a chord lands. Count every switch ({symbolOf(a)} →{' '}
        {symbolOf(b)} is 1, back again is 2), then type the number in. A few rounds a day makes changes smooth fast.
      </p>

      <div className="field">
        <span className="label">Common pairs</span>
        <div className="seg chips">
          {COMMON.map((p) => {
            const on = pairKey(p[0], p[1]) === key;
            return (
              <button key={pairKey(p[0], p[1])} className={on ? 'on' : ''} aria-pressed={on} disabled={active} onClick={() => choose(p)}>
                {symbolOf(p[0])} – {symbolOf(p[1])}
              </button>
            );
          })}
        </div>
      </div>
      <div className="pick-pair">
        <ChordPick label="First chord" value={a} onChange={setA} disabled={active} />
        <ChordPick label="Second chord" value={b} onChange={setB} disabled={active} />
      </div>

      <div className="voicings changes-diagrams">
        {[a, b].map((c, i) => {
          const v = voicingsFor(c.root, c.quality)[0];
          const chord = buildChord(c.root, qualityById(c.quality));
          return (
            <figure key={i} className="voicing">
              {v && <ChordDiagram voicing={v} chord={chord} />}
              <figcaption>
                <strong className="changes-symbol">{chord.symbol}</strong>
              </figcaption>
            </figure>
          );
        })}
      </div>

      <div className="changes-run center">
        {phase === 'idle' && (
          <>
            <p className="muted">{best ? `Your best for ${symbolOf(a)} – ${symbolOf(b)}: ${best.value} changes` : 'No score for this pair yet.'}</p>
            <button className="load-btn" onClick={go}>
              Start 1 minute
            </button>
          </>
        )}
        {phase === 'countdown' && (
          <>
            <div className="big-clock" aria-live="assertive">
              {state!.left}
            </div>
            <p className="muted">Get your fingers on {symbolOf(a)}…</p>
          </>
        )}
        {phase === 'running' && (
          <>
            <div className="big-clock">
              0:{String(state!.left).padStart(2, '0')}
            </div>
            <p className="muted">Switch! Count in your head.</p>
            <button onClick={stop}>Stop</button>
          </>
        )}
        {phase === 'done' && (
          <form
            className="changes-entry"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <p>
              <strong>Time!</strong> How many changes in {ROUND_S} seconds?
            </p>
            <div className="step-row">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={300}
                value={count}
                aria-label="Number of changes"
                autoFocus
                onChange={(e) => setCount(e.target.value)}
              />
              <button type="submit" className="play-btn">
                Save
              </button>
              <button type="button" onClick={stop}>
                Skip
              </button>
            </div>
          </form>
        )}
        {note && (
          <p className="best-note" role="status">
            {note}
          </p>
        )}
      </div>

      {pairs.length > 0 && (
        <details className="explain">
          <summary>Your scores ({pairs.length})</summary>
          <div className="explain-body">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Pair</th>
                    <th>Best</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pairs.map((p) => (
                    <tr key={p.key}>
                      <td>
                        <button className="link" disabled={active} onClick={() => choose(p.pair)}>
                          {symbolOf(p.pair[0])} – {symbolOf(p.pair[1])}
                        </button>
                      </td>
                      <td>{p.value}</td>
                      <td>{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      )}
    </article>
  );
}

function ChordPick(p: { label: string; value: ChordRef; onChange: (c: ChordRef) => void; disabled: boolean }) {
  return (
    <div className="field">
      <span className="label">{p.label}</span>
      <div className="pick-row">
        <select
          aria-label={`${p.label}: root`}
          value={p.value.root}
          disabled={p.disabled}
          onChange={(e) => p.onChange({ ...p.value, root: Number(e.target.value) })}
        >
          {ROOTS.map((r) => (
            <option key={r.pc} value={r.pc}>
              {r.label}
            </option>
          ))}
        </select>
        <select
          aria-label={`${p.label}: type`}
          value={p.value.quality}
          disabled={p.disabled}
          onChange={(e) => p.onChange({ ...p.value, quality: e.target.value })}
        >
          {CHORD_QUALITIES.map((q) => (
            <option key={q.id} value={q.id}>
              {q.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
