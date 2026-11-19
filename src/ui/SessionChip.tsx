import { elapsed, formatClock, itemRemaining } from '../logic/practice';
import { useNow, usePractice } from './PracticeContext';

/** Small "session running" strip above the metronome bar, shown on other tabs. */
export function SessionChip() {
  const p = usePractice();
  const s = p.session;
  const running = !!s && s.resumedAt !== null;
  const now = useNow(running);
  if (!s) return null;
  const item = s.index !== null ? p.routine[s.index] : undefined;
  const left = itemRemaining(s, p.routine, now);
  return (
    <a className="session-chip" href="#/practice">
      <span className={`rec${running ? ' on' : ''}`} aria-hidden="true" />
      {s.done
        ? 'Routine complete. Tap to save'
        : item
          ? `${item.label} · ${formatClock(left ?? 0)} left`
          : `Practice · ${formatClock(elapsed(s, now))}`}
      {!running && !s.done && ' (paused)'}
    </a>
  );
}
