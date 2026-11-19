import { timeSigById } from '../logic/tempo';
import { useMetronome, useTick } from './MetronomeContext';

/** One dot per beat; the current beat lights up, in sync with the audio clock. */
export function BeatDots({ large = false }: { large?: boolean }) {
  const { settings, playing } = useMetronome();
  const tick = useTick();
  const sig = timeSigById(settings.timeSig);
  return (
    <div className={`beat-dots${large ? ' large' : ''}`} aria-hidden="true">
      {Array.from({ length: sig.beats }, (_, i) => {
        const strong = settings.accent && (i === 0 || sig.groupStarts.includes(i));
        const on = playing && tick?.beat === i;
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
