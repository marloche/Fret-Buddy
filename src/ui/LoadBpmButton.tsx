import { useEffect, useState } from 'react';
import type { Exercise } from '../data/exercises';
import { useMetronome } from './MetronomeContext';

/** "Practice with metronome": sets BPM, 4/4 and one click per note. Doesn't start it, so you can get ready. */
export function LoadBpmButton({ exercise }: { exercise: Exercise }) {
  const m = useMetronome();
  const [done, setDone] = useState(false);
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
          bpm: exercise.startBpm,
          timeSig: '4/4',
          subdivision: exercise.notesPerBeat,
          trainer: { ...m.settings.trainer, enabled: false },
        });
        setDone(true);
      }}
    >
      {done ? `✓ Loaded ${exercise.startBpm} BPM. Press ▶ below` : `Practice with metronome (${exercise.startBpm} BPM)`}
    </button>
  );
}
