import { useEffect, useState } from 'react';
import type { Exercise } from '../data/exercises';
import { useDrillBests } from './bestsStore';
import { useMetronome } from './MetronomeContext';

/**
 * "Practice with metronome": sets BPM (your best if you have one, else the suggested start),
 * 4/4 and one click per note. Doesn't start it, so you can get ready.
 */
export function LoadBpmButton({ exercise }: { exercise: Exercise }) {
  const m = useMetronome();
  const [bests] = useDrillBests();
  const [done, setDone] = useState(false);
  const best = bests[exercise.id]?.value;
  const bpm = best ?? exercise.startBpm;
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1800);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <button
      className="load-btn"
      onClick={() => {
        m.update({
          bpm,
          timeSig: '4/4',
          subdivision: exercise.notesPerBeat,
          trainer: { ...m.settings.trainer, enabled: false },
        });
        setDone(true);
      }}
    >
      {done ? `✓ Loaded ${bpm} BPM. Press ▶ below` : `Practice with metronome (${bpm} BPM${best ? ', your best' : ''})`}
    </button>
  );
}
