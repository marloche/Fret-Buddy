// Owns the one Metronome engine and its settings for the whole app, so it keeps
// playing while you switch pages. Ticks get their own context so only the beat
// display re-renders on every click.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Metronome, type MetronomeSettings, type Tick } from '../audio/scheduler';
import { keepAwake } from '../audio/wakeLock';
import { addTap, bpmFromTaps } from '../logic/tap';
import { clampBpm } from '../logic/tempo';
import { DEFAULT_TRAINER } from '../logic/trainer';
import { load, save } from '../store';

const DEFAULTS: MetronomeSettings = {
  bpm: 80,
  timeSig: '4/4',
  subdivision: 1,
  accent: true,
  volume: 0.8,
  trainer: DEFAULT_TRAINER,
};

interface MetronomeApi {
  settings: MetronomeSettings;
  playing: boolean;
  /** Highest BPM reached since the last start (for the practice log later). */
  peakBpm: number;
  update: (patch: Partial<MetronomeSettings>) => void;
  setBpm: (bpm: number) => void;
  nudge: (delta: number) => void;
  toggle: () => void;
  start: () => void;
  stop: () => void;
  tap: () => void;
  silentHint: boolean;
  dismissSilentHint: () => void;
}

const Ctx = createContext<MetronomeApi | null>(null);
const TickCtx = createContext<Tick | null>(null);

const isIOS = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function MetronomeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<MetronomeSettings>(() => {
    const s = load('metronome', DEFAULTS);
    return { ...s, trainer: { ...DEFAULT_TRAINER, ...s.trainer } };
  });
  const [playing, setPlaying] = useState(false);
  const [tick, setTick] = useState<Tick | null>(null);
  const [peakBpm, setPeakBpm] = useState(settings.bpm);
  const [silentHint, setSilentHint] = useState(false);
  const settingsRef = useRef(settings);
  const tapsRef = useRef<number[]>([]);

  const engine = useMemo(
    () =>
      new Metronome(
        () => settingsRef.current,
        setTick,
        (bpm) => {
          // Update the ref right away so the very next click already uses the new tempo.
          settingsRef.current = { ...settingsRef.current, bpm };
          setSettings(settingsRef.current);
        },
      ),
    [],
  );

  useEffect(() => save('metronome', settings), [settings]);
  useEffect(() => {
    if (playing) setPeakBpm((p) => Math.max(p, settings.bpm));
  }, [playing, settings.bpm]);

  // The ref is the source of truth between renders, so fast repeated presses (+5 +5 +5)
  // and the audio engine always see the latest value.
  const update = useCallback((patch: Partial<MetronomeSettings>) => {
    const next = { ...settingsRef.current, ...patch };
    settingsRef.current = next;
    setSettings(next);
  }, []);
  const setBpm = useCallback((bpm: number) => update({ bpm: clampBpm(bpm) }), [update]);
  const nudge = useCallback((d: number) => setBpm(settingsRef.current.bpm + d), [setBpm]);

  const start = useCallback(() => {
    setPeakBpm(settingsRef.current.trainer.enabled ? settingsRef.current.trainer.start : settingsRef.current.bpm);
    void engine.start().then(() => {
      setPlaying(true);
      keepAwake(true);
      if (isIOS() && !load('silentHintSeen', false)) setSilentHint(true);
    });
  }, [engine]);
  const stop = useCallback(() => {
    engine.stop();
    setPlaying(false);
    setTick(null);
    keepAwake(false);
  }, [engine]);
  const toggle = useCallback(() => (engine.playing ? stop() : start()), [engine, start, stop]);

  const tap = useCallback(() => {
    tapsRef.current = addTap(tapsRef.current, performance.now());
    const bpm = bpmFromTaps(tapsRef.current);
    if (bpm !== null) setBpm(bpm);
  }, [setBpm]);

  const dismissSilentHint = useCallback(() => {
    save('silentHintSeen', true);
    setSilentHint(false);
  }, []);

  // Keyboard: space = start/stop, arrows = BPM (shift = ±5), T = tap.
  useEffect(() => {
    const typing = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));
    const onDown = (e: KeyboardEvent) => {
      if (typing(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      const step = e.shiftKey ? 5 : 1;
      if (e.code === 'Space') {
        e.preventDefault(); // stops page scroll, and a focused button from also toggling
        if (!e.repeat) toggle();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault();
        nudge(step);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault();
        nudge(-step);
      } else if (e.key === 't' || e.key === 'T') {
        if (!e.repeat) tap();
      }
    };
    // A focused button fires its click on Space keyup; block that so Space only toggles once.
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !typing(e.target)) e.preventDefault();
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [toggle, nudge, tap]);

  useEffect(() => () => engine.stop(), [engine]);

  const api: MetronomeApi = {
    settings,
    playing,
    peakBpm,
    update,
    setBpm,
    nudge,
    toggle,
    start,
    stop,
    tap,
    silentHint,
    dismissSilentHint,
  };
  return (
    <Ctx.Provider value={api}>
      <TickCtx.Provider value={tick}>{children}</TickCtx.Provider>
    </Ctx.Provider>
  );
}

export function useMetronome(): MetronomeApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useMetronome must be inside MetronomeProvider');
  return v;
}

export function useTick(): Tick | null {
  return useContext(TickCtx);
}
