'use strict';

/**
 * Zero-dependency PNG icon generator for Teletalk Jobs Filler.
 * Generates crisp anti-aliased RGBA PNG icons at 16, 32, 48, and 128px.
 * Run with: node icons/generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZES = [16, 32, 48, 128];

/** Build CRC32 lookup table once. */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter type 0 (None)
    rgba.copy(raw, rowStart + 1, y * stride, (y + 1) * stride);
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Signed distance to rounded box centered at (cx, cy) with half-extents (hx, hy) and radius r. */
function sdRoundedBox(px, py, cx, cy, hx, hy, r) {
  const qx = Math.abs(px - cx) - hx + r;
  const qy = Math.abs(py - cy) - hy + r;
  const outDist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inDist = Math.min(Math.max(qx, qy), 0);
  return outDist + inDist - r;
}

/** Point-in-polygon + distance to polygon edges (for crisp lightning bolt). */
function sdPolygon(px, py, pts) {
  let d = Infinity;
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0];
    const yi = pts[i][1];
    const xj = pts[j][0];
    const yj = pts[j][1];

    const ex = xj - xi;
    const ey = yj - yi;
    const wx = px - xi;
    const wy = py - yi;
    const lenSq = ex * ex + ey * ey;
    const t = lenSq > 0 ? clamp01((wx * ex + wy * ey) / lenSq) : 0;
    const bx = wx - ex * t;
    const by = wy - ey * t;
    d = Math.min(d, bx * bx + by * by);

    const intersect = ((yi > py) !== (yj > py)) &&
      (px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-12) + xi);
    if (intersect) {
      inside = !inside;
    }
  }
  const dist = Math.sqrt(d);
  return inside ? -dist : dist;
}

function blendPixel(dst, idx, r, g, b, alpha) {
  if (alpha <= 0) return;
  const a = clamp01(alpha);
  const dstA = dst[idx + 3] / 255;
  const outA = a + dstA * (1 - a);
  if (outA <= 0) return;
  dst[idx] = Math.round((r * a + dst[idx] * dstA * (1 - a)) / outA);
  dst[idx + 1] = Math.round((g * a + dst[idx + 1] * dstA * (1 - a)) / outA);
  dst[idx + 2] = Math.round((b * a + dst[idx + 2] * dstA * (1 - a)) / outA);
  dst[idx + 3] = Math.round(outA * 255);
}

function renderIcon(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const aa = 128 / size; // 1 pixel in normalized 128x128 coordinates

  const boltPts = [
    [93, 66],
    [77, 88],
    [89, 88],
    [85, 106],
    [104, 82],
    [91, 82]
  ];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Map pixel center to 0..128 design space
      const px = ((x + 0.5) / size) * 128;
      const py = ((y + 0.5) / size) * 128;
      const idx = (y * size + x) * 4;

      // 1. Rounded emerald background badge
      const bgSd = sdRoundedBox(px, py, 64, 64, 58, 58, 28);
      const bgAlpha = 1 - smoothstep(-aa * 0.7, aa * 0.7, bgSd);
      if (bgAlpha > 0) {
        const gradT = clamp01((px + py) / 256);
        const r = Math.round(16 + (4 - 16) * gradT);
        const g = Math.round(185 + (120 - 185) * gradT);
        const b = Math.round(129 + (87 - 129) * gradT);
        blendPixel(rgba, idx, r, g, b, bgAlpha);
      }

      // 2. White form document card
      const docSd = sdRoundedBox(px, py, 58, 61, 30, 39, 8);
      const docAlpha = (1 - smoothstep(-aa * 0.7, aa * 0.7, docSd)) * 0.97;
      blendPixel(rgba, idx, 255, 255, 255, docAlpha);

      // 3. Document horizontal form field bars
      const bar1 = sdRoundedBox(px, py, 57, 39.5, 19, 3.8, 3.5);
      blendPixel(rgba, idx, 5, 150, 105, 1 - smoothstep(-aa * 0.7, aa * 0.7, bar1));

      const bar2 = sdRoundedBox(px, py, 54, 54, 16, 3.3, 3);
      blendPixel(rgba, idx, 110, 231, 183, 1 - smoothstep(-aa * 0.7, aa * 0.7, bar2));

      const bar3 = sdRoundedBox(px, py, 56, 67, 18, 3.3, 3);
      blendPixel(rgba, idx, 110, 231, 183, 1 - smoothstep(-aa * 0.7, aa * 0.7, bar3));

      const bar4 = sdRoundedBox(px, py, 50, 80, 12, 3.3, 3);
      blendPixel(rgba, idx, 167, 243, 208, 1 - smoothstep(-aa * 0.7, aa * 0.7, bar4));

      // 4. Dark emerald circular lightning emblem
      const circSd = Math.hypot(px - 90, py - 86) - 25;
      const circAlpha = 1 - smoothstep(-aa * 0.7, aa * 0.7, circSd);
      blendPixel(rgba, idx, 6, 78, 59, circAlpha);

      // 5. Crisp gold lightning bolt
      const boltSd = sdPolygon(px, py, boltPts);
      const boltAlpha = 1 - smoothstep(-aa * 0.7, aa * 0.7, boltSd);
      if (boltAlpha > 0) {
        const boltT = clamp01((py - 66) / 40);
        const br = Math.round(253 + (245 - 253) * boltT);
        const bg = Math.round(224 + (158 - 224) * boltT);
        const bb = Math.round(71 + (11 - 71) * boltT);
        blendPixel(rgba, idx, br, bg, bb, boltAlpha);
      }
    }
  }

  return encodePng(size, size, rgba);
}

function main() {
  const outDir = __dirname;
  for (const size of SIZES) {
    const png = renderIcon(size);
    const outPath = path.join(outDir, `icon${size}.png`);
    fs.writeFileSync(outPath, png);
    console.log(`Generated ${outPath} (${png.length} bytes)`);
  }
}

main();
