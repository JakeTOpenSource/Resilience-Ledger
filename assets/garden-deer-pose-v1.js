/* Pure image-space deer posing. Coordinates use the original bitmap, Y downward.
 * advance() stores linear progress; transformPoint() applies smooth() internally.
 * No DOM, timers, storage, image loading, or renderer dependencies.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GardenDeerPose = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function finite(value, name) {
    if (!Number.isFinite(value)) throw new TypeError(name + ' must be finite.');
    return value;
  }
  function clamp(value) { return Math.max(0, Math.min(1, value)); }
  function smooth(value) {
    const t = clamp(finite(value, 'pose'));
    return t * t * (3 - 2 * t);
  }
  function ramp(start, end, value) { return smooth((value - start) / (end - start)); }

  function stateTarget(state, currentTarget = 0) {
    if (state === 'running') return 1;
    if (['paused', 'reduced-motion', 'error', 'unavailable', 'context-lost'].indexOf(state) >= 0) return 0;
    return currentTarget;
  }

  // A duration is the time for the complete 0-to-1 travel. Reversing the target
  // continues from the current pose; it does not start a new easing timeline.
  function advance(current, target, dtSeconds, durationSeconds = 1) {
    const from = clamp(finite(current, 'current'));
    const to = clamp(finite(target, 'target'));
    finite(dtSeconds, 'dtSeconds');
    finite(durationSeconds, 'durationSeconds');
    if (dtSeconds <= 0 || from === to) return from;
    if (durationSeconds <= 0) return to;
    const distance = Math.min(Math.abs(to - from), dtSeconds / durationSeconds);
    return from + Math.sign(to - from) * distance;
  }

  function rotate(x, y, pivot, angle) {
    const dx = x - pivot[0], dy = y - pivot[1];
    const c = Math.cos(angle), s = Math.sin(angle);
    return [pivot[0] + dx * c - dy * s, pivot[1] + dx * s + dy * c];
  }

  function mixPoint(a, b, weight) {
    return [a[0] + (b[0] - a[0]) * weight, a[1] + (b[1] - a[1]) * weight];
  }

  // Position and tangent of the bent centerline. Thirds make its zero-angle
  // limit exactly the original segment, including points between the endpoints.
  function neckCurve(root, head, angle, s) {
    const dx = head[0] - root[0], dy = head[1] - root[1];
    const p1 = rotate(root[0] + dx / 3, root[1] + dy / 3, root, angle * 0.55);
    const p2 = rotate(root[0] + dx * 2 / 3, root[1] + dy * 2 / 3, root, angle * 0.84);
    const p3 = rotate(head[0], head[1], root, angle);
    const r = 1 - s;
    return [
      r * r * r * root[0] + 3 * r * r * s * p1[0] + 3 * r * s * s * p2[0] + s * s * s * p3[0],
      r * r * r * root[1] + 3 * r * r * s * p1[1] + 3 * r * s * s * p2[1] + s * s * s * p3[1],
      3 * r * r * (p1[0] - root[0]) + 6 * r * s * (p2[0] - p1[0]) + 3 * s * s * (p3[0] - p2[0]),
      3 * r * r * (p1[1] - root[1]) + 6 * r * s * (p2[1] - p1[1]) + 3 * s * s * (p3[1] - p2[1])
    ];
  }

  // Skinning weights blend from the shoulder into the neck, then into a rigid
  // skull region. Positive angles are clockwise in these top-down coordinates.
  // Returns [x,y]. The original torso/legs remain stationary; no global tilt.
  function transformPoint(x, y, pose, rig) {
    finite(x, 'x'); finite(y, 'y');
    const amount = smooth(pose);
    if (amount === 0) return [x, y];
    if (!rig || !Array.isArray(rig.root) || !Array.isArray(rig.head)) throw new TypeError('rig needs root and head pairs.');
    const root = [finite(rig.root[0], 'root.x'), finite(rig.root[1], 'root.y')];
    const head = [finite(rig.head[0], 'head.x'), finite(rig.head[1], 'head.y')];
    const neckAngle = finite(rig.neckAngle, 'neckAngle') * amount;
    const headAngle = finite(rig.headAngle, 'headAngle') * smooth((pose - 0.08) / 0.92);
    const dx = head[0] - root[0], dy = head[1] - root[1];
    const lengthSquared = dx * dx + dy * dy;
    if (!(lengthSquared > 0) || !Number.isFinite(lengthSquared)) throw new RangeError('rig root and head must be distinct finite points.');

    // Exact anchors include the requested rear-body and lower-leg exclusion.
    // The vertical ramp also plants everything at or below the neck root.
    if (x <= root[0] - 120 || y >= root[1]) return [x, y];
    const along = ((x - root[0]) * dx + (y - root[1]) * dy) / lengthSquared;
    const shoulder = ramp(root[0] - 120, root[0] + 40, x);
    const aboveBody = 1 - ramp(root[1] - 80, root[1], y);
    const neckWeight = ramp(0.05, 0.72, along) * shoulder * aboveBody;
    if (neckWeight === 0) return [x, y];

    // The muzzle extends right of the skull pivot and the ears extend above it.
    // Keep that whole region rigid, with a soft join behind/below the head;
    // a radial cutoff would let the nose rotate differently from the skull.
    const headWeight = ramp(head[0] - 190, head[0] - 90, x)
      * (1 - ramp(head[1] + 40, head[1] + 150, y))
      * ramp(0.85, 1, neckWeight);
    const headPivot = rotate(head[0], head[1], root, neckAngle);
    const skullOffset = rotate(x, y, head, neckAngle + headAngle);
    const skullPoint = [headPivot[0] + skullOffset[0] - head[0], headPivot[1] + skullOffset[1] - head[1]];
    if (headWeight === 1) return skullPoint;

    const length = Math.sqrt(lengthSquared), s = clamp(along);
    const curve = neckCurve(root, head, neckAngle, s);
    const tangentLength = Math.hypot(curve[2], curve[3]);
    const tx = tangentLength > 1e-8 ? curve[2] / tangentLength : dx / length;
    const ty = tangentLength > 1e-8 ? curve[3] / tangentLength : dy / length;
    const side = ((x - root[0]) * -dy + (y - root[1]) * dx) / length;
    const extension = (along - s) * length;
    // Carry thickness along the local normal rather than stretching it along
    // a rotating arm. Blend at the planted shoulder and at the rigid skull.
    const mapped = [curve[0] + tx * extension - ty * side, curve[1] + ty * extension + tx * side];
    const neckPoint = mixPoint([x, y], mapped, neckWeight);
    return mixPoint(neckPoint, skullPoint, headWeight);
  }

  function coverCentered(imageWidth, imageHeight, boxWidth, boxHeight) {
    const sizes = [imageWidth, imageHeight, boxWidth, boxHeight];
    sizes.forEach(value => {
      if (!Number.isFinite(value) || value <= 0) throw new RangeError('Image and box dimensions must be finite and positive.');
    });
    const scale = Math.max(boxWidth / imageWidth, boxHeight / imageHeight);
    return { scale, left: (boxWidth - imageWidth * scale) / 2, top: (boxHeight - imageHeight * scale) / 2 };
  }

  return Object.freeze({ stateTarget, advance, smooth, transformPoint, coverCentered });
});
