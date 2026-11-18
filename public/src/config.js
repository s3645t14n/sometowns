// Diskworld prototype configuration.
// Visual test: multi-layer billboard strips with fake-Z.

export const config = {
  STRIP_W: 1024,
  STRIP_H: 256,
  GROUND_H: 64,

  LAYERS: 21,
  LAYER_GAP: 200,
  Z_NEAR: 60,

  SCALE_K: 10,
  SCALE_BOOST: 60,

  GROUND_FAR: 0.60,
  GROUND_CURVE: 0.5,
  VERTICAL_LIFT: 0.23,

  MOVE_X_SPEED: 320,
  MOVE_Z_SPEED: 1250,

  PLAYER_W: 192,
  PLAYER_H: 384,
  PLAYER_BOTTOM_MARGIN: 80,
  STEP_RATE: 14,
  STEP_AMP: 8,
  STEP_DECAY: 14,

  SKY: '#101820',
  GROUND_TOP: '#3b6b35',
  GROUND_BOTTOM: '#2a4a26',
  GROUND_EDGE: '#1d3319',
  PLAYER_FILL: '#e8c060',
  PLAYER_STROKE: '#3a2a10',

  BOTTOM_FADE_H: 0.35,
  BOTTOM_FADE_TOP: 'rgba(16, 24, 32, 0)',
  BOTTOM_FADE_BOTTOM: 'rgba(16, 24, 32, 1)',

  BACKDROP_W: 1024,
  BACKDROP_H: 512,
  BACKDROP_ZOOM_PER_UNIT: 0.00012,
  BACKDROP_ZOOM_CLAMP: 27,
  BACKDROP_SKY_TOP: '#5a8fc0',
  BACKDROP_SKY_BOTTOM: '#a8c8e0',
  BACKDROP_CLOUD: 'rgba(255, 255, 255, 0.85)',
  BACKDROP_MOUNTAIN_FAR: '#4a6e42',
  BACKDROP_MOUNTAIN_NEAR: '#355a30',
  BACKDROP_TREE: '#1e3a22',
  BACKDROP_TOWER: '#0a0a0a',

  TREE_TRUNK:  ['#3a2a18', '#3d2c1a', '#40301c', '#43331e'],
  TREE_LEAVES: [
    ['#1e3a22', '#264a2a', '#2e5a32'],
    ['#244428', '#2c5230', '#346238'],
    ['#2a4e2e', '#326036', '#3a6e3e'],
    ['#30603a', '#387044', '#40804e']
  ],
  BUSH:        ['#26482a', '#2e5432', '#365e38', '#3e6a40'],
  ROCK:        ['#2c2c30', '#36363a', '#404044', '#4a4a4e']
};

export const DEFAULTS = Object.freeze({ ...config });






