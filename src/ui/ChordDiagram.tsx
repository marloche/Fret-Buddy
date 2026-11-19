// Vertical chord box: strings top to bottom, low E on the left, drawn in SVG.
import type { Built } from '../theory/build';
import { pcAt, STANDARD } from '../theory/fretboard';
import type { Voicing } from '../theory/voicings';

const STR_GAP = 24;
const FRET_GAP = 30;
const FRETS = 5;
const LEFT = 36; // room for the "12fr" label left of the dots
const TOP = 30;

export function ChordDiagram({ voicing, chord }: { voicing: Voicing; chord: Built & { symbol: string } }) {
  const n = voicing.frets.length;
  const x = (s: number) => LEFT + s * STR_GAP;
  const right = x(n - 1);
  const bottom = TOP + FRETS * FRET_GAP;
  const width = right + 24;
  const height = bottom + 30;
  const base = voicing.baseFret;
  // Centre of the space for absolute fret f in this diagram.
  const fy = (f: number) => TOP + (f - base + 0.5) * FRET_GAP;
  const rootPc = chord.tones[0].pc;

  const sounding = voicing.frets.map((f, s) => (f === null ? null : pcAt(STANDARD, s, f)));
  const describe = voicing.frets.map((f) => (f === null ? 'x' : f)).join(' ');

  return (
    <svg className="chord-diagram" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${chord.symbol}: ${describe} (low to high)`}>
      {base > 1 && (
        <text className="cd-base" x={LEFT - 13} y={fy(base)} textAnchor="end" dominantBaseline="central">
          {base}fr
        </text>
      )}
      {Array.from({ length: FRETS + 1 }, (_, i) => (
        <line key={i} className={i === 0 && base === 1 ? 'cd-nut' : 'cd-fret'} x1={x(0)} x2={right} y1={TOP + i * FRET_GAP} y2={TOP + i * FRET_GAP} />
      ))}
      {voicing.frets.map((_, s) => (
        <line key={s} className="cd-string" x1={x(s)} x2={x(s)} y1={TOP} y2={bottom} />
      ))}
      {voicing.frets.map((f, s) =>
        f === null ? (
          <text key={s} className="cd-mute" x={x(s)} y={TOP - 12} textAnchor="middle" dominantBaseline="central">
            ×
          </text>
        ) : f === 0 ? (
          <circle key={s} className={`cd-open${sounding[s] === rootPc ? ' root' : ''}`} cx={x(s)} cy={TOP - 12} r={6} />
        ) : null,
      )}
      {voicing.barre && (
        <rect
          className="cd-barre"
          x={x(voicing.barre.from) - 11}
          y={fy(voicing.barre.fret) - 11}
          width={x(voicing.barre.to) - x(voicing.barre.from) + 22}
          height={22}
          rx={11}
        />
      )}
      {voicing.frets.map((f, s) =>
        f !== null && f > 0 ? (
          <g key={s} className={`cd-dot${sounding[s] === rootPc ? ' root' : ''}`}>
            <circle cx={x(s)} cy={fy(f)} r={10} />
            {voicing.fingers[s] !== null && (
              <text x={x(s)} y={fy(f)} textAnchor="middle" dominantBaseline="central">
                {voicing.fingers[s]}
              </text>
            )}
          </g>
        ) : null,
      )}
      {sounding.map((p, s) =>
        p === null ? null : (
          <text key={s} className="cd-note" x={x(s)} y={bottom + 18} textAnchor="middle">
            {chord.byPc.get(p)?.name}
          </text>
        ),
      )}
    </svg>
  );
}
