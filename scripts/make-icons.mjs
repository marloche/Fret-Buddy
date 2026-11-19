// Writes the app icons as PNGs (a guitar pick on a dark square), using only Node built-ins.
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BG = [0x16, 0x18, 0x1d];
const PICK = [0xf5, 0xa6, 0x23];

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};

// Pick shape in unit coordinates (center 0,0): a triangle with rounded corners, wide edge on top.
const TRI = [[-0.3, -0.26], [0.3, -0.26], [0, 0.34]];
const R = 0.16;
function segDist(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
function inPick(x, y) {
  const side = (a, b) => (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
  const s = [side(TRI[0], TRI[1]), side(TRI[1], TRI[2]), side(TRI[2], TRI[0])];
  if (s.every((v) => v >= 0) || s.every((v) => v <= 0)) return true;
  return [0, 1, 2].some((i) => segDist(x, y, TRI[i], TRI[(i + 1) % 3]) <= R);
}

function png(size) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  const S = 3; // supersampling per axis
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let hits = 0;
      for (let sy = 0; sy < S; sy++)
        for (let sx = 0; sx < S; sx++) {
          // Scale 0.62 keeps the pick inside the maskable safe zone.
          const u = ((x + (sx + 0.5) / S) / size - 0.5) / 0.62;
          const v = ((y + (sy + 0.5) / S) / size - 0.5) / 0.62;
          if (inPick(u, v)) hits++;
        }
      const n = S * S;
      const a = hits / n;
      const o = y * (size * 3 + 1) + 1 + x * 3;
      for (let i = 0; i < 3; i++) raw[o + i] = Math.round(BG[i] * (1 - a) + PICK[i] * a);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', png(192));
writeFileSync('public/icons/icon-512.png', png(512));
writeFileSync('public/icons/apple-touch-icon.png', png(180));
