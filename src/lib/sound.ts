"use client";

/**
 * UI sound kit — every sound is synthesised with Web Audio (no files to
 * download). A soft compressor + small generated "room" reverb glues the
 * sounds together so they feel like one designed set. Off by default; the
 * visitor's choice is remembered.
 */

export type SoundName =
  | "hover"
  | "hoverCard"
  | "click"
  | "tab"
  | "select"
  | "deselect"
  | "open"
  | "close"
  | "whoosh"
  | "swipe"
  | "flip"
  | "type"
  | "success"
  | "error"
  | "send"
  | "themeDark"
  | "themeLight"
  | "language"
  | "roll"
  | "powerOn"
  | "powerOff"
  | "liftoff"
  | "land"
  | "screen"
  | "ratchet"
  | "cardSlap"
  | "codeKey"
  | "curtain"
  | "sonar"
  | "end"
  | "lidOpen"
  | "lidClose"
  | "assemble"
  | "scatter";

/** Optional parameters some sounds use (scroll speed, direction, section index). */
export interface SoundOpts {
  intensity?: number; // 0..1
  up?: boolean;
  index?: number;
}

const KEY = "ss-sound";
let enabled = false;
const listeners = new Set<() => void>();

try {
  if (typeof window !== "undefined") enabled = localStorage.getItem(KEY) === "on";
} catch {
  /* storage blocked */
}

// ---------- audio graph ----------
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverbIn: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.15;
    comp.connect(ctx.destination);

    master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(comp);

    // small generated room: decaying stereo noise impulse
    const len = Math.floor(ctx.sampleRate * 1.1);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    const conv = ctx.createConvolver();
    conv.buffer = ir;
    reverbIn = ctx.createGain();
    reverbIn.gain.value = 0.22;
    reverbIn.connect(conv).connect(master);

    // shared white-noise buffer for whooshes / clicks
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const n = noiseBuf.getChannelData(0);
    for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOpts {
  type?: OscillatorType;
  to?: number; // pitch glide target
  gain?: number;
  attack?: number;
  decay?: number; // total length
  delay?: number; // start offset
  detune?: number;
  lowpass?: number;
  wet?: number; // reverb send 0..1
  pan?: number;
}

function tone(freq: number, o: ToneOpts = {}) {
  const a = audio();
  if (!a || !master) return;
  const t = a.currentTime + (o.delay ?? 0);
  const dur = o.decay ?? 0.15;
  const peak = o.gain ?? 0.05;

  const osc = a.createOscillator();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(freq, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur * 0.9);
  if (o.detune) osc.detune.value = o.detune;

  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + (o.attack ?? 0.006));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  let node: AudioNode = osc;
  if (o.lowpass) {
    const f = a.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = o.lowpass;
    node.connect(f);
    node = f;
  }
  node.connect(g);

  let out: AudioNode = g;
  if (o.pan && a.createStereoPanner) {
    const p = a.createStereoPanner();
    p.pan.value = o.pan;
    g.connect(p);
    out = p;
  }
  out.connect(master);
  if (o.wet && reverbIn) {
    const s = a.createGain();
    s.gain.value = o.wet;
    out.connect(s).connect(reverbIn);
  }
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Filtered noise burst — whooshes, swishes and soft clicks. */
function noise(o: { from: number; to: number; q?: number; gain?: number; decay?: number; attack?: number; delay?: number; wet?: number; type?: BiquadFilterType }) {
  const a = audio();
  if (!a || !master || !noiseBuf) return;
  const t = a.currentTime + (o.delay ?? 0);
  const dur = o.decay ?? 0.3;
  const src = a.createBufferSource();
  src.buffer = noiseBuf;
  const f = a.createBiquadFilter();
  f.type = o.type ?? "bandpass";
  f.Q.value = o.q ?? 1.2;
  f.frequency.setValueAtTime(o.from, t);
  f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.08, t + (o.attack ?? dur * 0.35));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  if (o.wet && reverbIn) {
    const s = a.createGain();
    s.gain.value = o.wet;
    g.connect(s).connect(reverbIn);
  }
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.05);
}

// pentatonic notes (A major-ish) used for musical feedback
const N = { A4: 440, B4: 493.88, Cs5: 554.37, E5: 659.25, Fs5: 739.99, A5: 880, B5: 987.77, Cs6: 1108.73, E6: 1318.5 };
const HOVER_NOTES = [N.E6, N.Cs6, N.B5, N.A5];
let hoverIdx = 0;

const SOUNDS: Record<SoundName, (o: SoundOpts) => void> = {
  // soft glassy tick that walks a small scale, so repeated hovers feel musical
  hover: () => {
    const f = HOVER_NOTES[hoverIdx++ % HOVER_NOTES.length];
    tone(f, { gain: 0.011, decay: 0.07, attack: 0.003, wet: 0.25 });
  },
  hoverCard: () => {
    tone(N.Cs6, { gain: 0.008, decay: 0.35, attack: 0.02, wet: 0.6 });
    tone(N.E6, { gain: 0.006, decay: 0.4, attack: 0.03, delay: 0.03, wet: 0.6, pan: 0.3 });
  },
  click: () => {
    tone(620, { to: 980, type: "triangle", gain: 0.04, decay: 0.09 });
    noise({ from: 4000, to: 2500, q: 2, gain: 0.015, decay: 0.03, attack: 0.002 });
  },
  tab: () => {
    tone(N.A5, { type: "triangle", gain: 0.03, decay: 0.08 });
    tone(N.E6, { gain: 0.012, decay: 0.12, delay: 0.035, wet: 0.3 });
  },
  select: () => {
    tone(N.E5, { type: "triangle", gain: 0.035, decay: 0.09 });
    tone(N.A5, { type: "triangle", gain: 0.03, decay: 0.14, delay: 0.05, wet: 0.25 });
  },
  deselect: () => {
    tone(N.A5, { type: "triangle", gain: 0.03, decay: 0.08 });
    tone(N.E5, { type: "triangle", gain: 0.025, decay: 0.12, delay: 0.05 });
  },
  open: () => {
    noise({ from: 400, to: 2400, q: 0.8, gain: 0.05, decay: 0.28 });
    tone(N.Cs5, { gain: 0.025, decay: 0.3, delay: 0.08, wet: 0.5 });
    tone(N.E5, { gain: 0.02, decay: 0.35, delay: 0.12, wet: 0.5 });
  },
  close: () => {
    noise({ from: 2200, to: 350, q: 0.8, gain: 0.04, decay: 0.22 });
    tone(N.E5, { to: N.B4, gain: 0.018, decay: 0.2, wet: 0.3 });
  },
  whoosh: () => {
    noise({ from: 300, to: 3200, q: 0.7, gain: 0.09, decay: 0.55, attack: 0.3, wet: 0.4 });
    tone(110, { to: 220, type: "sine", gain: 0.05, decay: 0.6, attack: 0.25 });
  },
  swipe: () => noise({ from: 1800, to: 600, q: 1.4, gain: 0.05, decay: 0.18, attack: 0.04 }),
  flip: () => {
    noise({ from: 900, to: 2600, q: 1.1, gain: 0.04, decay: 0.24 });
    tone(N.B5, { gain: 0.012, decay: 0.25, delay: 0.1, wet: 0.5 });
  },
  type: () => noise({ from: 3200 + Math.random() * 1200, to: 2000, q: 3, gain: 0.018, decay: 0.035, attack: 0.002, type: "bandpass" }),
  success: () => {
    [N.A4, N.Cs5, N.E5, N.A5].forEach((f, i) => tone(f, { type: "triangle", gain: 0.035, decay: 0.5, delay: i * 0.07, wet: 0.45 }));
    tone(N.E6, { gain: 0.012, decay: 0.8, delay: 0.3, wet: 0.7 });
  },
  error: () => {
    tone(220, { type: "square", gain: 0.02, decay: 0.12, lowpass: 900 });
    tone(196, { type: "square", gain: 0.02, decay: 0.18, delay: 0.13, lowpass: 900 });
  },
  send: () => {
    noise({ from: 800, to: 4000, q: 0.9, gain: 0.05, decay: 0.25 });
    tone(N.A5, { to: N.E6, gain: 0.025, decay: 0.2, delay: 0.06, wet: 0.4 });
  },
  themeDark: () => {
    tone(N.E5, { to: N.A4, gain: 0.03, decay: 0.45, wet: 0.6 });
    tone(220, { to: 110, gain: 0.04, decay: 0.5 });
  },
  themeLight: () => {
    tone(N.A4, { to: N.E5, gain: 0.03, decay: 0.4, wet: 0.6 });
    tone(N.Cs6, { gain: 0.012, decay: 0.5, delay: 0.12, wet: 0.7 });
  },
  language: () => [N.E5, N.A5, N.Cs6].forEach((f, i) => tone(f, { gain: 0.022, decay: 0.3, delay: i * 0.06, wet: 0.5 })),
  // odometer: accelerating ticks
  roll: () => {
    let t = 0;
    for (let i = 0; i < 14; i++) {
      t += 0.03 + i * 0.008;
      tone(1800 - i * 40, { gain: 0.008, decay: 0.03, delay: t, attack: 0.002 });
    }
  },
  powerOn: () => {
    [N.A4, N.E5, N.A5].forEach((f, i) => tone(f, { type: "triangle", gain: 0.035, decay: 0.45, delay: i * 0.08, wet: 0.5 }));
  },
  powerOff: () => tone(N.E5, { to: N.A4, type: "triangle", gain: 0.03, decay: 0.25 }),

  // ---- section-specific scroll sounds ----
  // Hero lifting away (shrinks + tilts back): deep airy lift-off swell
  liftoff: () => {
    tone(55, { to: 110, gain: 0.07, decay: 1.1, attack: 0.35 });
    noise({ from: 180, to: 1400, q: 0.6, gain: 0.05, decay: 1.0, attack: 0.45, wet: 0.5, type: "lowpass" });
    tone(N.E5, { gain: 0.01, decay: 1.2, attack: 0.5, delay: 0.25, wet: 0.8 });
  },
  // Back to the top: the reverse, softer
  land: () => {
    noise({ from: 1400, to: 200, q: 0.6, gain: 0.035, decay: 0.7, attack: 0.15, type: "lowpass" });
    tone(110, { to: 60, gain: 0.04, decay: 0.7, attack: 0.1 });
  },
  // 3D laptop/phone showcase switching project: holographic screen-change blip
  screen: () => {
    [2400, 1800, 3000].forEach((f, i) => tone(f, { type: "square", gain: 0.006, decay: 0.03, delay: i * 0.035, lowpass: 5000 }));
    tone(N.A5, { to: N.E6, gain: 0.016, decay: 0.35, delay: 0.1, wet: 0.6 });
    noise({ from: 5000, to: 2000, q: 2, gain: 0.012, decay: 0.15, delay: 0.08 });
  },
  // Featured-projects reel: mechanical carousel ratchet per slide
  ratchet: () => {
    noise({ from: 4200, to: 2600, q: 4, gain: 0.03, decay: 0.025, attack: 0.002, type: "highpass" });
    noise({ from: 3600, to: 2200, q: 4, gain: 0.022, decay: 0.025, attack: 0.002, delay: 0.045, type: "highpass" });
    tone(1760, { gain: 0.008, decay: 0.06, delay: 0.02 });
  },
  // Process cards stacking: soft card-slap
  cardSlap: () => {
    noise({ from: 1600, to: 400, q: 0.7, gain: 0.05, decay: 0.07, attack: 0.002, type: "lowpass" });
    tone(120, { to: 80, gain: 0.05, decay: 0.12, attack: 0.003 });
  },
  // Dev-stack code editor typing
  codeKey: () => {
    noise({ from: 2600 + Math.random() * 1600, to: 1800, q: 3.5, gain: 0.012, decay: 0.03, attack: 0.002 });
    if (Math.random() < 0.15) tone(180, { gain: 0.012, decay: 0.03 }); // occasional heavier key
  },
  // Footer uncovered from behind the page: curtain sweep
  curtain: () => {
    noise({ from: 2600, to: 260, q: 0.7, gain: 0.05, decay: 0.8, attack: 0.25, wet: 0.4 });
    tone(N.A4, { to: N.E5, gain: 0.012, decay: 0.9, attack: 0.3, wet: 0.7 });
  },
  // Contact globe / city map: sonar pings, one per city
  sonar: () => {
    tone(N.E6, { gain: 0.02, decay: 1.1, attack: 0.004, wet: 0.9 });
    [N.Cs6, N.B5, N.A5, N.E6, N.Cs6, N.A5].forEach((f, i) =>
      tone(f, { gain: 0.008, decay: 0.6, attack: 0.004, delay: 0.25 + i * 0.16, wet: 0.9, pan: i % 2 ? 0.5 : -0.5 }),
    );
  },
  // ---- 3D animation sounds ----
  // 3D laptop: hinge creak → power-on chime → phone swooshes in
  lidOpen: () => {
    noise({ from: 700, to: 1100, q: 6, gain: 0.02, decay: 0.35, attack: 0.15 }); // hinge
    tone(95, { to: 70, gain: 0.04, decay: 0.12, delay: 0.32 }); // lid settles
    [N.E5, N.A5, N.Cs6].forEach((f, i) => tone(f, { gain: 0.016, decay: 0.7, delay: 0.42 + i * 0.06, wet: 0.7 })); // boot chime
    noise({ from: 400, to: 2400, q: 0.8, gain: 0.035, decay: 0.35, delay: 0.55, attack: 0.15 }); // phone slides in
  },
  lidClose: () => {
    noise({ from: 1100, to: 600, q: 6, gain: 0.015, decay: 0.25, attack: 0.08 });
    tone(110, { to: 65, gain: 0.05, decay: 0.16, delay: 0.2 });
  },
  // particle "SS": tiny sparkles swarm in and resolve into a chord
  assemble: () => {
    for (let i = 0; i < 16; i++) {
      const f = 1500 + Math.random() * 2500;
      tone(f, { gain: 0.004 + Math.random() * 0.004, decay: 0.08, delay: i * 0.045 + Math.random() * 0.02, wet: 0.6, pan: Math.random() * 1.6 - 0.8 });
    }
    noise({ from: 2000, to: 6000, q: 1, gain: 0.02, decay: 0.75, attack: 0.5, wet: 0.5 });
    [N.A4, N.E5, N.A5, N.Cs6].forEach((f, i) => tone(f, { gain: 0.014, decay: 1.2, delay: 0.7 + i * 0.03, wet: 0.8 }));
  },
  scatter: () => {
    for (let i = 0; i < 12; i++) {
      const f = 3800 - i * 200 + Math.random() * 300;
      tone(f, { gain: 0.004, decay: 0.07, delay: i * 0.04, wet: 0.6, pan: Math.random() * 1.6 - 0.8 });
    }
    noise({ from: 5000, to: 900, q: 1, gain: 0.018, decay: 0.6, attack: 0.05, wet: 0.4 });
  },
  // bottom of the page
  end: () => [N.A4, N.E5, N.A5, N.Cs6].forEach((f, i) => tone(f, { gain: 0.018, decay: 0.9, delay: i * 0.09, wet: 0.7 })),
};

// avoid machine-gun repeats of the same sound
const MIN_GAP: Partial<Record<SoundName, number>> = { lidOpen: 1200, lidClose: 1200, assemble: 2500, scatter: 2000, hover: 55, hoverCard: 400, type: 35, swipe: 120, tab: 60, roll: 1500, liftoff: 1500, land: 1500, screen: 250, ratchet: 140, cardSlap: 180, codeKey: 70, curtain: 3000, sonar: 4000, end: 4000 };
const last: Partial<Record<SoundName, number>> = {};

// ---------- continuous layers (follow movement, fade when it stops) ----------
export type LoopName = "wind" | "hum" | "whirr";
const loops: Partial<Record<LoopName, { gain: GainNode; filter: BiquadFilterNode }>> = {};

function buildLoop(a: AudioContext, name: LoopName) {
  const gain = a.createGain();
  gain.gain.value = 0;
  const filter = a.createBiquadFilter();
  if (name === "hum") {
    // hero 3D: warm magnetic pad — two detuned sines + a soft octave
    filter.type = "lowpass";
    filter.frequency.value = 300;
    [110, 164.81, 220.6].forEach((f, i) => {
      const o = a.createOscillator();
      o.type = i === 2 ? "triangle" : "sine";
      o.frequency.value = f;
      o.detune.value = i === 1 ? 6 : -4;
      o.connect(filter);
      o.start();
    });
    filter.connect(gain);
  } else {
    // wind (velocity band) and whirr (tech-sphere spin) are filtered noise
    const src = a.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    filter.type = "bandpass";
    filter.Q.value = name === "whirr" ? 4.5 : 0.6;
    filter.frequency.value = 500;
    src.connect(filter);
    filter.connect(gain);
    src.start();
  }
  gain.connect(master!);
  if (reverbIn && name === "hum") {
    const s = a.createGain();
    s.gain.value = 0.5;
    gain.connect(s).connect(reverbIn);
  }
  return { gain, filter };
}

function setLoop(name: LoopName, level: number) {
  if (!enabled && level > 0) return;
  const a = level > 0 ? audio() : ctx;
  if (!a || !master || !noiseBuf) return;
  let l = loops[name];
  if (!l) {
    if (level <= 0) return;
    l = loops[name] = buildLoop(a, name);
  }
  const t = a.currentTime;
  const k = Math.min(1, Math.max(0, level));
  if (name === "wind") {
    l.gain.gain.setTargetAtTime(k * 0.07, t, 0.12);
    l.filter.frequency.setTargetAtTime(450 + k * 2600, t, 0.15);
  } else if (name === "hum") {
    l.gain.gain.setTargetAtTime(k * 0.045, t, 0.25);
    l.filter.frequency.setTargetAtTime(260 + k * 1400, t, 0.2);
  } else {
    l.gain.gain.setTargetAtTime(k * 0.06, t, 0.06);
    l.filter.frequency.setTargetAtTime(220 + k * 1900, t, 0.06);
  }
}

export const sound = {
  /** Kinetic-band wind: 0 = silent, 1 = full rush (follows scroll speed). */
  wind(level: number) {
    setLoop("wind", level);
  },
  /** Continuous layer by name (hum = hero 3D, whirr = tech sphere spin). */
  loop(name: LoopName, level: number) {
    setLoop(name, level);
  },
  get enabled() {
    return enabled;
  },
  set(on: boolean) {
    if (!on) {
      SOUNDS.powerOff({});
      (Object.keys(loops) as LoopName[]).forEach((n) => setLoop(n, 0));
    }
    enabled = on;
    try {
      localStorage.setItem(KEY, on ? "on" : "off");
    } catch {
      /* ignore */
    }
    if (on) SOUNDS.powerOn({});
    listeners.forEach((l) => l());
  },
  play(name: SoundName, opts: SoundOpts = {}) {
    if (!enabled) return;
    const now = performance.now();
    const gap = MIN_GAP[name] ?? 30;
    if (now - (last[name] ?? 0) < gap) return;
    last[name] = now;
    try {
      SOUNDS[name](opts);
    } catch {
      /* audio unavailable */
    }
  },
  // kept for older callers
  hover() {
    this.play("hover");
  },
  click() {
    this.play("click");
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
