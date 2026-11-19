// Practice session math: elapsed time with pauses, routine progress, and log summaries.
// Pure functions; times are milliseconds from Date.now().

export interface RoutineItem {
  id: string;
  /** exercise = one from src/data/exercises.ts; scales/chords = those tabs; free = anything. */
  kind: 'exercise' | 'scales' | 'chords' | 'learn' | 'free';
  exerciseId?: string;
  label: string;
  minutes: number;
}

export interface Session {
  startedAt: number;
  /** Time banked before the current run (excludes pauses). */
  bankedMs: number;
  /** When the current run started, or null while paused. */
  resumedAt: number | null;
  /** Routine mode: index of the current item. Null = free session (no routine). */
  index: number | null;
  /** Session elapsed time when the current item started. */
  itemStartMs: number;
  /** Labels of items reached, in order. */
  visited: string[];
  maxBpm: number | null;
  done: boolean;
}

export interface LogEntry {
  id: string;
  /** ISO date-time the session started. */
  start: string;
  durationMs: number;
  items: string[];
  maxBpm: number | null;
}

export function elapsed(s: Session, now: number): number {
  return s.bankedMs + (s.resumedAt === null ? 0 : Math.max(0, now - s.resumedAt));
}

export function startSession(now: number, routine: RoutineItem[] | null): Session {
  const first = routine?.[0];
  return {
    startedAt: now,
    bankedMs: 0,
    resumedAt: now,
    index: first ? 0 : null,
    itemStartMs: 0,
    visited: first ? [first.label] : ['Free practice'],
    maxBpm: null,
    done: false,
  };
}

export function pause(s: Session, now: number): Session {
  if (s.resumedAt === null) return s;
  return { ...s, bankedMs: elapsed(s, now), resumedAt: null };
}

export function resume(s: Session, now: number): Session {
  if (s.resumedAt !== null) return s;
  return { ...s, resumedAt: now, done: false };
}

/** Milliseconds left on the current routine item (negative when over time). */
export function itemRemaining(s: Session, routine: RoutineItem[], now: number): number | null {
  if (s.index === null) return null;
  const item = routine[s.index];
  if (!item) return null;
  return item.minutes * 60_000 - (elapsed(s, now) - s.itemStartMs);
}

/** Move to another routine item (clamped). Past the last item, the routine is done and the clock pauses. */
export function goTo(s: Session, routine: RoutineItem[], index: number, now: number): Session {
  if (s.index === null) return s;
  if (index >= routine.length) return { ...pause(s, now), done: true };
  const i = Math.max(0, index);
  const label = routine[i].label;
  return {
    ...s,
    index: i,
    itemStartMs: elapsed(s, now),
    visited: s.visited.includes(label) ? s.visited : [...s.visited, label],
    done: false,
  };
}

export function noteBpm(s: Session, bpm: number): Session {
  return s.maxBpm !== null && s.maxBpm >= bpm ? s : { ...s, maxBpm: bpm };
}

export function toLogEntry(s: Session, now: number, id: string): LogEntry {
  return { id, start: new Date(s.startedAt).toISOString(), durationMs: elapsed(s, now), items: s.visited, maxBpm: s.maxBpm };
}

/** "4:05", or "1:02:09" past an hour. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const pad = (x: number) => String(x).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** "1 h 5 min", "12 min", "<1 min". */
export function formatDuration(ms: number): string {
  const min = Math.round(ms / 60_000);
  if (min < 1) return '<1 min';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? (m ? `${h} h ${m} min` : `${h} h`) : `${m} min`;
}

export function totalMinutes(routine: RoutineItem[]): number {
  return routine.reduce((a, i) => a + i.minutes, 0);
}

const DAY = 86_400_000;

/** Start of the local day containing `t`. */
function dayStart(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export interface LogSummary {
  weekMs: number;
  weekSessions: number;
  /** Consecutive days with practice, counting back from today (or yesterday if not yet today). */
  streakDays: number;
}

export function summarize(log: LogEntry[], now: number): LogSummary {
  const weekAgo = dayStart(now) - 6 * DAY; // today + previous 6 days
  const week = log.filter((e) => Date.parse(e.start) >= weekAgo);
  const days = new Set(log.map((e) => dayStart(Date.parse(e.start))));
  let day = dayStart(now);
  if (!days.has(day)) day -= DAY; // today not practiced yet: the streak can still be alive
  let streak = 0;
  // Step by calendar day (not 24 h) so daylight-saving changes don't break the streak.
  while (days.has(day)) {
    streak++;
    const d = new Date(day);
    d.setDate(d.getDate() - 1);
    day = d.getTime();
  }
  return { weekMs: week.reduce((a, e) => a + e.durationMs, 0), weekSessions: week.length, streakDays: streak };
}
