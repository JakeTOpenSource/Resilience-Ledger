#!/usr/bin/env node
'use strict';

// Executes the actual browser runtime with deterministic DOM/RAF/timer/Image/GL mocks.
// These checks establish scheduling, state, and fallback decisions only. They do
// not decode the artwork, render GPU pixels, or establish browser/OS compatibility.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'assets/garden-deer-v1.js'), 'utf8');
const model = require(path.join(root, 'assets/garden-deer-pose-v1.js'));
let passed = 0, failed = 0;
async function check(name, run) {
  try { await run(); passed++; console.log('PASS ' + name); }
  catch (error) { failed++; console.error('FAIL ' + name + ': ' + error.message); }
}

function fixture(options = {}) {
  const observers = [], pendingObservers = new Set(), resizeObservers = [];
  const queue = new Map(), timers = new Map(), images = [], renders = [], requests = [];
  let clock = 100, nextRaf = 1, requestsMade = 0, maxPending = 0, glLost = false;
  let nextTimer = 1, maxTimers = 0;
  let drawError = false, poseSamples = [], lookSamples = [], draws = 0, preparations = 0;
  const eventTarget = () => ({
    listeners: new Map(),
    addEventListener(type, fn) {
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(fn);
    },
    dispatch(type, event = {}) {
      for (const fn of this.listeners.get(type) || []) fn(event);
      flushObservers();
    },
  });
  function changed(target, attributeName) {
    for (const observer of observers) {
      if (observer.target === target && observer.options.attributes &&
          (!observer.options.attributeFilter || observer.options.attributeFilter.includes(attributeName))) {
        pendingObservers.add(observer);
      }
    }
  }
  function flushObservers() {
    while (pendingObservers.size) {
      const pending = [...pendingObservers]; pendingObservers.clear();
      for (const observer of pending) { observer.calls++; observer.fn([]); }
    }
  }
  function element(id = '') {
    const e = Object.assign(eventTarget(), { id, style: {}, children: [], attributes: {} });
    let isHidden = false;
    Object.defineProperty(e, 'hidden', {
      get: () => isHidden,
      set: value => { isHidden = Boolean(value); changed(e, 'hidden'); },
    });
    e.dataset = new Proxy({}, { set(target, key, value) {
      target[key] = String(value);
      changed(e, 'data-' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase()));
      return true;
    } });
    e.setAttribute = (name, value) => { e.attributes[name] = String(value); changed(e, name); };
    e.append = (...children) => e.children.push(...children);
    return e;
  }
  const gl = {};
  const constants = ['VERTEX_SHADER', 'FRAGMENT_SHADER', 'COMPILE_STATUS', 'LINK_STATUS',
    'ARRAY_BUFFER', 'ELEMENT_ARRAY_BUFFER', 'DYNAMIC_DRAW', 'STATIC_DRAW', 'FLOAT',
    'TEXTURE0', 'TEXTURE1', 'TEXTURE_2D', 'UNPACK_FLIP_Y_WEBGL', 'UNPACK_PREMULTIPLY_ALPHA_WEBGL',
    'TEXTURE_WRAP_S', 'TEXTURE_WRAP_T', 'CLAMP_TO_EDGE', 'TEXTURE_MIN_FILTER',
    'TEXTURE_MAG_FILTER', 'LINEAR', 'RGBA', 'UNSIGNED_BYTE', 'BLEND', 'ONE',
    'ONE_MINUS_SRC_ALPHA', 'DEPTH_TEST', 'COLOR_BUFFER_BIT', 'TRIANGLES', 'UNSIGNED_SHORT'];
  constants.forEach((name, i) => { gl[name] = i + 1; });
  gl.NO_ERROR = 0;
  for (const name of ['shaderSource', 'compileShader', 'deleteShader', 'attachShader',
    'linkProgram', 'useProgram', 'bindBuffer', 'bufferData', 'enableVertexAttribArray',
    'vertexAttribPointer', 'activeTexture', 'uniform1i', 'pixelStorei', 'bindTexture',
    'texParameteri', 'enable', 'blendFunc', 'disable', 'clearColor', 'deleteTexture',
    'deleteBuffer', 'deleteProgram', 'viewport', 'bufferSubData']) gl[name] = () => {};
  for (const name of ['createShader', 'createProgram', 'createBuffer', 'createTexture']) {
    gl[name] = () => options.allocationFailure === name ? null : {};
  }
  gl.getShaderParameter = () => !options.shaderFailure;
  gl.getProgramParameter = () => !options.linkFailure;
  gl.getAttribLocation = (_program, name) => name === 'a_position' ? 0 : 1;
  gl.getUniformLocation = () => ({});
  gl.texImage2D = () => { preparations++; };
  gl.getError = () => options.textureFailure || drawError ? 1282 : 0;
  gl.isContextLost = () => glLost;
  gl.clear = () => { poseSamples = []; lookSamples = []; };
  gl.uniform1f = (_location, value) => { lookSamples.push(value); };
  gl.drawElements = () => { draws++; };
  function canvas() {
    const e = element(); e.width = 300; e.height = 150;
    const twoD = {
      drawImage() {}, setTransform() {}, clearRect() {}, putImageData() {},
      // Representative chroma/opaque samples; no full-image pixel allocation.
      getImageData: () => ({ data: new Uint8ClampedArray([0, 255, 0, 255, 110, 70, 35, 255]) }),
    };
    e.getContext = kind => kind === '2d' ? (options.no2D ? null : twoD)
      : (kind === 'webgl' && !options.noGL ? gl : null);
    return e;
  }
  const layer = element('garden-deer'), scene = element('garden-scene'), water = element('garden-water');
  let rect = options.rect || { width: 1672, height: 941 };
  scene.getBoundingClientRect = () => rect;
  scene.hidden = Boolean(options.sceneHidden);
  water.dataset.state = options.state || 'paused';
  const document = Object.assign(eventTarget(), {
    hidden: Boolean(options.documentHidden),
    getElementById: id => ({ 'garden-deer': layer, 'garden-scene': scene, 'garden-water': water })[id] || null,
    createElement: name => { assert.equal(name, 'canvas'); return canvas(); },
  });
  const reduced = Object.assign(eventTarget(), { matches: Boolean(options.reduced) });
  reduced.addListener = fn => reduced.addEventListener('change', fn);
  const win = eventTarget();
  const instrumentedModel = { ...model, transformPoint(x, y, pose, rig) {
    if (x === 0 && y === 0) poseSamples.push(pose);
    return model.transformPoint(x, y, pose, rig);
  } };
  class MockMutationObserver {
    constructor(fn) { this.fn = fn; this.calls = 0; }
    observe(target, config) { this.target = target; this.options = config; observers.push(this); }
  }
  class MockResizeObserver {
    constructor(fn) { this.fn = fn; resizeObservers.push(this); }
    observe(target) { this.target = target; }
  }
  class MockImage {
    constructor() {
      images.push(this); this.naturalWidth = options.imageWidth ?? 1536;
      this.naturalHeight = options.imageHeight ?? 1024;
    }
    set src(value) { this.url = value; requests.push(value); }
    get src() { return this.url; }
  }
  const sandbox = {
    window: win, document, Image: MockImage, MutationObserver: MockMutationObserver,
    ResizeObserver: MockResizeObserver, matchMedia: () => reduced,
    devicePixelRatio: options.dpr || 1, console,
    requestAnimationFrame(fn) {
      const id = nextRaf++; queue.set(id, fn); requestsMade++;
      maxPending = Math.max(maxPending, queue.size); return id;
    },
    cancelAnimationFrame: id => queue.delete(id),
    setTimeout(fn, delay) {
      assert.equal(typeof fn, 'function'); assert.ok(Number.isFinite(delay) && delay >= 0);
      const id = nextTimer++; timers.set(id, { fn, due: clock + delay });
      maxTimers = Math.max(maxTimers, timers.size); return id;
    },
    clearTimeout: id => timers.delete(id),
    fetch() { throw new Error('Unexpected network API'); },
    localStorage: new Proxy({}, { get() { throw new Error('Unexpected persistent storage'); } }),
    sessionStorage: new Proxy({}, { get() { throw new Error('Unexpected persistent storage'); } }),
  };
  Object.assign(win, { GardenDeerPose: instrumentedModel, ResizeObserver: MockResizeObserver });
  const context = vm.createContext(sandbox);
  vm.runInContext(source, context, { filename: 'garden-deer-v1.js' });
  async function load(failIndex = -1) {
    images.forEach((image, i) => i === failIndex ? image.onerror() : image.onload());
    for (let i = 0; i < 6; i++) await Promise.resolve();
    flushObservers();
  }
  function advanceTime(ms) {
    assert.ok(Number.isFinite(ms) && ms >= 0);
    const end = clock + ms;
    for (let count = 0; ; count++) {
      assert.ok(count < 1000, 'timer loop did not yield to rendering');
      const next = [...timers.entries()].sort((a, b) => a[1].due - b[1].due)[0];
      if (!next || next[1].due > end) break;
      clock = next[1].due; timers.delete(next[0]); next[1].fn(); flushObservers();
    }
    clock = end;
  }
  function step(ms = 16) {
    advanceTime(ms);
    const pending = [...queue.values()]; queue.clear();
    for (const fn of pending) {
      const before = draws; fn(clock);
      if (draws !== before) renders.push({ poses: [...poseSamples], looks: [...lookSamples],
        frames: layer.dataset.frameCount, time: clock });
    }
    flushObservers();
  }
  function settle(limit = 400) {
    for (let i = 0; queue.size && i < limit; i++) step();
    assert.equal(queue.size, 0, 'animation did not settle within bounded frames');
  }
  return {
    layer, scene, water, document, reduced, observers, requests, renders, load, step, settle, advanceTime,
    get pending() { return queue.size; }, get requestsMade() { return requestsMade; },
    get maxPending() { return maxPending; }, get draws() { return draws; },
    get pendingTimers() { return timers.size; }, get maxTimers() { return maxTimers; },
    get nextTimerDelay() { return timers.size ? Math.min(...[...timers.values()].map(t => t.due - clock)) : null; },
    get preparations() { return preparations; },
    get fallback() { return layer.children[0]; }, get canvas() { return layer.children[1]; },
    get lastPoses() { return renders.at(-1)?.poses || []; },
    get lastLooks() { return renders.at(-1)?.looks || []; },
    waterState(value) { water.dataset.state = value; flushObservers(); },
    waterFrame(value) { water.dataset.frameCount = value; flushObservers(); },
    sceneHidden(value) { scene.hidden = value; flushObservers(); },
    documentHidden(value) { document.hidden = value; document.dispatch('visibilitychange'); },
    reducedMotion(value) { reduced.matches = value; reduced.dispatch('change'); },
    resize(value) { rect = value; for (const observer of resizeObservers) observer.fn(); flushObservers(); },
    failDraw() { drawError = true; },
    lose() {
      glLost = true; let prevented = false;
      this.canvas.dispatch('webglcontextlost', { preventDefault() { prevented = true; } });
      assert.equal(prevented, true, 'context loss must permit restoration');
    },
    restore() { glLost = false; this.canvas.dispatch('webglcontextrestored'); },
    rerun() { vm.runInContext(source, context); },
  };
}

function upright(f) {
  assert.equal(f.layer.dataset.pose, 'upright');
  assert.ok(f.lastPoses.every(value => value === 0));
  assert.ok(f.lastLooks.every(value => value === 0));
}
function drinking(f) {
  assert.equal(f.layer.dataset.pose, 'drinking');
  assert.ok(f.lastPoses.length > 0 && f.lastPoses.every(value => value === 1));
  assert.ok(f.lastLooks.every(value => value === 0));
}
function fallback(f) {
  assert.equal(f.canvas.hidden, true); assert.equal(f.fallback.hidden, false);
  assert.equal(f.layer.dataset.pose, 'upright'); assert.equal(f.pending, 0);
  assert.equal(f.pendingTimers, 0);
}

(async () => {
  await check('initial running state reaches drinking and rests with one timer and no RAF', async () => {
    const f = fixture({ state: 'running' }); await f.load(); f.settle(); drinking(f);
    assert.equal(f.pendingTimers, 1); assert.equal(f.nextTimerDelay, 9000);
    const count = f.draws; f.advanceTime(8999); assert.equal(f.draws, count); assert.equal(f.pending, 0);
    assert.equal(f.maxPending, 1); assert.equal(f.maxTimers, 1);
    assert.equal(f.canvas.hidden, false); assert.equal(f.fallback.hidden, true);
  });
  await check('periodic cycle drinks for nine seconds, looks forward, holds, then lowers', async () => {
    const f = fixture({ state: 'running' }); await f.load(); f.settle(); drinking(f);
    const count = f.draws;
    f.advanceTime(8999); assert.equal(f.draws, count); assert.equal(f.pending, 0);
    f.advanceTime(1); assert.equal(f.pending, 1); assert.equal(f.pendingTimers, 0);
    f.settle();
    assert.equal(f.layer.dataset.pose, 'alert');
    assert.ok(f.lastPoses.every(value => value === 0));
    assert.ok(f.lastLooks.length > 0 && f.lastLooks.every(value => value === 1));
    assert.equal(f.pendingTimers, 1); assert.equal(f.nextTimerDelay, 2300);
    const alertDraws = f.draws;
    f.advanceTime(2299); assert.equal(f.draws, alertDraws); assert.equal(f.pending, 0);
    f.advanceTime(1); assert.equal(f.pending, 1); assert.equal(f.pendingTimers, 0);
    f.settle(); drinking(f);
    assert.equal(f.pendingTimers, 1); assert.equal(f.nextTimerDelay, 9000);
    assert.equal(f.maxPending, 1); assert.equal(f.maxTimers, 1);
    assert.ok(f.renders.some(frame => frame.looks.some(value => value > 0 && value < 1)),
      'front-facing blend must transition through intermediate values');
  });
  await check('mother raises first; young waits half a second on periodic raising and Pause', async () => {
    for (const trigger of ['periodic', 'pause']) {
      const f = fixture({ state: 'running' }); await f.load(); f.settle(); drinking(f);
      if (trigger === 'periodic') f.advanceTime(9000); else f.waterState('paused');
      f.step(0); // Establish the first visible transition timestamp.
      assert.deepEqual(f.lastPoses, [1, 1]);
      for (let elapsed = 40; elapsed <= 480; elapsed += 40) {
        f.step(40);
        assert.ok(f.lastPoses[0] < 1, trigger + ': mother did not begin raising');
        assert.equal(f.lastPoses[1], 1, trigger + ': young moved before the half-second delay');
      }
      f.step(20); // At 500 ms the frame cap may retain the 480 ms render.
      assert.equal(f.lastPoses[1], 1, trigger + ': young moved before delay was consumed');
      f.step(20); // First rendered frame after the half-second boundary.
      assert.ok(f.lastPoses[1] < 1, trigger + ': young did not move after the delay');
      assert.ok(f.lastPoses[0] < f.lastPoses[1], trigger + ': mother lost its raising lead');
      f.settle();
      assert.equal(f.layer.dataset.pose, trigger === 'periodic' ? 'alert' : 'upright');
      assert.equal(f.maxPending, 1); assert.equal(f.maxTimers, 1);
    }
  });
  await check('Pause from the alert hold returns to upright profile and cancels future cycles', async () => {
    const f = fixture({ state: 'running' }); await f.load(); f.settle();
    f.advanceTime(9000); f.settle(); assert.equal(f.layer.dataset.pose, 'alert');
    f.waterState('paused'); assert.equal(f.pendingTimers, 0); f.settle(); upright(f);
    const draws = f.draws; f.advanceTime(30000);
    assert.equal(f.draws, draws); assert.equal(f.pending, 0); assert.equal(f.pendingTimers, 0);
  });
  for (const kind of ['document', 'scene']) {
    for (const phase of ['drink', 'alert']) {
      await check(kind + ' hiding cancels the ' + phase + ' hold timer until resumed', async () => {
        const f = fixture({ state: 'running' }); await f.load(); f.settle();
        if (phase === 'alert') { f.advanceTime(9000); f.settle(); }
        const pose = f.lastPoses, looks = f.lastLooks, count = f.draws;
        const hide = value => kind === 'document' ? f.documentHidden(value) : f.sceneHidden(value);
        hide(true); f.waterState('hidden');
        assert.equal(f.pending, 0); assert.equal(f.pendingTimers, 0);
        f.advanceTime(30000); assert.equal(f.draws, count);
        hide(false); f.waterState('starting'); f.waterState('running'); f.settle();
        assert.deepEqual(f.lastPoses, pose); assert.deepEqual(f.lastLooks, looks);
        assert.equal(f.pendingTimers, 1); assert.equal(f.maxTimers, 1); assert.equal(f.maxPending, 1);
      });
    }
  }
  await check('reduced motion cancels alert hold and disables the periodic loop during explicit Play', async () => {
    const f = fixture({ state: 'running' }); await f.load(); f.settle();
    f.advanceTime(9000); f.settle(); assert.equal(f.layer.dataset.pose, 'alert');
    // Explicit Play is supported under reduced motion; it may select drinking,
    // but neither pose interpolation nor periodic timers may remain active.
    f.reducedMotion(true); assert.equal(f.pendingTimers, 0); f.step(); drinking(f);
    assert.equal(f.pending, 0); assert.equal(f.pendingTimers, 0);
    const count = f.draws; f.advanceTime(30000); assert.equal(f.draws, count);
  });
  await check('context loss clears the resting timer before recovery', async () => {
    const f = fixture({ state: 'running' }); await f.load(); f.settle();
    assert.equal(f.pendingTimers, 1); f.lose(); fallback(f);
    f.advanceTime(30000); assert.equal(f.pending, 0); assert.equal(f.pendingTimers, 0);
    f.restore(); f.settle(); drinking(f); assert.equal(f.pendingTimers, 1);
  });
  await check('active rendering is capped at thirty draws per second', async () => {
    const f = fixture({ state: 'running' }); await f.load();
    let callbacks = 0;
    // Drive a 120 Hz display only while the real, unmodified transition runs.
    // Its duration may change; the frame-spacing requirement does not.
    while (f.pending && callbacks < 240) { f.step(1000 / 120); callbacks++; }
    drinking(f); assert.equal(f.pending, 0);
    assert.ok(f.renders.length > 2 && callbacks > f.renders.length,
      'test must observe intermediate renders and throttled RAF callbacks');
    assert.ok(f.renders.some(frame => frame.poses.some(value => value > 0 && value < 1)));
    for (let i = 1; i < f.renders.length; i++) {
      assert.ok(f.renders[i].time - f.renders[i - 1].time >= 1000 / 30 - .5,
        'deer drew faster than the declared thirty-frame cap');
    }
  });
  await check('observed lowering speed is sixty percent of the faster raising speed', async () => {
    const f = fixture(); await f.load(); f.settle();
    const lowerStart = f.renders.length;
    f.waterState('running'); f.settle(); drinking(f);
    const lowering = f.renders.slice(lowerStart), raiseStart = f.renders.length;
    f.waterState('paused'); f.settle(); upright(f);
    const raising = f.renders.slice(raiseStart);
    function observedSpeed(frames, animal, direction) {
      const samples = [];
      for (let i = 1; i < frames.length; i++) {
        const from = frames[i - 1].poses[animal], to = frames[i].poses[animal];
        // Exclude waits and endpoint clamping. Infer full-travel speed from
        // actual pose changes passed to the mesh, without reading durations.
        if (from > 0 && from < 1 && to > 0 && to < 1 && (to - from) * direction > 0) {
          samples.push(Math.abs(to - from) * 1000 / (frames[i].time - frames[i - 1].time));
        }
      }
      assert.ok(samples.length >= 2, 'insufficient moving frames to measure travel speed');
      return samples.reduce((sum, value) => sum + value, 0) / samples.length;
    }
    for (const [animal, originalRiseSeconds] of [2.5, 2.9].entries()) {
      const lowerSpeed = observedSpeed(lowering, animal, 1);
      const raiseSpeed = observedSpeed(raising, animal, -1);
      assert.ok(Math.abs(lowerSpeed / raiseSpeed - .6) < 1e-8,
        'lowering did not travel at sixty percent of raising speed');
      assert.ok(Math.abs(1 / raiseSpeed - originalRiseSeconds / 8) < 1e-8,
        'observed raising travel did not use the requested eightfold speed');
    }
  });
  await check('Pause raises the deer and settles upright', async () => {
    const f = fixture({ state: 'running' }); await f.load(); f.settle();
    f.waterState('paused'); assert.equal(f.pendingTimers, 0);
    f.settle(); upright(f); assert.equal(f.pending, 0); assert.equal(f.pendingTimers, 0);
  });
  await check('late initialization catches paused state with one static draw', async () => {
    const f = fixture(); await f.load(); f.settle(); upright(f);
    assert.equal(f.renders.length, 1);
  });
  await check('rapid reversals continue from the current pose with one pending frame', async () => {
    const f = fixture({ state: 'running' }); await f.load();
    for (let i = 0; i < 24; i++) f.step();
    const before = f.lastPoses;
    assert.ok(before.every(value => value > 0 && value < 1));
    f.waterState('paused'); f.step(); assert.deepEqual(f.lastPoses, before);
    f.step(40); const descending = f.lastPoses;
    assert.ok(descending[0] < before[0]);
    assert.equal(descending[1], before[1], 'young should retain its pose during the raising delay');
    f.waterState('running'); f.step(); assert.deepEqual(f.lastPoses, descending);
    f.settle(); drinking(f); assert.equal(f.maxPending, 1);
  });
  await check('water observer ignores the continuously changing frame counter', async () => {
    const f = fixture(); await f.load(); f.settle();
    const observer = f.observers.find(item => item.target === f.water);
    assert.deepEqual([...observer.options.attributeFilter], ['data-state']);
    const calls = observer.calls, requests = f.requestsMade;
    for (let i = 0; i < 100; i++) f.waterFrame(i);
    assert.equal(observer.calls, calls); assert.equal(f.requestsMade, requests);
  });
  for (const kind of ['document', 'scene']) {
    await check(kind + ' hiding cancels an active tween and resumes its pose', async () => {
      const f = fixture({ state: 'running' }); await f.load();
      for (let i = 0; i < 20; i++) f.step();
      const pose = f.lastPoses, draws = f.draws;
      const hide = value => kind === 'document' ? f.documentHidden(value) : f.sceneHidden(value);
      hide(true); assert.equal(f.pending, 0); f.step(10000); assert.equal(f.draws, draws);
      f.waterState('hidden'); hide(false); f.waterState('starting'); f.step();
      assert.deepEqual(f.lastPoses, pose); f.waterState('running'); f.settle(); drinking(f);
      assert.equal(f.maxPending, 1);
    });
  }
  await check('initially hidden scene does not draw before becoming visible', async () => {
    const f = fixture({ state: 'running', sceneHidden: true }); await f.load();
    assert.equal(f.draws, 0); assert.equal(f.pending, 0);
    f.sceneHidden(false); f.settle(); drinking(f);
  });
  await check('reduced motion snaps to requested endpoints without a tween', async () => {
    const f = fixture({ state: 'reduced-motion', reduced: true }); await f.load(); f.settle(); upright(f);
    const count = f.renders.length; f.waterState('running'); f.step(); drinking(f);
    assert.equal(f.renders.length, count + 1); assert.equal(f.pending, 0);
    f.waterState('reduced-motion'); f.step(); upright(f); assert.equal(f.pending, 0);
  });
  await check('a reduced-motion change cancels a live tween and does not resume on its own', async () => {
    const f = fixture({ state: 'running' }); await f.load();
    for (let i = 0; i < 20; i++) f.step();
    // The existing water preference handler pauses first; the deer reads that state.
    f.waterState('reduced-motion'); f.reducedMotion(true); f.step(); upright(f);
    assert.equal(f.pending, 0); f.reducedMotion(false); f.settle(); upright(f);
  });
  await check('settled poses redraw on resize within the sprite pixel budget', async () => {
    const f = fixture({ dpr: 3 }); await f.load(); f.settle();
    const count = f.renders.length; f.resize({ width: 3840, height: 2160 }); f.settle();
    assert.equal(f.renders.length, count + 1); upright(f);
    assert.ok(f.canvas.width * f.canvas.height <= 352000, 'rounded buffer exceeds bounded pixel budget');
    assert.equal(f.canvas.width, f.fallback.width); assert.equal(f.canvas.height, f.fallback.height);
  });
  await check('zero-size layout waits without spinning and recovers on resize', async () => {
    const f = fixture({ state: 'running', rect: { width: 0, height: 0 } }); await f.load(); f.step();
    assert.equal(f.pending, 0); assert.equal(f.draws, 0);
    f.resize({ width: 390, height: 220 }); f.settle(); drinking(f);
  });
  await check('image failure hides only the optional deer layer', async () => {
    const f = fixture({ state: 'running' }); await f.load(0);
    assert.equal(f.layer.hidden, true); assert.equal(f.layer.dataset.state, 'unavailable');
    assert.equal(f.pending, 0); assert.equal(f.water.dataset.state, 'running'); assert.equal(f.scene.hidden, false);
  });
  await check('failure of the alert artwork also hides the optional layer without timers', async () => {
    const f = fixture({ state: 'running' }); await f.load(2);
    assert.equal(f.layer.hidden, true); assert.equal(f.layer.dataset.state, 'unavailable');
    assert.equal(f.pending, 0); assert.equal(f.pendingTimers, 0);
    assert.equal(f.water.dataset.state, 'running');
  });
  await check('unexpected image dimensions are rejected before GPU preparation', async () => {
    const f = fixture({ state: 'running', imageWidth: 0 }); await f.load();
    assert.equal(f.layer.hidden, true); assert.equal(f.layer.dataset.state, 'unavailable');
    assert.equal(f.preparations, 0); assert.equal(f.pending, 0);
  });
  await check('unavailable local compositor isolates failure to the optional layer', async () => {
    const f = fixture({ state: 'running', no2D: true }); await f.load();
    assert.equal(f.layer.hidden, true); assert.equal(f.layer.dataset.state, 'unavailable');
    assert.equal(f.pending, 0); assert.equal(f.water.dataset.state, 'running');
  });
  await check('unavailable WebGL keeps the composed upright fallback', async () => {
    const f = fixture({ state: 'running', noGL: true }); await f.load(); fallback(f);
    f.waterState('paused'); f.resize({ width: 390, height: 220 }); fallback(f);
    assert.equal(f.draws, 0); assert.equal(f.layer.hidden, false);
  });
  for (const fault of [{ shaderFailure: true }, { linkFailure: true }, { textureFailure: true },
    { allocationFailure: 'createBuffer' }, { allocationFailure: 'createTexture' }]) {
    await check('GPU preparation failure uses fallback: ' + JSON.stringify(fault), async () => {
      const f = fixture({ state: 'running', ...fault }); await f.load(); fallback(f);
      assert.equal(f.water.dataset.state, 'running');
    });
  }
  await check('a draw error stops scheduling and leaves the upright fallback', async () => {
    const f = fixture({ state: 'running' }); await f.load(); f.step(); f.failDraw(); f.step(40); fallback(f);
    assert.equal(f.layer.dataset.state, 'fallback');
  });
  await check('context loss cancels the tween and restore follows the latest water target', async () => {
    const f = fixture({ state: 'running' }); await f.load(); f.settle(); f.lose(); fallback(f);
    assert.equal(f.layer.dataset.state, 'context-lost');
    const preparations = f.preparations; f.waterState('paused'); f.restore(); f.settle(); upright(f);
    assert.ok(f.preparations > preparations, 'restoration must upload new context textures');
    assert.equal(f.maxPending, 1);
  });
  await check('restoration starts from the visible upright fallback without a pose flash', async () => {
    const f = fixture({ state: 'running' }); await f.load(); f.settle(); f.lose(); fallback(f);
    f.waterState('paused'); f.restore(); f.step();
    assert.ok(f.lastPoses.length > 0 && f.lastPoses.every(value => value === 0),
      'first restored frame reused the pre-loss drinking pose although fallback was upright');
  });
  await check('context restoration while hidden schedules nothing until visibility returns', async () => {
    const f = fixture({ state: 'running' }); await f.load(); f.step(); f.lose();
    f.sceneHidden(true); f.restore(); assert.equal(f.pending, 0);
    f.sceneHidden(false); f.settle(); drinking(f);
  });
  await check('initialization is idempotent and requests only the three local art files', async () => {
    const f = fixture(); await f.load(); f.settle();
    const children = f.layer.children.length, observers = f.observers.length;
    f.rerun(); assert.equal(f.layer.children.length, children); assert.equal(f.observers.length, observers);
    assert.equal(f.requests.length, 3);
    assert.ok(f.requests.every(url => /^assets\/garden-deer-[a-z]+-v1\.webp$/.test(url)));
    assert.equal(f.water.dataset.state, 'paused');
  });
  console.log(`Garden deer runtime: ${passed} passed, ${failed} failed (synthetic lifecycle; no GPU/browser claim).`);
  process.exitCode = failed ? 1 : 0;
})();
