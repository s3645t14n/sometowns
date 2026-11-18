// Renders the scene stack to a 2D canvas.

import { config } from '../config.js';
import { makeBackdrop } from './backdrop.js';

const Z_SPAN = config.LAYERS * config.LAYER_GAP;
const Z_MAX = config.Z_NEAR + Z_SPAN;

const backdrop = makeBackdrop();

function scaleFor(z) {
  return config.SCALE_BOOST * config.SCALE_K / (config.SCALE_K + z);
}

function groundFor(z) {
  const u = (z - config.Z_NEAR) / Z_SPAN;
  const k = Math.pow(u, config.GROUND_CURVE);
  const near = 1.0;
  const far = config.GROUND_FAR;
  return near + (far - near) * k;
}

export function render(ctx, canvas, scene) {
  const { STRIP_W, STRIP_H, PLAYER_W, PLAYER_H } = config;

  const lift = canvas.height * config.VERTICAL_LIFT;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = config.SKY;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sorted = scene.layers.slice().sort((a, b) => b.z - a.z);

  const farGroundY = canvas.height * groundFor(Z_MAX) - lift;

  // Backdrop scales around its bottom-center anchor. At player.z = 0 it is
  // at its minimum; moving forward grows it, moving backward does not shrink
  // it further (already at minimum).
  const baseScale = Math.max(
    canvas.width / config.BACKDROP_W,
    farGroundY / config.BACKDROP_H
  );
  let zZoom = scene.player.z * config.BACKDROP_ZOOM_PER_UNIT;
  zZoom = Math.max(0, Math.min(config.BACKDROP_ZOOM_CLAMP, zZoom));
  const zoom = 1 + zZoom;
  const bScale = baseScale * zoom;
  const bw = config.BACKDROP_W * bScale;
  const bh = config.BACKDROP_H * bScale;
  const bx = canvas.width / 2 - bw / 2;
  const by = farGroundY - bh;
  ctx.drawImage(backdrop, bx, by, bw, bh);

  // Ground fill under everything.
  ctx.fillStyle = config.GROUND_BOTTOM;
  ctx.fillRect(0, farGroundY, canvas.width, canvas.height - farGroundY);

  for (const layer of sorted) {
    const s = scaleFor(layer.z);

    const drawW = STRIP_W * s;
    const drawH = STRIP_H * s;

    const groundY = canvas.height * groundFor(layer.z) - lift;
    const y = groundY - drawH * (1 - config.GROUND_H / STRIP_H);

    let scroll = (layer.scrollX * s) % drawW;
    if (scroll > 0) scroll -= drawW;

    const centerX = canvas.width / 2;
    let startX = centerX - drawW / 2 + scroll;
    while (startX > 0) startX -= drawW;

    for (let x = startX; x < canvas.width; x += drawW) {
      ctx.drawImage(layer.canvas, x, y, drawW, drawH);
    }
  }

  const fadeH = canvas.height * config.BOTTOM_FADE_H;
  const fadeTop = canvas.height - fadeH;
  const fade = ctx.createLinearGradient(0, fadeTop, 0, canvas.height);
  fade.addColorStop(0, config.BOTTOM_FADE_TOP);
  fade.addColorStop(1, config.BOTTOM_FADE_BOTTOM);
  ctx.fillStyle = fade;
  ctx.fillRect(0, fadeTop, canvas.width, fadeH);

  const px = canvas.width / 2 - PLAYER_W / 2;
  const stepBob = Math.sin(scene.player.stepPhase) * config.STEP_AMP;
  const py = canvas.height - PLAYER_H - config.PLAYER_BOTTOM_MARGIN - stepBob;

  ctx.fillStyle = config.PLAYER_FILL;
  ctx.fillRect(px, py, PLAYER_W, PLAYER_H);
  ctx.strokeStyle = config.PLAYER_STROKE;
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 1, py + 1, PLAYER_W - 2, PLAYER_H - 2);

  ctx.fillStyle = '#c8d0d8';
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const nearestZ = Math.min(...scene.layers.map(l => l.z));
  ctx.fillText(`playerX=${scene.player.x.toFixed(0)}  playerZ=${scene.player.z.toFixed(1)}  nearestZ=${nearestZ.toFixed(0)}`, 8, 8);
}

