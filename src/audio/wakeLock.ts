// Keeps the screen on while the metronome plays or a practice session runs
// (phone on a music stand). Each feature asks with its own reason; the lock is
// held while any reason is active. The browser drops the lock when the tab is
// hidden, so it is re-requested on return.
let lock: WakeLockSentinel | null = null;
const reasons = new Set<string>();

async function acquire(): Promise<void> {
  if (!('wakeLock' in navigator) || document.hidden || lock) return;
  try {
    lock = await navigator.wakeLock.request('screen');
    lock.addEventListener('release', () => (lock = null));
    if (reasons.size === 0) release(); // everyone stopped while we were waiting
  } catch {
    // Not allowed (battery saver, unsupported): nothing to do.
  }
}

function release(): void {
  if (lock) void lock.release();
  lock = null;
}

document.addEventListener('visibilitychange', () => {
  if (reasons.size && !lock && !document.hidden) void acquire();
});

export function keepAwake(reason: string, on: boolean): void {
  if (on) reasons.add(reason);
  else reasons.delete(reason);
  if (reasons.size) void acquire();
  else release();
}
