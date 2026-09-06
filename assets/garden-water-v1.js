/*
 * Hanging garden: local WebGL water overlay, no library, storage, or remote call.
 * Markup: #garden-scene contains img#garden-still and canvas#garden-water.
 * Also required: button#motion-toggle and #motion-status[role=status]. Load defer.
 * CSS: scene is a decorative stage layer; image/canvas share its full box.
 * Set image object-position:50% 50%. Keep the image aspect on narrow screens.
 * Optional #home integration suspends the scene while an Atlas tool is open.
 * The cover transform is derived from that computed image position on resize.
 * Masks are authored in pixels of hanging-garden-v1.webp (1672 x 941).
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

        // Pools drift toward the foreground-left. Two-dimensional texture
        // avoids the ambiguous sideways direction of parallel wave stripes.
        vec2 poolFlow = p - vec2(-6.0, 10.0) * u_time;
        float surface = noise(poolFlow * vec2(0.035, 0.11)) * 2.0 - 1.0;
        float detail = noise(poolFlow * vec2(0.061, 0.17) + vec2(7.0, 3.0)) * 2.0 - 1.0;
        // A small wash returns sideways beneath the bottom fall. Its pattern
        // still advances down the image; it never climbs the falling strands.
        float washZone = ellipse(p, vec2(1285.0, 700.0), vec2(160.0, 32.0));
        vec2 washFlow = p - vec2(5.0, 3.0) * u_time;
        float wash = noise(washFlow * vec2(0.045, 0.15)) * 2.0 - 1.0;
        surface = mix(surface, wash, washZone * 0.65);
        detail = mix(detail, wash, washZone * 0.45);
        // Distort reflection edges sideways only, keeping their height fixed.
        vec2 rippling = vec2(surface * 0.65 + detail * 0.20, 0.0);
        vec3 reflection = texture2D(u_image, clamp(uv + rippling / u_image_size, 0.0, 1.0)).rgb;
        vec3 moved = mix(reflection, falling, fall / max(fall + pond, 0.001));

        // Irregular, elongated variations follow the same downstream field.
        // Modulate existing color gently; no added white stripe or sine bands.
        float filament = noise(fallFlow * vec2(0.23, 0.08) + vec2(13.0, 5.0));
        moved *= 1.0 + fall * ((filament - 0.5) * 0.045 + (stream - 0.5) * 0.025);
        moved += pond * (surface * 0.006 + detail * 0.002) * vec3(0.60, 0.88, 0.87);
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
