// Far backdrop: sky, clouds, mountain ridges with tiny trees, and a black
// tower with a pointed roof peeking from behind the ridges.
// Drawn once into an offscreen canvas; the renderer scales it around the
// bottom-center anchor based on the player's Z position.

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

export function makeBackdrop(seed = 12345) {
  const W = config.BACKDROP_W;
  const H = config.BACKDROP_H;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const rng = mulberry32(seed);

  // Sky gradient.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, config.BACKDROP_SKY_TOP);
  sky.addColorStop(1, config.BACKDROP_SKY_BOTTOM);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Clouds: soft white ellipses in the upper half.
  ctx.fillStyle = config.BACKDROP_CLOUD;
  for (let i = 0; i < 22; i++) {
    const cx = rng() * W;
    const cy = rng() * H * 0.5;
    const rx = W * (0.03 + rng() * 0.06);
    const ry = H * (0.02 + rng() * 0.03);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Far ridge (lighter, lower peaks).
  const farPeaks = drawRidge(ctx, W, H, 0.14, config.BACKDROP_MOUNTAIN_FAR, rng, 28);
  drawTreesOnPeaks(ctx, H, farPeaks, 0.018, config.BACKDROP_TREE, rng);

  // Tower behind the near ridge.
  drawTower(ctx, W, H);

  // Near ridge (darker, higher peaks).
  const nearPeaks = drawRidge(ctx, W, H, 0.20, config.BACKDROP_MOUNTAIN_NEAR, rng, 36);
  drawTreesOnPeaks(ctx, H, nearPeaks, 0.022, config.BACKDROP_TREE, rng);

  return canvas;
}

function drawRidge(ctx, W, H, ampFrac, color, rng, segments) {
  const peakMinY = H * (1 - ampFrac);
  const peakMaxY = H * (1 - ampFrac * 0.4);

  const peaks = [];
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * W;
    const y = peakMinY + (peakMaxY - peakMinY) * rng();
    peaks.push({ x, y });
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  return peaks;
}

function drawTreesOnPeaks(ctx, H, peaks, sizeFrac, color, rng) {
  const h = H * sizeFrac;
  ctx.fillStyle = color;
  for (let i = 1; i < peaks.length - 1; i += 2) {
    if (rng() < 0.35) continue;
    const p = peaks[i];
    drawTree(ctx, p.x, p.y, h);
  }
}

function drawTree(ctx, x, baseY, h) {
  const w = h * 0.8;
  ctx.beginPath();
  ctx.moveTo(x, baseY - h);
  ctx.lineTo(x - w / 2, baseY);
  ctx.lineTo(x + w / 2, baseY);
  ctx.closePath();
  ctx.fill();
}

function drawTower(ctx, W, H) {
  const towerW = Math.max(8, W * 0.006);
  const bodyH = H * 0.26;
  const roofH = bodyH * 0.45;
  const cx = W / 2;
  const baseY = H;
  const bodyTopY = baseY - bodyH;

  ctx.fillStyle = config.BACKDROP_TOWER;
  ctx.fillRect(cx - towerW / 2, bodyTopY, towerW, bodyH);

  ctx.beginPath();
  ctx.moveTo(cx - towerW * 0.7, bodyTopY);
  ctx.lineTo(cx, bodyTopY - roofH);
  ctx.lineTo(cx + towerW * 0.7, bodyTopY);
  ctx.closePath();
  ctx.fill();
}
