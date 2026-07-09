# Rung 3 experiment — can a GPU's power draw witness what a model is doing?

**The question:** when a local AI model (a) sits idle, (b) answers varied prompts, or
(c) gets stuck repeating the same tiny call, does the GPU's **power draw** look different
enough to tell those three apart? If yes, you have the first ingredient of a *physical*
witness — evidence an agent can't fake just by writing a tidier log.

**What it does NOT prove:** that this is tamper-proof. Someone who can run real decoy
compute on the GPU can still shape the signal. This tests *distinguishability* — the first
question, not the last. (Everything here is honest about that on purpose.)

You have an NVIDIA PC, so this works. It takes about 10 minutes total, most of it one install.

---

## One-time setup (about 5 minutes)

1. **Install Ollama** (it runs models locally on your GPU). In a terminal:

   ```
   winget install Ollama.Ollama
   ```
   ...or download it from https://ollama.com/download and run the installer.

2. **Get a small, fast model:**

   ```
   ollama pull qwen2.5:0.5b
   ```

That's it. You never have to touch Ollama again — the script talks to it for you.

---

## Run the experiment (about 2 minutes)

Open a terminal **in this folder** and run these two commands, one at a time:

```
node power-probe.js
```
This records the GPU while it runs the three scenarios (idle, varied, loop). It writes
three `.csv` files here. It prints what it's doing as it goes — about one minute.

```
node power-analyze.js
```
This reads those three files and prints a table plus a plain **VERDICT**.

---

## Then

**Copy the entire output of `power-analyze.js` and paste it back to me.** That's the data.

- **SEPARABLE** → the power trace really does distinguish the three. Rung 3 has its first
  real, consumer-grade evidence — something the big labs never bothered to publish for
  ordinary hardware. We design the next step from there.
- **INCONCLUSIVE** → an honest negative-ish result. Still publishable ("consumer power draw
  is too coarse to witness this"), and it tells us to try a heavier model or faster sampling.

Either way you learn something true and cheap. That's the whole point of this rung.

---

## Troubleshooting

- **"could not run nvidia-smi"** → NVIDIA drivers aren't on PATH. Reboot after a driver
  install, or run from a normal terminal (not a restricted shell).
- **"Ollama not detected"** → the script still records `idle` so you can confirm it works,
  but you need steps 1–2 above for the real result. Then re-run `node power-probe.js`.
- **Want a fast dry run first?** `node power-probe.js --quick` (short durations, just to see
  it work — the real result needs the full run).

*Rung 3 of the Witness Independence Ladder. Exploratory, n=1, on your own machine, nothing
leaves it. Consistent with the whole project: deterministic, on-device, honest about limits.*
