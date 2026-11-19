// Full metronome controls. The engine itself lives in MetronomeContext.
import { useState } from 'react';
import { BPM_MAX, BPM_MIN, SUBDIVISIONS, TIME_SIGS } from '../../logic/tempo';
import type { Trainer } from '../../logic/trainer';
import { BeatDots } from '../BeatDots';
import { useMetronome } from '../MetronomeContext';

export function MetronomePage() {
  const m = useMetronome();
  const s = m.settings;
  const setTrainer = (patch: Partial<Trainer>) => m.update({ trainer: { ...s.trainer, ...patch } });

  return (
    <div className="page metronome-page">
      <section className="card center">
        <BeatDots large />
        <div className="big-bpm">
          <BpmInput value={s.bpm} onCommit={m.setBpm} />
          <span>BPM</span>
        </div>
        <input
          className="bpm-slider"
          type="range"
          min={BPM_MIN}
          max={BPM_MAX}
          value={s.bpm}
          aria-label="BPM slider"
          onChange={(e) => m.setBpm(Number(e.target.value))}
        />
        <div className="step-row">
          {[-5, -1, 1, 5].map((d) => (
            <button key={d} onClick={() => m.nudge(d)}>
              {d > 0 ? `+${d}` : `−${-d}`}
            </button>
          ))}
        </div>
        <div className="step-row">
          <button className={`play-btn big${m.playing ? ' playing' : ''}`} onClick={m.toggle}>
            {m.playing ? '■ Stop' : '▶ Start'}
          </button>
          <button className="tap-btn big" onClick={m.tap}>
            Tap tempo
          </button>
        </div>
        <p className="muted small keys-hint">
          Keys: <kbd>Space</kbd> start/stop · <kbd>↑</kbd>
          <kbd>↓</kbd> ±1 (<kbd>Shift</kbd> ±5) · <kbd>T</kbd> tap
        </p>
      </section>

      <section className="card">
        <h2>Feel</h2>
        <div className="field">
          <span className="label">Time signature</span>
          <div className="seg">
            {TIME_SIGS.map((t) => (
              <button key={t.id} className={s.timeSig === t.id ? 'on' : ''} onClick={() => m.update({ timeSig: t.id })}>
                {t.id}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="label">Clicks per beat</span>
          <div className="seg">
            {SUBDIVISIONS.map((d) => (
              <button
                key={d.value}
                className={s.subdivision === d.value ? 'on' : ''}
                onClick={() => m.update({ subdivision: d.value })}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <label className="field row">
          <input type="checkbox" checked={s.accent} onChange={(e) => m.update({ accent: e.target.checked })} />
          <span>Accent beat 1</span>
        </label>
        <label className="field">
          <span className="label">Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.volume}
            onChange={(e) => m.update({ volume: Number(e.target.value) })}
          />
        </label>
        <p className="muted small">In 6/8 and 7/8 the BPM counts eighth notes.</p>
      </section>

      <section className="card">
        <h2>Speed trainer</h2>
        <label className="field row">
          <input type="checkbox" checked={s.trainer.enabled} onChange={(e) => setTrainer({ enabled: e.target.checked })} />
          <span>Speed up automatically</span>
        </label>
        <div className={`trainer-grid${s.trainer.enabled ? '' : ' disabled'}`}>
          <NumField label="Start BPM" value={s.trainer.start} min={BPM_MIN} max={BPM_MAX} onChange={(v) => setTrainer({ start: v })} />
          <NumField label="Target BPM" value={s.trainer.target} min={BPM_MIN} max={BPM_MAX} onChange={(v) => setTrainer({ target: v })} />
          <NumField label="Step (BPM)" value={s.trainer.step} min={1} max={50} onChange={(v) => setTrainer({ step: v })} />
          <NumField label="Bars per step" value={s.trainer.barsPerStep} min={1} max={64} onChange={(v) => setTrainer({ barsPerStep: v })} />
        </div>
        <p className="muted small">
          Starts at {s.trainer.start} BPM and adds {s.trainer.step} every {s.trainer.barsPerStep} bars until{' '}
          {s.trainer.target}. Press start to begin from the start BPM.
        </p>
        {m.playing && s.trainer.enabled && <p className="small">Reached: {m.peakBpm} BPM</p>}
      </section>
    </div>
  );
}

function BpmInput({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  return <DraftNumber value={value} min={BPM_MIN} max={BPM_MAX} onCommit={onCommit} label="BPM" />;
}

/** Number box that keeps a draft while you type (so "1" on the way to "120" isn't clamped to 20); applies on Enter or blur. */
function DraftNumber(p: { value: number; min: number; max: number; onCommit: (v: number) => void; label?: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft !== null && draft.trim() !== '' && Number.isFinite(Number(draft))) p.onCommit(Number(draft));
    setDraft(null);
  };
  return (
    <input
      type="number"
      inputMode="numeric"
      min={p.min}
      max={p.max}
      value={draft ?? p.value}
      aria-label={p.label}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') {
          setDraft(null);
          e.currentTarget.blur();
        }
      }}
    />
  );
}

function NumField(p: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="field">
      <span className="label">{p.label}</span>
      <DraftNumber
        value={p.value}
        min={p.min}
        max={p.max}
        onCommit={(v) => p.onChange(Math.min(p.max, Math.max(p.min, Math.round(v))))}
      />
    </label>
  );
}
