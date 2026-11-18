// Diskworld prototype entry point: minimal visual test of layered strips.

import { Scene } from './app/scene.js';
import { render } from './app/render.js';

const canvas = document.getElementById('view');
const ctx = canvas.getContext('2d', { alpha: false });

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.imageSmoothingEnabled = false;
}

window.addEventListener('resize', resize);
resize();

const scene = new Scene();

const keys = new Set();
const MOVE_KEYS = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'KeyA', 'KeyD', 'KeyW', 'KeyS'
]);

window.addEventListener('keydown', (e) => {
  if (MOVE_KEYS.has(e.code)) {
    keys.add(e.code);
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  if (MOVE_KEYS.has(e.code)) {
    keys.delete(e.code);
    e.preventDefault();
  }
});

let last = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  let moved = false;

  if (keys.has('ArrowLeft') || keys.has('KeyA')) { scene.moveLeft(dt); moved = true; }
  if (keys.has('ArrowRight') || keys.has('KeyD')) { scene.moveRight(dt); moved = true; }
  if (keys.has('ArrowUp') || keys.has('KeyW')) { scene.moveForward(dt); moved = true; }
  if (keys.has('ArrowDown') || keys.has('KeyS')) { scene.moveBack(dt); moved = true; }

  if (!moved) scene.decayStep(dt);

  render(ctx, canvas, scene);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
console.log('[diskworld] prototype boot');
