/**
 * Kalpana audio — every sound synthesized live in WebAudio.
 * Original by construction: no samples, no assets, zero licensing surface.
 *
 * SFX: Minecraft-flavored UI clicks, travel whooshes, arrival chimes.
 * Music: a calm generative ambient loop — slow warm pads + sparse
 * pentatonic notes through a feedback delay (C418-*style*, not C418).
 *
 * Gesture-gated: nothing exists until unlock() runs inside a user click.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  private music: GainNode | null = null;
  private musicTimer: ReturnType<typeof setTimeout> | null = null;
  private noiseBuf: AudioBuffer | null = null;
  muted = false;

  /** call from inside a user gesture (start-menu click) */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const AC: typeof AudioContext | undefined =
      typeof window !== "undefined"
        ? (window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext)
        : undefined;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    this.sfx = this.ctx.createGain();
    this.sfx.gain.value = 0.55;
    this.sfx.connect(this.master);
    this.music = this.ctx.createGain();
    this.music.gain.value = 0.0; // fades in
    this.music.connect(this.master);

    this.muted =
      typeof localStorage !== "undefined" &&
      localStorage.getItem("kalpana-muted") === "1";
    this.master.gain.value = this.muted ? 0 : 1;

    this.startMusic();
  }

  get unlocked(): boolean {
    return this.ctx !== null;
  }

  setMuted(m: boolean): void {
    this.muted = m;
    try {
      localStorage.setItem("kalpana-muted", m ? "1" : "0");
    } catch {
      /* private mode */
    }
    if (this.master && this.ctx)
      this.master.gain.linearRampToValueAtTime(
        m ? 0 : 1,
        this.ctx.currentTime + 0.25
      );
  }

  // ————— SFX —————

  /** stone-button click: two quick dry taps */
  click(): void {
    const ctx = this.ctx;
    if (!ctx || !this.sfx) return;
    const t = ctx.currentTime;
    for (const [dt, f, g] of [
      [0, 720, 0.5],
      [0.045, 480, 0.35],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(f, t + dt);
      osc.frequency.exponentialRampToValueAtTime(f * 0.6, t + dt + 0.05);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(g, t + dt);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.07);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1800;
      osc.connect(lp).connect(gain).connect(this.sfx);
      osc.start(t + dt);
      osc.stop(t + dt + 0.09);
    }
  }

  /** soft hover tick */
  hover(): void {
    const ctx = this.ctx;
    if (!ctx || !this.sfx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(900, t);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain).connect(this.sfx);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  /** airy whoosh for camera flights */
  whoosh(duration = 1.6): void {
    const ctx = this.ctx;
    if (!ctx || !this.sfx) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise(ctx);
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(180, t);
    bp.frequency.exponentialRampToValueAtTime(900, t + duration * 0.45);
    bp.frequency.exponentialRampToValueAtTime(160, t + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.28, t + duration * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(bp).connect(gain).connect(this.sfx);
    src.start(t);
    src.stop(t + duration + 0.05);
  }

  /** warm two-note arrival chime (FM bell) */
  chime(): void {
    const ctx = this.ctx;
    if (!ctx || !this.sfx) return;
    const t = ctx.currentTime;
    for (const [dt, f] of [
      [0, 523.25], // C5
      [0.14, 783.99], // G5
    ] as const) {
      this.bell(ctx, this.sfx, t + dt, f, 0.16, 1.4);
    }
  }

  // ————— generative ambient music —————

  private chordIdx = 0;
  private static CHORDS: number[][] = [
    // warm pads around C major pentatonic — MIDI notes
    [48, 55, 60, 64], // C3 G3 C4 E4
    [45, 52, 57, 64], // A2 E3 A3 E4
    [50, 57, 62, 65], // D3 A3 D4 F4
    [43, 50, 55, 62], // G2 D3 G3 D4
  ];
  private static SCALE = [60, 62, 64, 67, 69, 72, 74, 76, 79]; // C maj pent up

  private startMusic(): void {
    const ctx = this.ctx;
    if (!ctx || !this.music) return;

    // gentle fade-in
    this.music.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.music.gain.exponentialRampToValueAtTime(0.32, ctx.currentTime + 6);

    // shared feedback delay = space
    const delay = ctx.createDelay(2);
    delay.delayTime.value = 0.52;
    const fb = ctx.createGain();
    fb.gain.value = 0.42;
    const damp = ctx.createBiquadFilter();
    damp.type = "lowpass";
    damp.frequency.value = 1600;
    delay.connect(fb).connect(damp).connect(delay);
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    delay.connect(wet).connect(this.music);
    this.melodyBus = ctx.createGain();
    this.melodyBus.gain.value = 1;
    this.melodyBus.connect(this.music);
    this.melodyBus.connect(delay);

    const padLoop = () => {
      if (!this.ctx) return;
      this.playPad(AudioEngine.CHORDS[this.chordIdx % AudioEngine.CHORDS.length]);
      this.chordIdx++;
      this.musicTimer = setTimeout(padLoop, 12000);
    };
    padLoop();
    this.scheduleNote();
  }

  private melodyBus: GainNode | null = null;

  private playPad(chord: number[]): void {
    const ctx = this.ctx;
    if (!ctx || !this.music) return;
    const t = ctx.currentTime;
    const dur = 14;
    for (const midi of chord) {
      const f = 440 * Math.pow(2, (midi - 69) / 12);
      for (const detune of [-4, 3]) {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = f;
        osc.detune.value = detune;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.045, t + 4);
        gain.gain.setValueAtTime(0.045, t + dur - 5);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 900;
        osc.connect(lp).connect(gain).connect(this.music);
        osc.start(t);
        osc.stop(t + dur + 0.1);
      }
    }
  }

  private scheduleNote(): void {
    if (!this.ctx) return;
    const gap = 2600 + Math.random() * 4800;
    setTimeout(() => {
      const ctx = this.ctx;
      if (!ctx || !this.melodyBus) return;
      // sparse, soft pentatonic note
      const midi =
        AudioEngine.SCALE[Math.floor(Math.random() * AudioEngine.SCALE.length)];
      const f = 440 * Math.pow(2, (midi - 69) / 12);
      this.bell(ctx, this.melodyBus, ctx.currentTime, f, 0.075, 3.2);
      this.scheduleNote();
    }, gap);
  }

  /** simple FM bell voice */
  private bell(
    ctx: AudioContext,
    out: AudioNode,
    t: number,
    freq: number,
    amp: number,
    release: number
  ): void {
    const carrier = ctx.createOscillator();
    carrier.type = "sine";
    carrier.frequency.value = freq;
    const mod = ctx.createOscillator();
    mod.type = "sine";
    mod.frequency.value = freq * 2.4;
    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(freq * 1.1, t);
    modGain.gain.exponentialRampToValueAtTime(1, t + release * 0.6);
    mod.connect(modGain).connect(carrier.frequency);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(amp, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + release);
    carrier.connect(gain).connect(out);
    carrier.start(t);
    carrier.stop(t + release + 0.1);
    mod.start(t);
    mod.stop(t + release + 0.1);
  }

  private noise(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuf) return this.noiseBuf;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
    return buf;
  }
}

export const audio = new AudioEngine();
