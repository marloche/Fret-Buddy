import { timeSigById } from '../logic/tempo';
import { useMetronome, useTick } from './MetronomeContext';

/** One dot per beat; the current beat lights up, in sync with the audio clock. Dark during gap-click silence. */
export function BeatDots({ large = false }: { large?: boolean }) {
  const { settings, playing } = useMetronome();
  const tick = useTick();
  const sig = timeSigById(settings.timeSig);
  const phase = playing ? tick?.phase : undefined;
  return (
    <div className={`beat-dots${large ? ' large' : ''}${phase === 'mute' ? ' silent' : ''}`} aria-hidden="true">
      {Array.from({ length: sig.beats }, (_, i) => {
        const strong = settings.accent && (i === 0 || sig.groupStarts.includes(i));
        // Silent bars: no light either, so it's a real test of your inner time.
        const on = playing && tick?.beat === i && phase !== 'mute';
        // Changing the key on each new beat restarts the flash animation.
        const flash = on && tick?.sub === 0;
        return (
          <span
            key={flash ? `${i}-${tick?.time}` : i}
            className={`dot${strong ? ' strong' : ''}${on ? ' on' : ''}${flash ? ' flash' : ''}${
              on && i === 0 && settings.accent ? ' first' : ''
            }`}
          />
        );
      })}
    </div>
  );
}

/** Word for the current bar while playing: count-in or silent gap, otherwise null. */
function usePhaseWord(short: boolean): string | null {
  const { playing } = useMetronome();
  const tick = useTick();
  if (!playing || !tick) return null;
  if (tick.phase === 'count') return short ? 'COUNT' : 'Count-in: get ready';
  if (tick.phase === 'mute') return short ? 'SILENT' : 'Silent: keep counting';
  return null;
}

/** The label under the BPM in the bar: BPM normally, COUNT or SILENT while those bars play. */
export function BpmLabel({ fallback }: { fallback: string }) {
  const word = usePhaseWord(true);
  return <span className={`bpm-label${word ? ' phase' : ''}`}>{word ?? fallback}</span>;
}

/** Line under the big beat dots on the Tempo tab. Always takes its space so nothing jumps. */
export function PhaseLine() {
  const word = usePhaseWord(false);
  return (
    <p className="phase-line" aria-live="polite">
      {word ?? ' '}
    </p>
  );
}
