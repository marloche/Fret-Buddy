// The always-visible metronome strip: beat dots, BPM with +/-, play, tap.
import { BeatDots, BpmLabel } from './BeatDots';
import { useMetronome } from './MetronomeContext';
import { useRepeatPress } from './useRepeatPress';

export function MetronomeBar() {
  const m = useMetronome();
  const minus = useRepeatPress(() => m.nudge(-1), () => m.nudge(-5));
  const plus = useRepeatPress(() => m.nudge(1), () => m.nudge(5));
  return (
    <div className="metro-bar" role="region" aria-label="Metronome">
      {m.silentHint && (
        <div className="hint" role="status">
          No sound? Turn up the volume. On older iPhones, also turn off the silent switch.
          <button className="link" onClick={m.dismissSilentHint}>
            Got it
          </button>
        </div>
      )}
      <div className="metro-bar-row">
        <BeatDots />
        <div className="bpm-group">
          <button className="icon-btn" aria-label="Slower (hold for −5)" {...minus}>
            −
          </button>
          <div className="bpm-readout" aria-live="off">
            <span className="bpm-num">{m.settings.bpm}</span>
            <BpmLabel fallback={m.settings.trainer.enabled ? 'BPM ↗' : 'BPM'} />
          </div>
          <button className="icon-btn" aria-label="Faster (hold for +5)" {...plus}>
            +
          </button>
        </div>
        <button
          className={`play-btn${m.playing ? ' playing' : ''}`}
          onClick={m.toggle}
          aria-label={m.playing ? 'Stop' : 'Start'}
        >
          {m.playing ? '■' : '▶'}
        </button>
        <button className="tap-btn" onClick={m.tap}>
          Tap
        </button>
      </div>
    </div>
  );
}
