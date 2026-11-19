// Horizontal neck diagram (like tab: high e on top, low E at the bottom), drawn in SVG.
import type { Built } from '../theory/build';
import { degreeText } from '../theory/notes';
import { positionsFor, STANDARD, type Tuning } from '../theory/fretboard';

const FRET_W = 52;
const OPEN_W = 40;
const STRING_GAP = 30;
const TOP = 16;
const LEFT = 8;
const MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];

export function Fretboard({
  built,
  labels,
  maxFret = 15,
  tuning = STANDARD,
}: {
  built: Built;
  labels: 'names' | 'degrees';
  maxFret?: number;
  tuning?: Tuning;
}) {
  const strings = tuning.strings.length;
  const y = (s: number) => TOP + (strings - 1 - s) * STRING_GAP; // low string at the bottom
  const nutX = LEFT + OPEN_W;
  const fretX = (f: number) => nutX + f * FRET_W; // the fret wire
  const noteX = (f: number) => (f === 0 ? LEFT + OPEN_W / 2 : fretX(f) - FRET_W / 2);
  const width = fretX(maxFret) + 8;
  const boardBottom = y(0);
  const height = boardBottom + 34;
  const mid = (TOP + boardBottom) / 2;

  const positions = positionsFor(tuning, new Set(built.byPc.keys()), maxFret);
  const rootPc = built.tones[0].pc;

  return (
    <div className="fretboard-scroll">
      <svg
        className="fretboard"
        viewBox={`0 0 ${width} ${height}`}
        style={{ minWidth: Math.min(width, 760) }}
        role="img"
        aria-label={`${built.rootName} scale on the fretboard, frets 0 to ${maxFret}`}
      >
        <rect className="fb-wood" x={nutX} y={TOP - 8} width={fretX(maxFret) - nutX} height={boardBottom - TOP + 16} rx={4} />
        {MARKERS.filter((m) => m <= maxFret).map((m) => (
          <circle key={m} className="fb-marker" cx={fretX(m) - FRET_W / 2} cy={mid} r={6} />
        ))}
        {maxFret >= 12 && (
          <>
            <circle className="fb-marker" cx={fretX(12) - FRET_W / 2} cy={mid - STRING_GAP} r={6} />
            <circle className="fb-marker" cx={fretX(12) - FRET_W / 2} cy={mid + STRING_GAP} r={6} />
          </>
        )}
        {Array.from({ length: maxFret + 1 }, (_, f) => (
          <line key={f} className={f === 0 ? 'fb-nut' : 'fb-fret'} x1={fretX(f)} x2={fretX(f)} y1={TOP - 8} y2={boardBottom + 8} />
        ))}
        {Array.from({ length: strings }, (_, s) => (
          <line key={s} className="fb-string" x1={LEFT} x2={fretX(maxFret)} y1={y(s)} y2={y(s)} style={{ strokeWidth: 1 + (strings - 1 - s) * 0.35 }} />
        ))}
        {Array.from({ length: maxFret + 1 }, (_, f) => (
          <text key={f} className="fb-num" x={noteX(f)} y={height - 6} textAnchor="middle">
            {f}
          </text>
        ))}
        {positions.map((p) => {
          const tone = built.byPc.get(p.pc)!;
          const isRoot = p.pc === rootPc;
          const text = labels === 'names' ? tone.name : degreeText(tone.degree);
          return (
            <g key={`${p.string}-${p.fret}`} className={`fb-note${isRoot ? ' root' : ''}`}>
              <circle cx={noteX(p.fret)} cy={y(p.string)} r={13} />
              <text x={noteX(p.fret)} y={y(p.string)} textAnchor="middle" dominantBaseline="central" style={{ fontSize: text.length > 2 ? 10 : 12 }}>
                {text}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
