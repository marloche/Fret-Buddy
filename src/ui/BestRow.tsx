import { useEffect, useState } from 'react';
import type { Exercise } from '../data/exercises';
import { clearBest, localDate, progress, recordBest } from '../logic/bests';
import { useDrillBests } from './bestsStore';
import { useMetronome } from './MetronomeContext';

/** Personal best for one drill: progress toward the goal, and a button to mark the current tempo as clean. */
export function BestRow({ exercise: e }: { exercise: Exercise }) {
  const m = useMetronome();
  const [bests, setBests] = useDrillBests();
  const [note, setNote] = useState<string | null>(null);
  const best = bests[e.id];
  const bpm = m.settings.bpm;
  const pct = best ? progress(e.startBpm, e.goalBpm, best.value) : 0;

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 3000);
    return () => clearTimeout(t);
  }, [note]);

  const mark = () => {
    if (best && best.value >= bpm) {
      setNote(`Nice and clean. Your best is still ${best.value}.`);
      return;
    }
    setBests((prev) => recordBest(prev, e.id, bpm, localDate()));
    setNote(best ? `New best: ${bpm} BPM, up from ${best.value}.` : `First best saved: ${bpm} BPM.`);
  };
  const reset = () => {
    if (confirm(`Reset your best for "${e.name}"?`)) setBests((prev) => clearBest(prev, e.id));
  };

  return (
    <div className="best">
      <div className="best-head">
        <span>
          {best ? (
            <>
              Best <strong>{best.value}</strong> BPM
            </>
          ) : (
            'No best yet'
          )}
          <span className="muted"> · goal {e.goalBpm}</span>
        </span>
        {best && (
          <button className="link small" onClick={reset}>
            Reset
          </button>
        )}
      </div>
      <div
        className="meter"
        role="progressbar"
        aria-label="Progress toward goal tempo"
        aria-valuemin={e.startBpm}
        aria-valuemax={e.goalBpm}
        aria-valuenow={best?.value ?? e.startBpm}
      >
        <span style={{ width: `${Math.round(pct * 100)}%` }} />
      </div>
      <button className="clean-btn" onClick={mark}>
        ✓ Played it clean at {bpm} BPM
      </button>
      {note && (
        <p className="small best-note" role="status">
          {note}
        </p>
      )}
    </div>
  );
}
