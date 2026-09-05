#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const modulePath = path.join(__dirname, '../../assets/garden-deer-pose-v1.js');
const pose = require(modulePath);
const rigs = {
  mother: { root: [900, 550], head: [1070, 235], neckAngle: 1.95, headAngle: -0.85 },
  fawn: { root: [900, 550], head: [1070, 235], neckAngle: 1.95, headAngle: -0.85 }
};
let passed = 0;
function test(name, run) { run(); passed++; console.log('PASS ' + name); }
function near(actual, expected, tolerance = 1e-9) { assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`); }
function nearPoint(actual, expected, tolerance = 1e-9) { near(actual[0], expected[0], tolerance); near(actual[1], expected[1], tolerance); }

test('browser UMD export works without DOM or CommonJS', () => {
  const sandbox = {};
  vm.runInNewContext(fs.readFileSync(modulePath, 'utf8'), sandbox);
  assert.equal(typeof sandbox.GardenDeerPose.transformPoint, 'function');
  assert.deepEqual(Object.keys(sandbox.GardenDeerPose).sort(), Object.keys(pose).sort());
});
test('running lowers; paused, reduced motion, and failures raise the head', () => {
  assert.equal(pose.stateTarget('running', 0), 1);
  for (const state of ['paused', 'reduced-motion', 'error', 'unavailable', 'context-lost']) assert.equal(pose.stateTarget(state, 1), 0);
});
test('transient and hidden renderer states hold the existing target', () => {
  for (const state of ['loading', 'starting', 'waiting', 'hidden', 'unknown']) {
    assert.equal(pose.stateTarget(state, 1), 1);
    assert.equal(pose.stateTarget(state, 0), 0);
    assert.equal(pose.stateTarget(state, 0.4), 0.4);
  }
});
test('linear phase and render easing have bounded exact endpoints', () => {
  for (const t of [0, 1]) near(pose.smooth(t), t);
  near(pose.smooth(-1), 0); near(pose.smooth(2), 1);
  near(pose.advance(0, 1, 0.25, 2), 0.125);
  near(pose.advance(0.8, 1, 10, 2), 1);
  near(pose.advance(0.2, 0, 10, 2), 0);
  near(pose.advance(0.5, 1, -1, 2), 0.5);
  near(pose.advance(0.5, 1, 0.1, 0), 1);
});
test('advance is independent of frame subdivision', () => {
  let current = 0;
  for (let i = 0; i < 30; i++) current = pose.advance(current, 1, 1 / 30, 2);
  near(current, pose.advance(0, 1, 1, 2));
});

for (const [name, rig] of Object.entries(rigs)) {
  test(name + ': upright endpoint preserves every sampled bitmap coordinate exactly', () => {
    for (let y = 0; y <= 1024; y += 64) for (let x = 0; x <= 1536; x += 64) assert.deepEqual(pose.transformPoint(x, y, 0, rig), [x, y]);
  });
  test(name + ': hooves, lower legs, rear torso, and shoulder root stay planted', () => {
    const points = [[500, 900], [750, 970], [1020, 940], [rig.root[0] - 150, 300],
      [rig.root[0] - 75, rig.root[1] - 60], [rig.root[0], rig.root[1]], [rig.root[0] + 80, rig.root[1] + 120]];
    for (const amount of [0, 0.2, 0.5, 0.8, 1]) for (const point of points) assert.deepEqual(pose.transformPoint(...point, amount, rig), point);
  });
  test(name + ': head center lowers monotonically to the intended neck arc', () => {
    let lastY = rig.head[1];
    for (let i = 0; i <= 100; i++) {
      const point = pose.transformPoint(...rig.head, i / 100, rig);
      assert.ok(Number.isFinite(point[0]) && Number.isFinite(point[1]));
      assert.ok(point[1] >= lastY - 1e-9, 'head rose during lowering');
      lastY = point[1];
    }
    const dx = rig.head[0] - rig.root[0], dy = rig.head[1] - rig.root[1];
    const expected = [rig.root[0] + dx * Math.cos(rig.neckAngle) - dy * Math.sin(rig.neckAngle),
      rig.root[1] + dx * Math.sin(rig.neckAngle) + dy * Math.cos(rig.neckAngle)];
    nearPoint(pose.transformPoint(...rig.head, 1, rig), expected);
    assert.ok(lastY > rig.root[1] + 200, 'head did not reach the lower feeding region');
  });
  test(name + ': skull counterrotation preserves local shape and limits total rotation', () => {
    const center = pose.transformPoint(...rig.head, 1, rig);
    const right = pose.transformPoint(rig.head[0] + 20, rig.head[1], 1, rig);
    const up = pose.transformPoint(rig.head[0], rig.head[1] - 20, 1, rig);
    near(Math.hypot(right[0] - center[0], right[1] - center[1]), 20);
    near(Math.hypot(up[0] - center[0], up[1] - center[1]), 20);
    near((right[0] - center[0]) * (up[0] - center[0]) + (right[1] - center[1]) * (up[1] - center[1]), 0, 1e-7);
    const angle = Math.atan2(right[1] - center[1], right[0] - center[0]);
    near(angle, rig.neckAngle + rig.headAngle);
    assert.ok(Math.abs(angle) < Math.PI / 2, 'skull turned more than a quarter turn');
  });
  test(name + ': skull, muzzle, and ear move as one rigid head', () => {
    const landmarks = [rig.head, [1235, 235], [1020, 120]];
    for (const amount of [0.25, 0.5, 1]) {
      const moved = landmarks.map(point => pose.transformPoint(...point, amount, rig));
      // Center-to-landmark distance alone cannot catch different rotations
      // around the same pivot. Also check the muzzle-to-ear span and vectors.
      for (let a = 0; a < landmarks.length; a++) for (let b = a + 1; b < landmarks.length; b++) {
        near(Math.hypot(moved[a][0] - moved[b][0], moved[a][1] - moved[b][1]),
          Math.hypot(landmarks[a][0] - landmarks[b][0], landmarks[a][1] - landmarks[b][1]));
      }
      const angle = rig.neckAngle * pose.smooth(amount) + rig.headAngle * pose.smooth((amount - 0.08) / 0.92);
      for (let i = 1; i < landmarks.length; i++) {
        const dx = landmarks[i][0] - rig.head[0], dy = landmarks[i][1] - rig.head[1];
        nearPoint([moved[i][0] - moved[0][0], moved[i][1] - moved[0][1]],
          [dx * Math.cos(angle) - dy * Math.sin(angle), dx * Math.sin(angle) + dy * Math.cos(angle)]);
      }
    }
  });
  test(name + ': counter-tilt begins after neck motion without an endpoint jump', () => {
    const amount = 0.04;
    const center = pose.transformPoint(...rig.head, amount, rig);
    const muzzle = pose.transformPoint(1235, 235, amount, rig);
    near(Math.atan2(muzzle[1] - center[1], muzzle[0] - center[0]), rig.neckAngle * pose.smooth(amount));
    for (const point of [[985, 392.5], [1010, 350], rig.head, [1235, 235], [1020, 120]]) {
      nearPoint(pose.transformPoint(...point, 1e-7, rig), point, 1e-8);
      nearPoint(pose.transformPoint(...point, 1 - 1e-7, rig), pose.transformPoint(...point, 1, rig), 1e-8);
    }
  });
  test(name + ': bent neck has a curved centerline without collapsed neighboring sections', () => {
    const dx = rig.head[0] - rig.root[0], dy = rig.head[1] - rig.root[1];
    const samples = [0, 0.2, 0.4, 0.6, 0.8, 1].map(s => pose.transformPoint(rig.root[0] + dx * s, rig.root[1] + dy * s, 1, rig));
    const chord = [samples[5][0] - samples[0][0], samples[5][1] - samples[0][1]];
    const chordLength = Math.hypot(...chord);
    const bow = Math.max(...samples.slice(1, -1).map(p => Math.abs((p[0] - samples[0][0]) * chord[1] - (p[1] - samples[0][1]) * chord[0]) / chordLength));
    assert.ok(bow > 10, 'neck remained a straight pivoting segment');
    for (let i = 1; i < samples.length; i++) {
      const distance = Math.hypot(samples[i][0] - samples[i - 1][0], samples[i][1] - samples[i - 1][1]);
      assert.ok(distance > 1 && distance < Math.hypot(dx, dy), 'neighboring neck sections collapsed or stretched beyond the whole neck');
    }
  });
  test(name + ': reversing a partial pose is continuous and returns upright', () => {
    let amount = pose.advance(0, 1, 0.7, 2);
    const before = pose.transformPoint(...rig.head, amount, rig);
    nearPoint(pose.transformPoint(...rig.head, pose.advance(amount, 0, 0, 2), rig), before);
    const next = pose.advance(amount, 0, 0.001, 2);
    const after = pose.transformPoint(...rig.head, next, rig);
    assert.ok(Math.hypot(after[0] - before[0], after[1] - before[1]) < 1);
    assert.ok(after[1] < before[1], 'reversal did not raise the head');
    for (const point of [[985, 392.5], [1010, 350], [1235, 235], [1020, 120]]) {
      const a = pose.transformPoint(...point, amount, rig), b = pose.transformPoint(...point, next, rig);
      assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) < 1, 'neck or skull jumped when reversing');
    }
    amount = pose.advance(next, 0, 10, 2);
    assert.deepEqual(pose.transformPoint(...rig.head, amount, rig), rig.head);
  });
  test(name + ': skinning stays finite and joins exact body anchors continuously', () => {
    for (let y = 0; y <= 1024; y += 64) for (let x = 0; x <= 1536; x += 64) {
      assert.ok(pose.transformPoint(x, y, 0.6, rig).every(Number.isFinite));
    }
    for (const [x, y] of [[rig.root[0] - 120, rig.head[1]], [rig.root[0] + 70, rig.root[1]]]) {
      const left = pose.transformPoint(x - 1e-5, y - 1e-5, 1, rig);
      const right = pose.transformPoint(x + 1e-5, y + 1e-5, 1, rig);
      assert.ok(Math.hypot(left[0] - right[0], left[1] - right[1]) < 0.001);
    }
  });
}

test('centered cover fits landscape and portrait boxes without geometry drift', () => {
  for (const [iw, ih, bw, bh] of [[1536, 1024, 768, 512], [1672, 941, 390, 844], [1672, 941, 1920, 700]]) {
    const layout = pose.coverCentered(iw, ih, bw, bh);
    assert.ok(iw * layout.scale >= bw - 1e-9 && ih * layout.scale >= bh - 1e-9);
    near(layout.left + iw * layout.scale / 2, bw / 2);
    near(layout.top + ih * layout.scale / 2, bh / 2);
    assert.ok(Math.abs(layout.left) < 1e-9 || Math.abs(layout.top) < 1e-9);
  }
  assert.deepEqual(pose.coverCentered(1536, 1024, 768, 512), {scale: 0.5, left: 0, top: 0});
});
test('invalid numerical inputs fail explicitly instead of producing NaN geometry', () => {
  assert.throws(() => pose.advance(NaN, 1, 0.1, 1), TypeError);
  assert.throws(() => pose.smooth(Infinity), TypeError);
  assert.throws(() => pose.coverCentered(1536, 0, 100, 100), RangeError);
  assert.throws(() => pose.transformPoint(100, 100, 0.5, {root:[1,1],head:[1,1],neckAngle:1,headAngle:0}), RangeError);
});
console.log(`${passed}/${passed} deer pose checks passed. These checks cover geometry and state contracts; visual anatomy and compositing require browser review.`);
