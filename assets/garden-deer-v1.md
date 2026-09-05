# Garden deer decoration

Generated with OpenAI's built-in image tool for Delta Atlas on 2026-09-05, following the owner's mother-and-youngster direction. Three original 1536 × 1024 WebP sprites provide the mother's profile, the youngster's profile and an alert head variant. Sparse cream markings follow the upper spine. The three served files total 416,140 bytes. These are illustrated wildlife, not an anatomical simulation.

The source sprites contain a green technical matte. The optional renderer removes it once with Canvas2D, then draws a small WebGL1 mesh. The existing water motion state controls the deer: playing permits drinking and occasional alert glances; pausing returns them to an upright profile. The mother raises her head half a second before the youngster. Raising takes about 0.313 / 0.363 seconds; lowering runs at 60% of that speed (about 0.521 / 0.604 seconds). The front-facing blend has a separate 0.65-second transition.

The deer renderer uses at most 30 draws per second while moving, sleeps between poses, and cancels animation work when the scene or document is hidden. Reduced motion disables periodic alert loops. Canvas buffers are capped near 350,000 pixels and device-pixel ratio 2. Decoded textures and intermediate canvases consume more memory than the compressed asset transfer size; the source texture sets alone are roughly 18 MiB each on CPU and GPU.

If WebGL fails, a composed upright Canvas2D fallback remains. If a required art file or compositor fails, the optional deer layer disappears. Decoration has no pointer targets or screen-reader content and does not modify tool input, output, storage, navigation or the water renderer.

Geometry and lifecycle harnesses cover deterministic boundaries, motion state changes, scheduling, timing, reduced motion and simulated failures. Browser screenshots were reviewed at phone and desktop viewport sizes in Windows Chromium. These checks do not establish native Safari, macOS, Linux GPU or real-phone performance; those remain additional compatibility testing.
