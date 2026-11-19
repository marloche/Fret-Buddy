// Horizontal neck diagram (like tab: high e on top, low E at the bottom), drawn in SVG.
// Wood, frets, inlays and strings use fixed physical colors: a rosewood neck looks the same in light and dark mode.
import { useId } from 'react';
import type { Built } from '../theory/build';
import { degreeText } from '../theory/notes';
import { positionsFor, STANDARD, type Tuning } from '../theory/fretboard';

const FRET_W = 52;
const OPEN_W = 40;
const STRING_GAP = 30;
const TOP = 16;
const LEFT = 8;
const MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];
const WOOD_EDGE = '#6b4430';
const WOOD_MID = '#4e3022';
const FRET = '#cfc8ba'; // nickel
const NUT = '#eee4cc'; // bone
const PEARL = '#efe6d3';
const WOUND = '#c9a66b'; // bronze-wound low strings
const PLAIN = '#e4e4e4';

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
  const y = (s: number) => TOP + (strings - 1 - s) * STRING_GAP; // string 0 = low E, at the bottom
  const nutX = LEFT + OPEN_W;
  const fretX = (f: number) => nutX + f * FRET_W; // the fret wire
  const noteX = (f: number) => (f === 0 ? LEFT + OPEN_W / 2 : fretX(f) - FRET_W / 2);
  const width = fretX(maxFret) + 8;
  const boardTop = TOP - 8;
  const boardH = y(0) - TOP + 16;
  const height = y(0) + 34;
  const mid = (TOP + y(0)) / 2;
  const grad = useId();

  const positions = positionsFor(tuning, new Set(built.byPc.keys()), maxFret);
  const rootPc = built.tones[0].pc;
  const inlay = (cx: number, cy: number, key: string) => <circle key={key} className="fb-marker" cx={cx} cy={cy} r={6} fill={PEARL} />;

  return (
    <div className="fretboard-scroll">
      <svg
        className="fretboard"
        viewBox={`0 0 ${width} ${height}`}
        style={{ minWidth: Math.min(width, 760) }}
        role="img"
        aria-label={`${built.rootName} scale on the fretboard, frets 0 to ${maxFret}`}
      >
        <defs>
          <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={WOOD_EDGE} />
            <stop offset="0.5" stopColor={WOOD_MID} />
            <stop offset="1" stopColor={WOOD_EDGE} />
          </linearGradient>
        </defs>
        <rect className="fb-wood" x={nutX} y={boardTop} width={fretX(maxFret) - nutX} height={boardH} rx={3} fill={`url(#${grad})`} />
        {MARKERS.filter((m) => m <= maxFret).map((m) => inlay(fretX(m) - FRET_W / 2, mid, `m${m}`))}
        {maxFret >= 12 && [inlay(fretX(12) - FRET_W / 2, mid - STRING_GAP, 'm12a'), inlay(fretX(12) - FRET_W / 2, mid + STRING_GAP, 'm12b')]}
        {Array.from({ length: maxFret }, (_, i) => (
          <line key={i} className="fb-fret" x1={fretX(i + 1)} x2={fretX(i + 1)} y1={boardTop} y2={boardTop + boardH} stroke={FRET} strokeWidth={2.5} />
        ))}
        <rect className="fb-nut" x={nutX - 6} y={boardTop} width={6} height={boardH} rx={1.5} fill={NUT} />
        {Array.from({ length: strings }, (_, s) => {
          const wound = s < 3;
          return (
            <line
              key={s}
              className="fb-string"
              x1={LEFT}
              x2={fretX(maxFret)}
              y1={y(s)}
              y2={y(s)}
              stroke={wound ? WOUND : PLAIN}
              strokeWidth={0.9 + (strings - 1 - s) * 0.4}
            />
          );
        })}
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
