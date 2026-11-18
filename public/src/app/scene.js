// Scene model: stack of layers along fake-Z, per-layer horizontal scroll, player.

import { config } from '../config.js';
import { makeStrip } from './strip.js';

const Z_SPAN = config.LAYERS * config.LAYER_GAP;
const Z_MAX = config.Z_NEAR + Z_SPAN;

export class Scene {
  constructor() {
    this.player = { x: 0, z: 0, stepPhase: 0 };
    this.layers = [];

    for (let i = 0; i < config.LAYERS; i++) {
      const z = config.Z_NEAR + Z_SPAN - i * config.LAYER_GAP;
      const depthBand = Math.min(
        config.TREE_LEAVES.length - 1,
        Math.floor((i / config.LAYERS) * config.TREE_LEAVES.length)
      );
      const seed = 1000 + i * 7919;
      this.layers.push({
        z,
        seed,
        depthBand,
        scrollX: 0,
        canvas: makeStrip(seed, depthBand)
      });
    }
  }

  moveLeft(dt) {
    const d = config.MOVE_X_SPEED * dt;
    this.player.x -= d;
    // Player moves left; the world scrolls right.
    for (const layer of this.layers) {
      layer.scrollX += d;
    }
    this.player.stepPhase += config.STEP_RATE * dt;
  }

  moveRight(dt) {
    const d = config.MOVE_X_SPEED * dt;
    this.player.x += d;
    // Player moves right; the world scrolls left.
    for (const layer of this.layers) {
      layer.scrollX -= d;
    }
    this.player.stepPhase += config.STEP_RATE * dt;
  }

  moveForward(dt) {
    const dz = config.MOVE_Z_SPEED * dt;
    for (const layer of this.layers) layer.z -= dz;
    this.player.z += dz;
    this.player.stepPhase += config.STEP_RATE * dt;
    this.recycle();
  }

  moveBack(dt) {
    const dz = config.MOVE_Z_SPEED * dt;
    for (const layer of this.layers) layer.z += dz;
    this.player.z -= dz;
    this.player.stepPhase += config.STEP_RATE * dt;
    this.recycle();
  }

  decayStep(dt) {
    // When the player is not moving, ease stepPhase to the nearest multiple
    // of 2*PI so sin(stepPhase) ends at zero (player settles flat).
    const TAU = Math.PI * 2;
    const target = Math.round(this.player.stepPhase / TAU) * TAU;
    const diff = target - this.player.stepPhase;
    const k = Math.min(1, dt * config.STEP_DECAY);
    this.player.stepPhase += diff * k;
  }

  recycle() {
    for (const layer of this.layers) {
      if (layer.z < config.Z_NEAR) {
        layer.z += Z_SPAN;
        layer.seed = (layer.seed * 1664525 + 1013904223) >>> 0;
        layer.canvas = makeStrip(layer.seed, layer.depthBand);
      } else if (layer.z > Z_MAX) {
        layer.z -= Z_SPAN;
        layer.seed = (layer.seed * 1664525 + 1013904223) >>> 0;
        layer.canvas = makeStrip(layer.seed, layer.depthBand);
      }
      // scrollX is intentionally NOT touched: X and Z are fully independent.
    }
  }
}
