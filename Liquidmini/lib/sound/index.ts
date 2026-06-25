/**
 * Procedural sound — the whole audio bed is synthesised with the Web Audio API,
 * so the app ships zero audio files yet still has an ambient bar hum and tactile
 * interaction SFX. Ported from src/lib/sound.ts: WeChat's
 * `wx.createWebAudioContext()` mirrors the W3C Web Audio API, so the synthesis
 * graph below is identical to the web build — only the context creation differs.
 *
 * Everything is gated behind `enabled`; `play()` is a silent no-op until the
 * user turns sound on. All nodes are created lazily on first use.
 */

type Sfx =
  | "click"
  | "pour"
  | "ice"
  | "shake"
  | "success"
  | "unlock"
  | "save";

let ctx: any = null;
let master: any = null;
let ambient: { stop: () => void } | null = null;
let musicOn = false; // ambient background music
let sfxOn = false; // tactile button / interaction sound effects

function ensure(): any {
  if (typeof wx === "undefined" || !wx.createWebAudioContext) return null;
  if (!ctx) {
    ctx = wx.createWebAudioContext();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended" && ctx.resume) {
    try { ctx.resume(); } catch (e) { /* ignore */ }
  }
  return ctx;
}

/** A short shaped tone. */
function tone(freq: number, at: number, dur: number, type: string, gain: number) {
  if (!ctx || !master) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g);
  g.connect(master);
  o.start(at);
  o.stop(at + dur + 0.02);
}

/** A filtered noise burst — used for pours and ice. */
function noiseBurst(at: number, dur: number, filter: string, freq: number, gain: number, q = 1) {
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
  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  src.start(at);
  src.stop(at + dur + 0.02);
}

function startAmbient() {
  if (!ctx || !master || ambient) return;
  const audio = ctx; // captured so the nested schedulers stay bound
  const out = master;
  const now = audio.currentTime;

  // a dedicated bus so the whole bed (pad + bass + room) fades out as one
  const bus = audio.createGain();
  bus.gain.value = 1;
  bus.connect(out);

  // ── warm low body ──
  const drone = audio.createOscillator();
  drone.type = "sine";
  drone.frequency.value = 65.41; // C2
  const droneG = audio.createGain();
  droneG.gain.value = 0.012;
  drone.connect(droneG);
  droneG.connect(bus);
  drone.start(now);

  // ── quiet smoky room tone (brown noise through a lowpass) ──
  const frames = Math.floor(audio.sampleRate * 2);
  const buf = audio.createBuffer(1, frames, audio.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < frames; i++) {
    last = (last + (Math.random() * 2 - 1) * 0.4) * 0.97;
    data[i] = last * 0.5;
  }
  const room = audio.createBufferSource();
  room.buffer = buf;
  room.loop = true;
  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 300;
  const roomG = audio.createGain();
  roomG.gain.value = 0.009;
  room.connect(lp);
  lp.connect(roomG);
  roomG.connect(bus);
  room.start(now);

  // ── a mellow Rhodes-ish pad voice (sine + soft octave partial, lowpassed) ──
  const padNote = (freq: number, at: number, dur: number, gain: number) => {
    const o = audio.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    const harm = audio.createOscillator();
    harm.type = "triangle";
    harm.frequency.value = freq * 2;
    const hg = audio.createGain();
    hg.gain.value = 0.14;
    const g = audio.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + 0.24);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    const warm = audio.createBiquadFilter();
    warm.type = "lowpass";
    warm.frequency.value = 1500;
    o.connect(g);
    harm.connect(hg);
    hg.connect(g);
    g.connect(warm);
    warm.connect(bus);
    o.start(at);
    harm.start(at);
    o.stop(at + dur + 0.1);
    harm.stop(at + dur + 0.1);
  };

  // ── a soft upright-bass pluck ──
  const bassNote = (freq: number, at: number, dur: number, gain: number) => {
    const o = audio.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    const g = audio.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g);
    g.connect(bus);
    o.start(at);
    o.stop(at + dur + 0.05);
  };

  // slow ii–V–I–vi in C, voiced as mellow seventh chords (jazz lounge)
  const CHORDS: { bass: number; notes: number[] }[] = [
    { bass: 146.83, notes: [293.66, 349.23, 440.0, 523.25] }, // Dm7
    { bass: 98.0, notes: [349.23, 392.0, 493.88, 587.33] }, //   G7
    { bass: 130.81, notes: [261.63, 329.63, 392.0, 493.88] }, // Cmaj7
    { bass: 110.0, notes: [329.63, 392.0, 440.0, 523.25] }, //   Am7
  ];
  const CHORD_DUR = 3.8; // seconds per chord — unhurried

  let idx = 0;
  let next = now + 0.15;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    const c = CHORDS[idx % CHORDS.length];
    // roll the chord tones in slightly for a hand-played feel
    c.notes.forEach((f, i) => padNote(f, next + i * 0.06, CHORD_DUR * 0.92, 0.016));
    bassNote(c.bass, next, CHORD_DUR * 0.5, 0.045); // root on beat 1
    bassNote(c.bass * 1.5, next + CHORD_DUR * 0.5, CHORD_DUR * 0.45, 0.036); // fifth on beat 3
    idx++;
    next += CHORD_DUR;
    timer = setTimeout(tick, CHORD_DUR * 1000 - 250);
  };
  tick();

  ambient = {
    stop: () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      const t = audio.currentTime;
      bus.gain.cancelScheduledValues(t);
      bus.gain.setValueAtTime(bus.gain.value, t);
      bus.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      [drone, room].forEach((n) => {
        try {
          n.stop(t + 0.8);
        } catch (e) {
          /* already stopped */
        }
      });
    },
  };
}

function stopAmbient() {
  if (ambient) ambient.stop();
  ambient = null;
}

export const sound = {
  get musicEnabled() {
    return musicOn;
  },
  get sfxEnabled() {
    return sfxOn;
  },
  /** Background music (the ambient lounge bed). */
  setMusicEnabled(on: boolean) {
    musicOn = on;
    try {
      if (on) {
        ensure();
        startAmbient();
      } else {
        stopAmbient();
      }
    } catch (e) {
      /* audio unavailable — fail silently */
    }
  },
  /** Button / interaction sound effects. */
  setSfxEnabled(on: boolean) {
    sfxOn = on;
    try {
      if (on) ensure();
    } catch (e) {
      /* audio unavailable — fail silently */
    }
  },
  /** Re-arm the audio context after a user gesture (autoplay policy). */
  resumeIfEnabled() {
    try {
      if (musicOn) {
        ensure();
        startAmbient();
      } else if (sfxOn) {
        ensure();
      }
    } catch (e) {
      /* audio unavailable — fail silently */
    }
  },
  play(name: Sfx) {
    if (!sfxOn) return;
    let c: any = null;
    try {
      c = ensure();
    } catch (e) {
      return; // never let an audio failure break a user flow
    }
    if (!c) return;
    const t = c.currentTime;
    try {
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
    } catch (e) {
      /* audio synthesis quirk (e.g. WeChat Android) — never break a user flow */
    }
  },
};
