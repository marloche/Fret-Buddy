// The practice session lives above the pages, so the timer keeps running while you
// browse exercises or chords. Session and routine are saved, so a reload doesn't lose them.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { chime, primeChime } from '../audio/chime';
import { keepAwake } from '../audio/wakeLock';
import {
  goTo,
  itemRemaining,
  noteBpm,
  pause as pauseS,
  resume as resumeS,
  startSession,
  toLogEntry,
  type LogEntry,
  type RoutineItem,
  type Session,
} from '../logic/practice';
import { load, save, useStored } from '../store';
import { useMetronome } from './MetronomeContext';

export const DEFAULT_ROUTINE: RoutineItem[] = [
  { id: 'r1', kind: 'exercise', exerciseId: 'hand-loosen', label: 'Loosen up (no guitar)', minutes: 2 },
  { id: 'r2', kind: 'exercise', exerciseId: 'spider-1234', label: 'Spider 1-2-3-4', minutes: 5 },
  { id: 'r3', kind: 'exercise', exerciseId: 'pent-box-a', label: 'A minor pentatonic, box 1', minutes: 5 },
  { id: 'r4', kind: 'chords', label: 'Chord changes', minutes: 5 },
  { id: 'r5', kind: 'free', label: 'Play a song', minutes: 10 },
];

/** Sessions shorter than this aren't logged (accidental starts). */
const MIN_LOG_MS = 10_000;

interface PracticeApi {
  routine: RoutineItem[];
  setRoutine: (r: RoutineItem[]) => void;
  session: Session | null;
  log: LogEntry[];
  start: (withRoutine: boolean) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  /** Ends the session; saves it to the log unless `discard`. Returns whether it was saved. */
  finish: (discard?: boolean) => boolean;
  deleteEntry: (id: string) => void;
}

const Ctx = createContext<PracticeApi | null>(null);

export function PracticeProvider({ children }: { children: ReactNode }) {
  const m = useMetronome();
  const [routine, setRoutine] = useStored<RoutineItem[]>('routine', DEFAULT_ROUTINE);
  const [session, setSession] = useStored<Session | null>('session', null);
  const [log, setLog] = useStored<LogEntry[]>('log', []);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const routineRef = useRef(routine);
  routineRef.current = routine;

  const running = !!session && session.resumedAt !== null;
  useEffect(() => keepAwake('practice', running), [running]);

  // A session restored after the app was closed: don't count the time it was closed.
  // A heartbeat records when the app was last open; the session is paused at that moment.
  useEffect(() => {
    const s = sessionRef.current;
    if (s && s.resumedAt !== null) {
      const seen = Math.max(s.resumedAt, load('session.seen', s.resumedAt));
      setSession(pauseS(s, Math.min(seen, Date.now())));
    }
  }, [setSession]);
  useEffect(() => {
    if (!running) return;
    save('session.seen', Date.now());
    const id = window.setInterval(() => save('session.seen', Date.now()), 5000);
    return () => clearInterval(id);
  }, [running]);

  // Track the highest metronome tempo while the session clock runs.
  useEffect(() => {
    if (running && m.playing) setSession((s) => (s ? noteBpm(s, m.settings.bpm) : s));
  }, [running, m.playing, m.settings.bpm, setSession]);

  // Auto-advance when the current routine item's time is up.
  useEffect(() => {
    if (!running || session?.index === null) return;
    const id = window.setInterval(() => {
      const s = sessionRef.current;
      if (!s || s.resumedAt === null || s.index === null) return;
      const left = itemRemaining(s, routineRef.current, Date.now());
      if (left !== null && left <= 0) {
        const nextS = goTo(s, routineRef.current, s.index + 1, Date.now());
        chime(nextS.done ? 3 : 1);
        setSession(nextS);
      }
    }, 500);
    return () => clearInterval(id);
  }, [running, session?.index, setSession]);

  const start = useCallback(
    (withRoutine: boolean) => {
      primeChime();
      setSession(startSession(Date.now(), withRoutine && routineRef.current.length ? routineRef.current : null));
    },
    [setSession],
  );
  const pause = useCallback(() => setSession((s) => (s ? pauseS(s, Date.now()) : s)), [setSession]);
  const resume = useCallback(() => {
    primeChime();
    setSession((s) => (s ? resumeS(s, Date.now()) : s));
  }, [setSession]);
  const step = useCallback(
    (d: number) =>
      setSession((s) => {
        if (!s || s.index === null) return s;
        // From "routine complete", going back reopens the last item.
        const target = s.done && d < 0 ? s.index : s.index + d;
        return goTo(s, routineRef.current, Math.min(target, routineRef.current.length), Date.now());
      }),
    [setSession],
  );
  const finish = useCallback(
    (discard = false) => {
      const s = sessionRef.current;
      if (!s) return false;
      const entry = toLogEntry(s, Date.now(), `${s.startedAt}`);
      const save = !discard && entry.durationMs >= MIN_LOG_MS;
      if (save) setLog((l) => [entry, ...l]);
      setSession(null);
      return save;
    },
    [setLog, setSession],
  );
  const deleteEntry = useCallback((id: string) => setLog((l) => l.filter((e) => e.id !== id)), [setLog]);

  const api: PracticeApi = {
    routine,
    setRoutine,
    session,
    log,
    start,
    pause,
    resume,
    next: () => step(1),
    prev: () => step(-1),
    finish,
    deleteEntry,
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function usePractice(): PracticeApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePractice must be inside PracticeProvider');
  return v;
}

/** Re-renders the caller a few times a second while `active`, for clocks. */
export function useNow(active: boolean): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [active]);
  return active ? now : Date.now();
}
