// محرك صوت إجرائي (Procedural) كامل عبر Web Audio API.
// لا يتضمن أي تسجيلات صوتية جاهزة أو محمية بحقوق نشر — كل الأصوات (محرك،
// رياح، رمل، طيور، طلقات) تُولَّد رياضياً في المتصفح. قائمة التشغيل الموسيقية
// تعتمد كلياً على ملفات يرفعها المستخدم بنفسه ويملك حقوق استخدامها.

export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private sandGain: GainNode | null = null;

  private engineOscA: OscillatorNode | null = null;
  private engineOscB: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  private sandSource: AudioBufferSourceNode | null = null;

  private basePitch = 60;
  private grit = 0.4;
  private masterVolume = 0.8;
  private sfxVolume = 0.9;
  private running = false;

  ensureContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.masterVolume;
      this.master.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.master);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private noiseBuffer(ctx: AudioContext, seconds: number) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  startEngine(basePitch: number, grit: number) {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;
    this.basePitch = basePitch;
    this.grit = grit;
    this.stopEngine();

    this.engineGain = ctx.createGain();
    this.engineGain.gain.value = 0.0001;
    this.engineFilter = ctx.createBiquadFilter();
    this.engineFilter.type = "lowpass";
    this.engineFilter.frequency.value = 900;
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.master);

    this.engineOscA = ctx.createOscillator();
    this.engineOscA.type = "sawtooth";
    this.engineOscA.frequency.value = basePitch;
    this.engineOscA.connect(this.engineFilter);

    this.engineOscB = ctx.createOscillator();
    this.engineOscB.type = "square";
    this.engineOscB.frequency.value = basePitch * 0.5;
    const gritGain = ctx.createGain();
    gritGain.gain.value = grit * 0.5;
    this.engineOscB.connect(gritGain);
    gritGain.connect(this.engineFilter);

    this.engineOscA.start();
    this.engineOscB.start();

    // رياح
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0.0001;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.value = 800;
    windFilter.Q.value = 0.6;
    this.windSource = ctx.createBufferSource();
    this.windSource.buffer = this.noiseBuffer(ctx, 2);
    this.windSource.loop = true;
    this.windSource.connect(windFilter);
    windFilter.connect(this.windGain);
    this.windGain.connect(this.master);
    this.windSource.start();

    // احتكاك الرمل
    this.sandGain = ctx.createGain();
    this.sandGain.gain.value = 0.0001;
    const sandFilter = ctx.createBiquadFilter();
    sandFilter.type = "highpass";
    sandFilter.frequency.value = 1200;
    this.sandSource = ctx.createBufferSource();
    this.sandSource.buffer = this.noiseBuffer(ctx, 1.2);
    this.sandSource.loop = true;
    this.sandSource.connect(sandFilter);
    sandFilter.connect(this.sandGain);
    this.sandGain.connect(this.master);
    this.sandSource.start();

    this.running = true;
  }

  stopEngine() {
    [this.engineOscA, this.engineOscB, this.windSource, this.sandSource].forEach((node) => {
      try {
        node?.stop();
      } catch {
        /* already stopped */
      }
    });
    this.engineOscA = null;
    this.engineOscB = null;
    this.windSource = null;
    this.sandSource = null;
    this.running = false;
  }

  setSpeed(speedRatio: number, moving: boolean) {
    if (!this.ctx || !this.running) return;
    const t = this.ctx.currentTime;
    const s = Math.max(0, Math.min(1, speedRatio));
    if (this.engineOscA) {
      this.engineOscA.frequency.setTargetAtTime(this.basePitch * (1 + s * 1.8), t, 0.08);
    }
    if (this.engineOscB) {
      this.engineOscB.frequency.setTargetAtTime(this.basePitch * 0.5 * (1 + s * 1.8), t, 0.08);
    }
    if (this.engineGain) {
      this.engineGain.gain.setTargetAtTime(0.05 + s * 0.16, t, 0.15);
    }
    if (this.engineFilter) {
      this.engineFilter.frequency.setTargetAtTime(500 + s * 2200, t, 0.15);
    }
    if (this.windGain) {
      this.windGain.gain.setTargetAtTime(s * 0.09, t, 0.3);
    }
    if (this.sandGain) {
      this.sandGain.gain.setTargetAtTime(moving ? s * 0.05 + this.grit * 0.02 : 0.0001, t, 0.2);
    }
  }

  private envGain(ctx: AudioContext, destination: AudioNode, attack: number, decay: number, peak: number) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + attack + decay);
    g.connect(destination);
    return g;
  }

  playGunshot() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(ctx, 0.3);
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 400;
    const env = this.envGain(ctx, this.sfxGain, 0.002, 0.18, 1);
    noise.connect(filter);
    filter.connect(env);
    noise.start();
    noise.stop(ctx.currentTime + 0.3);

    const click = ctx.createOscillator();
    click.type = "square";
    click.frequency.value = 120;
    const clickEnv = this.envGain(ctx, this.sfxGain, 0.001, 0.05, 0.6);
    click.connect(clickEnv);
    click.start();
    click.stop(ctx.currentTime + 0.06);
  }

  playReload() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    [0, 0.12].forEach((delay) => {
      const click = ctx.createOscillator();
      click.type = "square";
      click.frequency.value = 900;
      const env = ctx.createGain();
      const start = ctx.currentTime + delay;
      env.gain.setValueAtTime(0.0001, start);
      env.gain.exponentialRampToValueAtTime(0.35, start + 0.005);
      env.gain.exponentialRampToValueAtTime(0.0001, start + 0.05);
      click.connect(env);
      env.connect(this.sfxGain!);
      click.start(start);
      click.stop(start + 0.06);
    });
  }

  playDoor(open: boolean) {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(open ? 180 : 140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(open ? 90 : 60, ctx.currentTime + 0.2);
    const env = this.envGain(ctx, this.sfxGain, 0.01, 0.25, 0.5);
    osc.connect(env);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  playBirdChirp(kind: "qumri" | "hamam") {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const notes = kind === "qumri" ? [520, 430, 430] : [740, 700];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      const start = ctx.currentTime + i * 0.16;
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, start + 0.12);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, start);
      env.gain.exponentialRampToValueAtTime(0.15, start + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
      osc.connect(env);
      env.connect(this.sfxGain!);
      osc.start(start);
      osc.stop(start + 0.16);
    });
  }

  playFeatherPuff() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(ctx, 0.4);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2500;
    filter.Q.value = 0.4;
    const env = this.envGain(ctx, this.sfxGain, 0.03, 0.3, 0.25);
    noise.connect(filter);
    filter.connect(env);
    noise.start();
    noise.stop(ctx.currentTime + 0.4);
  }

  playWingFlap() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(ctx, 0.5);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.5;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, ctx.currentTime);
    for (let i = 0; i < 4; i++) {
      const t = ctx.currentTime + i * 0.09;
      env.gain.linearRampToValueAtTime(0.18, t + 0.02);
      env.gain.linearRampToValueAtTime(0.0001, t + 0.07);
    }
    noise.connect(filter);
    filter.connect(env);
    env.connect(this.sfxGain);
    noise.start();
    noise.stop(ctx.currentTime + 0.5);
  }

  setMasterVolume(v: number) {
    this.masterVolume = v;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }

  setSfxVolume(v: number) {
    this.sfxVolume = v;
    if (this.sfxGain && this.ctx) this.sfxGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }

  dispose() {
    this.stopEngine();
    this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}

export interface Track {
  name: string;
  url: string;
}

// مشغّل قائمة تشغيل خاصة بالمستخدم — لا يحتوي على أي ملفات صوتية مضمّنة.
// المستخدم يرفع ملفاته الخاصة (شيلات، جلسات بر، إلخ) وتُشغَّل محلياً فقط.
export class MusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private tracks: Track[] = [];
  private index = 0;
  private volume = 0.6;

  init() {
    if (typeof window === "undefined" || this.audio) return;
    this.audio = new Audio();
    this.audio.volume = this.volume;
  }

  loadFiles(files: File[]) {
    this.tracks.forEach((t) => URL.revokeObjectURL(t.url));
    this.tracks = files.map((f) => ({ name: f.name.replace(/\.[^.]+$/, ""), url: URL.createObjectURL(f) }));
    this.index = 0;
    if (this.tracks.length && this.audio) {
      this.audio.src = this.tracks[0].url;
    }
  }

  get trackList() {
    return this.tracks;
  }

  get currentTrack(): Track | null {
    return this.tracks[this.index] ?? null;
  }

  get isPlaying() {
    return !!this.audio && !this.audio.paused;
  }

  play() {
    if (!this.audio || !this.tracks.length) return;
    if (!this.audio.src) this.audio.src = this.tracks[this.index].url;
    this.audio.play().catch(() => {});
  }

  pause() {
    this.audio?.pause();
  }

  toggle() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  next() {
    if (!this.tracks.length || !this.audio) return;
    this.index = (this.index + 1) % this.tracks.length;
    this.audio.src = this.tracks[this.index].url;
    this.audio.play().catch(() => {});
  }

  prev() {
    if (!this.tracks.length || !this.audio) return;
    this.index = (this.index - 1 + this.tracks.length) % this.tracks.length;
    this.audio.src = this.tracks[this.index].url;
    this.audio.play().catch(() => {});
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.audio) this.audio.volume = v;
  }

  dispose() {
    this.audio?.pause();
    this.tracks.forEach((t) => URL.revokeObjectURL(t.url));
    this.tracks = [];
    this.audio = null;
  }
}
