// Keeps the screen on while the metronome plays (phone on a music stand).
// The browser drops the lock when the tab is hidden, so it is re-requested on return.
let lock: WakeLockSentinel | null = null;
let wanted = false;

async function acquire(): Promise<void> {
  if (!('wakeLock' in navigator) || document.hidden) return;
  try {
    lock = await navigator.wakeLock.request('screen');
    lock.addEventListener('release', () => (lock = null));
  } catch {
    // Not allowed (battery saver, unsupported): nothing to do.
  }
}

document.addEventListener('visibilitychange', () => {
  if (wanted && !lock && !document.hidden) void acquire();
});

export function keepAwake(on: boolean): void {
  wanted = on;
  if (on) {
    if (!lock) void acquire();
  } else if (lock) {
    void lock.release();
    lock = null;
  }
}
