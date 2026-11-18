// Generates a single decorative strip: wavy ground band + trees/bushes/rocks.
// Deterministic via mulberry32 so each layer can be regenerated identically.

import { config } from '../config.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawTree(ctx, x, baseY, h, palette, rng) {
  const trunkW = Math.max(3, h * 0.08);
  const trunkH = h * 0.35;
  ctx.fillStyle = palette.trunk;
  ctx.fillRect(x - trunkW / 2, baseY - trunkH, trunkW, trunkH);

  const tiers = 3;
  const leavesTop = baseY - h;
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1);
    const w = h * (0.55 - 0.15 * i) * (0.85 + rng() * 0.3);
    const top = leavesTop + (h * 0.55) * t;
    const bot = top + h * 0.28;
    ctx.fillStyle = palette.leaves[i % palette.leaves.length];
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x - w / 2, bot);
    ctx.lineTo(x + w / 2, bot);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBush(ctx, x, baseY, h, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, baseY - h * 0.4, h * 0.5, Math.PI, 0);
  ctx.arc(x - h * 0.35, baseY - h * 0.3, h * 0.35, Math.PI, 0);
  ctx.arc(x + h * 0.35, baseY - h * 0.3, h * 0.35, Math.PI, 0);
  ctx.fill();
}

function drawRock(ctx, x, baseY, h, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - h * 0.5, baseY);
  ctx.lineTo(x - h * 0.25, baseY - h * 0.7);
  ctx.lineTo(x + h * 0.1, baseY - h);
  ctx.lineTo(x + h * 0.45, baseY - h * 0.55);
  ctx.lineTo(x + h * 0.5, baseY);
  ctx.closePath();
  ctx.fill();
}

export function makeStrip(seed, depthBand) {
  const { STRIP_W, STRIP_H, GROUND_H } = config;
  const canvas = document.createElement('canvas');
  canvas.width = STRIP_W;
  canvas.height = STRIP_H;
  const ctx = canvas.getContext('2d');

  const rng = mulberry32(seed);
  const baseY = STRIP_H - GROUND_H;

  // Random phases for the wave, one set per strip.
  const p1 = rng() * Math.PI * 2;
  const p2 = rng() * Math.PI * 2;
  const p3 = rng() * Math.PI * 2;

  const amp1 = GROUND_H * 0.20;
  const amp2 = GROUND_H * 0.10;
  const amp3 = GROUND_H * 0.05;

  function hillY(x) {
    return baseY
      + Math.sin(x * 0.008 + p1) * amp1
      + Math.sin(x * 0.021 + p2) * amp2
      + Math.sin(x * 0.045 + p3) * amp3;
  }

  ctx.clearRect(0, 0, STRIP_W, STRIP_H);

  // Ground band follows the wavy hill line.
  const grad = ctx.createLinearGradient(0, baseY - amp1 * 3, 0, STRIP_H);
  grad.addColorStop(0, config.GROUND_TOP);
  grad.addColorStop(1, config.GROUND_BOTTOM);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, STRIP_H);
  for (let x = 0; x <= STRIP_W; x += 4) {
    ctx.lineTo(x, hillY(x));
  }
  ctx.lineTo(STRIP_W, STRIP_H);
  ctx.closePath();
  ctx.fill();

  // Ground edge stroke along the hill line.
  ctx.strokeStyle = config.GROUND_EDGE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= STRIP_W; x += 4) {
    const y = hillY(x);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const pal = {
    trunk: config.TREE_TRUNK[depthBand],
    leaves: config.TREE_LEAVES[depthBand]
  };

  const step = 40 + Math.floor(rng() * 40);
  for (let x = 20; x < STRIP_W - 20; x += step + Math.floor(rng() * step)) {
    const top = hillY(x);
    const r = rng();
    if (r < 0.55) {
      const h = 90 + rng() * 90;
      drawTree(ctx, x, top, h, pal, rng);
    } else if (r < 0.8) {
      const h = 22 + rng() * 22;
      drawBush(ctx, x, top, h, config.BUSH[depthBand]);
    } else {
      const h = 18 + rng() * 24;
      drawRock(ctx, x, top, h, config.ROCK[depthBand]);
    }
  }

  return canvas;
}
