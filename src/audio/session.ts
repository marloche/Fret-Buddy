// iPhone: Web Audio normally obeys the ring/silent switch, so the click goes quiet on a muted phone.
// Newer Safari has the Audio Session API: type 'playback' makes the page behave like a music app
// and play through the switch. Older browsers don't have it; there the one-time hint still helps.
type AudioSessionNavigator = Navigator & { audioSession?: { type: string } };

export function preferPlayback(): void {
  const session = (navigator as AudioSessionNavigator).audioSession;
  if (!session) return;
  try {
    session.type = 'playback';
  } catch {
    // Unsupported value on some versions: keep the default.
  }
}
