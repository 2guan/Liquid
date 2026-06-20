/**
 * Procedural sound — the whole audio bed is synthesised with the Web Audio API,
 * so the app ships zero audio files yet still has an ambient bar hum and tactile
 * interaction SFX (design_spec §9 "ice crack sound sync / foam shimmer").
 *
 * Everything is gated behind `enabled`; `play()` is a silent no-op until the
 * user turns sound on (which is itself a user gesture, satisfying autoplay
 * policy). All nodes are created lazily on first use.
 */

type Sfx =
  | "click"
  | "pour"
  | "ice"
  | "shake"
  | "success"
  | "unlock"
  | "save";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambient: { stop: () => void } | null = null;
let enabled = false;

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** A short shaped tone. */
function tone(freq: number, at: number, dur: number, type: OscillatorType, gain: number) {
  if (!ctx || !master) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(master);
  o.start(at);
  o.stop(at + dur + 0.02);
}

/** A filtered noise burst — used for pours and ice. */
function noiseBurst(at: number, dur: number, filter: BiquadFilterType, freq: number, gain: number, q = 1) {
  if (!ctx || !master) return;
  const frames = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < frames; i++) {
    // brownish noise reads warmer than white
    last = (last + (Math.random() * 2 - 1) * 0.5) * 0.96;
    data[i] = last;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = filter;
  bp.frequency.value = freq;
  bp.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(bp).connect(g).connect(master);
  src.start(at);
  src.stop(at + dur + 0.02);
}

function startAmbient() {
  if (!ctx || !master || ambient) return;
  const now = ctx.currentTime;

  // low warm drone
  const drone = ctx.createOscillator();
  drone.type = "triangle";
  drone.frequency.value = 110;
  const droneG = ctx.createGain();
  droneG.gain.value = 0.014;

  const detune = ctx.createOscillator();
  detune.type = "sine";
  detune.frequency.value = 55;
  const detuneG = ctx.createGain();
  detuneG.gain.value = 0.01;

  // soft room noise through a lowpass
  const frames = Math.floor(ctx.sampleRate * 2);
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < frames; i++) {
    last = (last + (Math.random() * 2 - 1) * 0.4) * 0.97;
    data[i] = last * 0.6;
  }
  const room = ctx.createBufferSource();
  room.buffer = buf;
  room.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 380;
  const roomG = ctx.createGain();
  roomG.gain.value = 0.02;

  // slow breathing LFO on the room gain
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 0.012;
  lfo.connect(lfoG).connect(roomG.gain);

  drone.connect(droneG).connect(master);
  detune.connect(detuneG).connect(master);
  room.connect(lp).connect(roomG).connect(master);

  drone.start(now);
  detune.start(now);
  room.start(now);
  lfo.start(now);

  ambient = {
    stop: () => {
      const t = ctx!.currentTime;
      [droneG, detuneG, roomG].forEach((g) => {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      });
      [drone, detune, room, lfo].forEach((n) => {
        try {
          n.stop(t + 0.7);
        } catch {
          /* already stopped */
        }
      });
    },
  };
}

function stopAmbient() {
  ambient?.stop();
  ambient = null;
}

export const sound = {
  get enabled() {
    return enabled;
  },
  setEnabled(on: boolean) {
    enabled = on;
    try {
      if (on) {
        ensure();
        startAmbient();
      } else {
        stopAmbient();
      }
    } catch {
      /* audio unavailable — fail silently */
    }
  },
  /** Re-arm the audio context after a user gesture (autoplay policy). */
  resumeIfEnabled() {
    if (!enabled) return;
    try {
      ensure();
      startAmbient();
    } catch {
      /* audio unavailable — fail silently */
    }
  },
  play(name: Sfx) {
    if (!enabled) return;
    let c: AudioContext | null = null;
    try {
      c = ensure();
    } catch {
      return; // never let an audio failure break a user flow
    }
    if (!c) return;
    const t = c.currentTime;
    switch (name) {
      case "click":
        tone(880, t, 0.05, "sine", 0.05);
        break;
      case "pour":
        noiseBurst(t, 0.5, "bandpass", 540, 0.06, 1.4);
        break;
      case "ice":
        tone(1400, t, 0.05, "triangle", 0.05);
        tone(1850, t + 0.06, 0.05, "triangle", 0.035);
        break;
      case "shake":
        noiseBurst(t, 0.16, "highpass", 2600, 0.05);
        noiseBurst(t + 0.14, 0.16, "highpass", 2600, 0.045);
        noiseBurst(t + 0.28, 0.18, "highpass", 2200, 0.04);
        break;
      case "success":
        tone(523.25, t, 0.18, "sine", 0.06);
        tone(659.25, t + 0.08, 0.2, "sine", 0.055);
        tone(783.99, t + 0.16, 0.28, "sine", 0.05);
        break;
      case "unlock":
        tone(659.25, t, 0.3, "sine", 0.06);
        tone(987.77, t + 0.1, 0.32, "sine", 0.05);
        tone(1318.51, t + 0.22, 0.5, "sine", 0.045);
        tone(1567.98, t + 0.34, 0.6, "triangle", 0.03);
        break;
      case "save":
        tone(440, t, 0.25, "sine", 0.05);
        tone(660, t + 0.05, 0.35, "sine", 0.04);
        break;
    }
  },
};
