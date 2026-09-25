/*
 * Hanging garden: local WebGL water overlay, no library, storage, or remote call.
 * Markup: #garden-scene contains img#garden-still and canvas#garden-water.
 * Also required: button#motion-toggle and #motion-status[role=status]. Load defer.
 * CSS: scene is a decorative stage layer; image/canvas share its full box.
 * Set image object-position:50% 50%. Keep the image aspect on narrow screens.
 * Optional #home integration suspends the scene while an Atlas tool is open.
 * The cover transform is derived from that computed image position on resize.
 * Masks are authored in pixels of hanging-garden-v1.webp (1672 x 941).
 * The pool moves along a flow field from the foot of the lower fall toward the
 * foreground-left drain (v1.1, 2026-09-25); the falls are unchanged from v1.
 * data-frame-count counts successful WebGL draw submissions, not proof of visible
 * motion or a GPU performance measurement. Inspect the actual browser rendering.
 */
(() => {
  'use strict';

  function init() {
    const scene = document.getElementById('garden-scene');
    const still = document.getElementById('garden-still');
    const canvas = document.getElementById('garden-water');
    const toggle = document.getElementById('motion-toggle');
    const status = document.getElementById('motion-status');
    const home = document.getElementById('home');
    if (!scene || !still || !canvas || !toggle || !status) {
      if (status) status.textContent = 'Water motion could not start: a required page element is missing.';
      if (canvas) canvas.dataset.state = 'error';
      return;
    }
    // Keep initialization private; the only public instrumentation is state/count.
    const initialized = Symbol.for('delta-atlas-garden-water-initialized');
    if (canvas[initialized]) return;
    canvas[initialized] = true;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const FRAME_MS = 1000 / 30;
    const MAX_DPR = 1.5;
    const MAX_PIXELS = 1800000;
    let wantMotion = !reduced.matches;
    let gl = null;
    let program = null;
    let buffer = null;
    let texture = null;
    let uniforms = null;
    let ready = false;
    let failed = false;
    let lost = false;
    let raf = 0;
    let frames = 0;
    let lastPaint = 0;
    let elapsed = 0;
    let geometryDirty = true;
    let width = 0;
    let height = 0;

    Object.assign(still.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%',
      display: 'block', objectFit: 'cover', margin: '0', border: '0', padding: '0',
    });
    Object.assign(canvas.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%',
      display: 'block', margin: '0', border: '0', padding: '0',
      pointerEvents: 'none', visibility: 'hidden',
    });
    canvas.setAttribute('aria-hidden', 'true');
    canvas.dataset.frameCount = '0';
    toggle.type = 'button';
    toggle.disabled = true;
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    function state(name, message) {
      canvas.dataset.state = name;
      const active = name === 'running';
      toggle.setAttribute('aria-pressed', String(active));
      toggle.textContent = active ? 'Pause water' : 'Play water';
      canvas.style.visibility = active ? 'visible' : 'hidden';
      if (message && status.textContent !== message) status.textContent = message;
    }

    function cancelFrame() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lastPaint = 0;
    }

    function fail(message) {
      cancelFrame();
      failed = true;
      ready = false;
      toggle.disabled = true;
      const fallback = still.complete && still.naturalWidth > 0
        ? ' The still garden remains visible.'
        : ' The static garden is unavailable until its image loads.';
      state('error', message + fallback);
    }

    state('loading', 'Preparing water motion.');

    const vertexSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;
    const fragmentSource = `
      #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
      #else
      precision mediump float;
      #endif
      varying vec2 v_uv;
      uniform sampler2D u_image;
      uniform vec2 u_origin;
      uniform vec2 u_span;
      uniform vec2 u_image_size;
      uniform float u_time;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      float ellipse(vec2 p, vec2 center, vec2 radius) {
        float d = length((p - center) / radius);
        return 1.0 - smoothstep(0.94, 1.0, d);
      }
      // A tapered vertical ribbon with feathered ends, in original-image pixels.
      float ribbon(vec2 p, float y0, float y1, float x0, float x1, float w0, float w1) {
        float t = clamp((p.y - y0) / (y1 - y0), 0.0, 1.0);
        float x = mix(x0, x1, t), w = mix(w0, w1, t);
        float endFeather = min(24.0, (y1 - y0) * 0.25);
        return (1.0 - smoothstep(w - 3.0, w, abs(p.x - x)))
          * smoothstep(y0, y0 + 6.0, p.y)
          * (1.0 - smoothstep(y1 - endFeather, y1, p.y));
      }
      float cascades(vec2 p) {
        float m = ribbon(p, 93.0, 165.0, 1226.0, 1246.0, 13.0, 17.0);
        m = max(m, ribbon(p, 173.0, 316.0, 1260.0, 1278.0, 21.0, 30.0));
        m = max(m, ribbon(p, 183.0, 324.0, 1365.0, 1365.0, 39.0, 47.0));
        m = max(m, ribbon(p, 346.0, 444.0, 1420.0, 1424.0, 65.0, 77.0));
        m = max(m, ribbon(p, 457.0, 489.0, 1380.0, 1376.0, 91.0, 98.0));
        // Fade the lower curtain into its splash zone, where the pool begins.
        // Stopping above the foam left an unmoving strip across the foot.
        m = max(m, ribbon(p, 541.0, 687.0, 1259.0, 1288.0, 109.0, 161.0));
        m = max(m, ribbon(p, 563.0, 689.0, 1403.0, 1440.0, 29.0, 39.0));
        return m;
      }
      float pool(vec2 p) {
        float m = ellipse(p, vec2(1168.0, 810.0), vec2(354.0, 152.0));
        // Exclude the stationary bank, foreground stones and right-hand ferns.
        m *= 1.0 - ellipse(p, vec2(1052.0, 842.0), vec2(137.0, 54.0));
        m *= 1.0 - ellipse(p, vec2(736.0, 854.0), vec2(155.0, 157.0));
        m *= 1.0 - ellipse(p, vec2(798.0, 956.0), vec2(201.0, 72.0));
        m *= 1.0 - ellipse(p, vec2(1535.0, 844.0), vec2(142.0, 213.0));
        m *= 1.0 - ellipse(p, vec2(878.0, 726.0), vec2(85.0, 22.0));
        float upper = ellipse(p, vec2(1310.0, 511.0), vec2(128.0, 14.0));
        return max(m, upper);
      }
      // The pool is a flow field, not a uniform drift. Water arrives at the foot
      // of the lower fall, spreads outward through the splash, then drains toward
      // the foreground-left, where the pool leaves the frame. The thin upper basin
      // slides slowly leftward. Speeds are image-space art speeds in
      // pixels per second, not measurements of physical water.
      vec2 poolField(vec2 p, out float near) {
        // The splash is a line along the whole foot of the lower curtain, from
        // its left edge to its right edge, not a point in the middle. Water
        // leaves that line downward and outward, never back up the fall.
        float footY = 698.0;
        vec2 foot = vec2(clamp(p.x, 1140.0, 1470.0), footY);
        vec2 drain = vec2(860.0, 968.0);
        vec2 fromFoot = p - foot;
        // Compress the vertical axis so the splash zone is wide and flat.
        float d = length(fromFoot * vec2(1.0, 1.35));
        near = 1.0 - smoothstep(20.0, 260.0, d);
        // Foam is heavier where the curtain lands hardest; vary it gently along the foot.
        near *= 0.82 + 0.36 * noise(vec2(p.x * 0.012, 3.0));
        // Under the curtain the water fans out slowly from the centre line; past the
        // ends it turns outward more firmly. Never a single point, never a flat sheet.
        vec2 away = normalize(vec2(fromFoot.x * 0.45 + (p.x - 1305.0) * 0.14, max(fromFoot.y, 14.0)));
        vec2 toDrain = drain - p;
        vec2 down = toDrain / max(length(toDrain), 1.0);
        float spread = 1.0 - smoothstep(40.0, 200.0, d);
        vec2 blended = mix(down, away, spread);
        vec2 dir = blended / max(length(blended), 0.05);
        vec2 perp = vec2(-dir.y, dir.x);
        // A slow static meander keeps the streaks from lining up like combed hair.
        dir = normalize(dir + perp * (noise(p * 0.011 + vec2(21.0, 4.0)) - 0.5) * 0.45);
        float upper = ellipse(p, vec2(1310.0, 511.0), vec2(128.0, 14.0));
        dir = normalize(mix(dir, vec2(-0.99, 0.12), upper));
        near = mix(near, 0.30, upper);
        float speed = 5.0 + 11.0 * near;
        return dir * speed;
      }
      // One downstream pass over the pool: ripples refract the reflection,
      // photographed foam is carried along, bubbles at the splash catch light.
      vec3 poolPass(vec2 src, vec2 dir, vec2 perp, float near, vec3 base) {
        // The noise domain uses one fixed downstream axis for the whole pool.
        // Projecting onto the local flow direction instead would rotate the
        // domain from pixel to pixel and alias the ripples into grain wherever
        // the field bends, which is exactly across the pool centre.
        vec2 streakDir = vec2(-0.45, 0.89);
        vec2 streakPerp = vec2(-streakDir.y, streakDir.x);
        vec2 along = vec2(dot(src, streakDir), dot(src, streakPerp));
        // Streaks stretch along the current; ripples are finer across it.
        float ripple = noise(along * vec2(0.028, 0.115)) * 2.0 - 1.0;
        float fine = noise(along * vec2(0.075, 0.21) + vec2(5.0, 2.0)) * 2.0 - 1.0;
        float amp = 0.8 + 3.2 * near;
        vec2 shift = (perp * (ripple * 0.85 + fine * 0.25) + dir * fine * 0.30) * amp;
        vec3 c = texture2D(u_image, clamp((src + shift) / u_image_size, 0.0, 1.0)).rgb;
        // Pull texture only where the pool or curtain masks hold at the source,
        // so the splash directly under the fall keeps moving. The refraction
        // shift above can still reach a few pixels past a mask edge.
        c = mix(base, c, max(pool(src), cascades(src)));
        float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
        float sat = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
        float foam = smoothstep(0.58, 0.82, lum) * (1.0 - smoothstep(0.10, 0.30, sat));
        float glint = noise(src * 0.31 + vec2(11.0, 17.0)) * 2.0 - 1.0;
        c *= 1.0 + foam * near * glint * 0.10;
        c += (1.0 - foam) * (ripple * 0.030 + fine * 0.012) * (0.35 + 0.65 * near) * vec3(0.62, 0.88, 0.90);
        return c;
      }
      void main() {
        // v_uv is bottom-up; HTML object-fit and authored masks are top-down.
        vec2 uv = u_origin + vec2(v_uv.x, 1.0 - v_uv.y) * u_span;
        vec2 p = uv * u_image_size;
        float fall = cascades(p), pond = pool(p);
        float mask = max(fall, pond);
        if (mask < 0.005) { gl_FragColor = vec4(0.0); return; }

        vec3 base = texture2D(u_image, uv).rgb;
        // Warm moss and dark ledges inside a broad ribbon retain their texture.
        float waterLight = smoothstep(0.12, 0.58, dot(base, vec3(0.2126, 0.7152, 0.0722)));
        float greenStone = smoothstep(0.055, 0.18, base.g - base.b);
        fall *= mix(1.0, 0.22, greenStone) * mix(0.18, 1.0, waterLight);

        // Authored coordinates increase downward. Moving every feature through
        // the same upstream sampling coordinate gives it one downstream speed.
        // These are image-space art speeds, not measurements of physical water.
        vec2 fallFlow = p - vec2(0.0, 48.0) * u_time;
        float stream = noise(fallFlow * vec2(0.072, 0.036));
        float fine = noise(fallFlow * vec2(0.17, 0.058) + vec2(4.0, 0.0));
        // Two short downstream passes carry the photographed strands. Each
        // sampling offset resets only when its own contribution is zero.
        // Column offsets keep the whole curtain from pulsing in lockstep.
        float phaseA = fract(u_time * (48.0 / 20.0) + noise(vec2(p.x * 0.043, 2.0)));
        float phaseB = fract(phaseA + 0.5);
        float weightA = 1.0 - abs(2.0 * phaseA - 1.0);
        float sideways = (stream - 0.5) * 0.9 + (fine - 0.5) * 0.3;
        vec2 sourceA = p + vec2(sideways, -20.0 * phaseA);
        vec2 sourceB = p + vec2(sideways, -20.0 * phaseB);
        vec3 passA = texture2D(u_image, clamp(sourceA / u_image_size, 0.0, 1.0)).rgb;
        vec3 passB = texture2D(u_image, clamp(sourceB / u_image_size, 0.0, 1.0)).rgb;
        // At the spill lips and edges, retain the base image instead of pulling
        // a stationary stone/ledge into the moving water as a straight seam.
        passA = mix(base, passA, cascades(sourceA));
        passB = mix(base, passB, cascades(sourceB));
        vec3 falling = mix(passB, passA, weightA);

        // Pool. Two short downstream passes carry the surface along the flow
        // field; each pass resets only when its own weight is zero, so foam and
        // reflections drift without snapping. A static phase offset keeps the
        // whole pool from pulsing in lockstep.
        float near;
        vec2 flowVec = poolField(p, near);
        vec2 dir = normalize(flowVec);
        vec2 perp = vec2(-dir.y, dir.x);
        float cycle = 1.6;
        float phaseP = fract(u_time / cycle + noise(p * vec2(0.013, 0.019) + vec2(3.0, 9.0)));
        float phaseQ = fract(phaseP + 0.5);
        float weightP = 1.0 - abs(2.0 * phaseP - 1.0);
        vec2 sourceP = p - flowVec * (cycle * phaseP);
        vec2 sourceQ = p - flowVec * (cycle * phaseQ);
        vec3 pondColor = mix(poolPass(sourceQ, dir, perp, near, base),
                             poolPass(sourceP, dir, perp, near, base), weightP);
        vec3 moved = mix(pondColor, falling, fall / max(fall + pond, 0.001));

        // Irregular, elongated variations follow the same downstream field.
        // Modulate existing color gently; no added white stripe or sine bands.
        float filament = noise(fallFlow * vec2(0.23, 0.08) + vec2(13.0, 5.0));
        moved *= 1.0 + fall * ((filament - 0.5) * 0.045 + (stream - 0.5) * 0.025);
        gl_FragColor = vec4(clamp(moved, 0.0, 1.0), max(fall, pond));
      }
    `;

    function compile(type, source) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('The graphics device could not allocate a shader.');
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error('This graphics device could not compile the water effect.');
      }
      return shader;
    }

    function offset(position, freeSpace) {
      const values = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };
      if (Object.prototype.hasOwnProperty.call(values, position)) return freeSpace * values[position];
      if (/^-?[\d.]+%$/.test(position)) return freeSpace * parseFloat(position) / 100;
      if (/^-?[\d.]+px$/.test(position)) return parseFloat(position);
      throw new Error('Water motion needs a simple percentage or pixel image position.');
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const imageRect = still.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (!width || !height) return false;
      if (Math.abs(rect.left - imageRect.left) > 0.75 || Math.abs(rect.top - imageRect.top) > 0.75 ||
          Math.abs(width - imageRect.width) > 0.75 || Math.abs(height - imageRect.height) > 0.75) {
        throw new Error('The water canvas and still image do not share the same display box.');
      }
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR,
        Math.sqrt(MAX_PIXELS / (width * height)));
      const renderWidth = Math.max(1, Math.floor(width * dpr));
      const renderHeight = Math.max(1, Math.floor(height * dpr));
      if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
        canvas.width = renderWidth;
        canvas.height = renderHeight;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      const scale = Math.max(width / still.naturalWidth, height / still.naturalHeight);
      const drawnWidth = still.naturalWidth * scale, drawnHeight = still.naturalHeight * scale;
      const position = getComputedStyle(still).objectPosition.trim().split(/\s+/);
      const left = offset(position[0] || '50%', width - drawnWidth);
      const top = offset(position[1] || '50%', height - drawnHeight);
      gl.uniform2f(uniforms.origin, -left / drawnWidth, -top / drawnHeight);
      gl.uniform2f(uniforms.span, width / drawnWidth, height / drawnHeight);
      geometryDirty = false;
      return true;
    }

    function canRun() { return ready && !failed && !lost && wantMotion && !document.hidden && !scene.hidden; }

    function tick(now) {
      raf = 0;
      if (!canRun()) return;
      if (lastPaint && now - lastPaint < FRAME_MS - 0.5) {
        raf = requestAnimationFrame(tick);
        return;
      }
      try {
        if (geometryDirty && !resize()) {
          state('waiting', 'Water motion is waiting for the garden to be visible.');
          return; // ResizeObserver will restart when the box is nonzero.
        }
        const delta = lastPaint ? Math.min((now - lastPaint) / 1000, 0.1) : FRAME_MS / 1000;
        elapsed += delta;
        lastPaint = now;
        gl.uniform1f(uniforms.time, elapsed);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        const error = gl.getError();
        if (gl.isContextLost()) return; // The context-lost handler supplies status/fallback.
        if (error !== gl.NO_ERROR) throw new Error('The graphics device rejected a water frame.');
        frames += 1;
        canvas.dataset.frameCount = String(frames);
        if (canvas.dataset.state !== 'running') state('running', 'Water motion is playing.');
        raf = requestAnimationFrame(tick);
      } catch (error) {
        fail(error.message || 'Water motion could not render.');
      }
    }

    function reconcile() {
      cancelFrame();
      if (failed || lost || !ready) return;
      toggle.disabled = false;
      if (document.hidden) {
        state('hidden', 'Water motion is suspended while this page is hidden.');
      } else if (scene.hidden) {
        state('hidden', 'Water motion is suspended while a tool is open.');
      } else if (!wantMotion) {
        state(reduced.matches ? 'reduced-motion' : 'paused', reduced.matches
          ? 'Water motion is paused for your reduced-motion preference. You can choose Play water.'
          : 'Water motion is paused.');
      } else {
        state('starting', 'Starting water motion.');
        raf = requestAnimationFrame(tick);
      }
    }

    function buildGPU() {
      cancelFrame();
      ready = false;
      failed = false;
      state('loading', 'Preparing water motion.');
      try {
        if (still.naturalWidth !== 1672 || still.naturalHeight !== 941) {
          throw new Error('Water motion is mapped to the 1672 by 941 garden image.');
        }
        gl = canvas.getContext('webgl', {
          alpha: true, premultipliedAlpha: false, antialias: false,
          depth: false, stencil: false, preserveDrawingBuffer: false,
          powerPreference: 'low-power',
        });
        if (!gl) {
          failed = true;
          toggle.disabled = true;
          state('unavailable', 'Water motion is unavailable in this browser. The still garden remains visible.');
          return;
        }
        const vertex = compile(gl.VERTEX_SHADER, vertexSource);
        const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
        program = gl.createProgram();
        if (!program) throw new Error('The graphics device could not allocate the water effect.');
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('The graphics device could not link the water effect.');
        gl.useProgram(program);
        buffer = gl.createBuffer();
        texture = gl.createTexture();
        if (!buffer || !texture) throw new Error('The graphics device could not allocate the garden texture.');
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        uniforms = {
          origin: gl.getUniformLocation(program, 'u_origin'),
          span: gl.getUniformLocation(program, 'u_span'),
          time: gl.getUniformLocation(program, 'u_time'),
        };
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, still);
        gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);
        gl.uniform2f(gl.getUniformLocation(program, 'u_image_size'), still.naturalWidth, still.naturalHeight);
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        if (gl.getError() !== gl.NO_ERROR) throw new Error('The graphics device could not prepare the garden texture.');
        geometryDirty = true;
        ready = true;
        reconcile();
      } catch (error) {
        fail(error.message || 'Water motion could not initialize.');
      }
    }

    toggle.addEventListener('click', () => {
      if (!ready || failed || lost) return;
      wantMotion = !wantMotion;
      reconcile();
    });
    document.addEventListener('visibilitychange', reconcile);
    const preferenceChanged = () => {
      // A newly requested OS reduction pauses immediately. Resuming is explicit.
      if (reduced.matches) wantMotion = false;
      reconcile();
    };
    if (reduced.addEventListener) reduced.addEventListener('change', preferenceChanged);
    else reduced.addListener(preferenceChanged);

    const resized = () => {
      geometryDirty = true;
      if (canRun() && !raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('resize', resized, { passive: true });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', resized, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(resized).observe(scene);
    // The existing router owns #home's display state. Observe it without changing
    // routes, history, iframe loading or the user's chosen motion preference.
    if (home) {
      const syncHomeVisibility = () => {
        const hidden = home.hidden || getComputedStyle(home).display === 'none';
        scene.hidden = hidden;
        toggle.hidden = hidden;
        geometryDirty = true;
        reconcile();
      };
      new MutationObserver(syncHomeVisibility).observe(home, {
        attributes: true, attributeFilter: ['style', 'hidden'],
      });
      syncHomeVisibility();
    }
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      lost = true;
      ready = false;
      cancelFrame();
      toggle.disabled = true;
      state('context-lost', 'Water motion stopped because its graphics context was lost. The still garden remains visible.');
    });
    canvas.addEventListener('webglcontextrestored', () => {
      lost = false;
      buildGPU();
    });
    still.addEventListener('error', () => fail('The garden image could not be loaded.'));
    if (still.complete) {
      if (still.naturalWidth) buildGPU();
      else fail('The garden image could not be loaded.');
    } else still.addEventListener('load', buildGPU, { once: true });
    // No texture request is created here: the already visible local <img> is used.
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
