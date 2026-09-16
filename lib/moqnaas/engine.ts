import { AudioManager } from "./audio";
import { CarSpec, RegionSpec, BirdKind } from "./types";

export type EngineMode = "driving" | "aiming";

export interface EngineInput {
  throttle: boolean;
  brake: boolean;
  steer: number; // -1..1
}

export interface HudSnapshot {
  mode: EngineMode;
  speedRatio: number; // 0..1
  ammo: number;
  magazine: number;
  reloading: boolean;
  bag: number;
  score: number;
  shots: number;
  hits: number;
  canDismount: boolean;
  canMount: boolean;
  flockBirdsLeft: number;
  vehicleHealth: number;
  timeOfDay: number;
}

export interface EngineCallbacks {
  onHud: (snap: HudSnapshot) => void;
  onHit: (points: number, flying: boolean) => void;
  onMiss: (points: number) => void;
  onModeChange: (mode: EngineMode) => void;
}

interface Bird {
  id: number;
  kind: BirdKind;
  baseYaw: number;
  yaw: number;
  altitude: number;
  state: "perched" | "flying" | "fleeing" | "shot" | "gone";
  hopPhase: number;
  wingPhase: number;
  flightSeed: number;
  stateTimer: number;
}

interface Flock {
  id: number;
  x: number;
  z: number;
  birds: Bird[];
  used: boolean;
}

interface Scenery {
  kind: "rock" | "bush" | "ruin" | "camp" | "wood";
  x: number;
  z: number;
  size: number;
  seed: number;
}

const LANE_LIMIT = 3.4;
const HORIZON_RATIO = 0.42;
const MAGAZINE_SIZE = 5;
const RELOAD_TIME = 1.4;
const FLOCK_TRIGGER_NEAR = 15;
const FLOCK_TRIGGER_FAR = 34;
const FLOCK_FLEE_DIST = 7;
const MAX_YAW = 0.9;

let birdIdSeq = 1;
let flockIdSeq = 1;

export class MoqnaasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private car: CarSpec;
  private region: RegionSpec;
  private audio: AudioManager;
  private callbacks: EngineCallbacks;

  private raf = 0;
  private lastT = 0;
  private running = false;

  private mode: EngineMode = "driving";
  private input: EngineInput = { throttle: false, brake: false, steer: 0 };

  private carZ = 0;
  private carX = 0;
  private speed = 0;
  private tilt = 0;
  private dayPhase = 0.15;
  private vehicleHealth = 100;

  private scenery: Scenery[] = [];
  private flocks: Flock[] = [];
  private activeFlock: Flock | null = null;
  private dust: { x: number; life: number; side: number }[] = [];

  private yaw = 0;
  private ammo = MAGAZINE_SIZE;
  private reloading = false;
  private reloadTimer = 0;
  private muzzleFlash = 0;
  private recoil = 0;

  private score = 0;
  private shots = 0;
  private hits = 0;
  private bag = 0;
  private combo = 0;

  private width = 0;
  private height = 0;
  private dpr = 1;

  constructor(
    canvas: HTMLCanvasElement,
    car: CarSpec,
    region: RegionSpec,
    audio: AudioManager,
    callbacks: EngineCallbacks
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;
    this.car = car;
    this.region = region;
    this.audio = audio;
    this.callbacks = callbacks;
    this.resize();
    this.spawnWorld();
  }

  private rand(seed: number) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  private spawnWorld() {
    this.scenery = [];
    for (let i = 0; i < 46; i++) {
      const z = 20 + i * 14 + this.rand(i) * 10;
      const side = this.rand(i * 3.1) > 0.5 ? 1 : -1;
      const x = side * (2.2 + this.rand(i * 5.2) * 8);
      const kinds: Scenery["kind"][] = ["rock", "bush", "rock", "bush", "wood"];
      this.scenery.push({
        kind: kinds[Math.floor(this.rand(i * 7.7) * kinds.length)],
        x,
        z,
        size: 0.6 + this.rand(i * 2.3) * 1.1,
        seed: i
      });
    }
    this.scenery.push({ kind: "camp", x: -4.5, z: 140, size: 2.2, seed: 999 });
    this.scenery.push({ kind: "ruin", x: 3.8, z: 260, size: 1.6, seed: 998 });

    this.flocks = [];
    for (let i = 0; i < 8; i++) {
      this.flocks.push(this.makeFlock(60 + i * 55 + this.rand(i * 9.9) * 20));
    }
  }

  private makeFlock(z: number): Flock {
    const side = this.rand(z * 1.7) > 0.5 ? 1 : -1;
    const x = side * (1.5 + this.rand(z * 2.1) * 3.5);
    const count = 3 + Math.floor(this.rand(z * 3.3) * 4);
    const kind: BirdKind = this.rand(z * 4.4) > 0.5 ? "qumri" : "hamam";
    const birds: Bird[] = [];
    for (let i = 0; i < count; i++) {
      birds.push({
        id: birdIdSeq++,
        kind,
        baseYaw: (this.rand(z * 5.5 + i) - 0.5) * 0.8,
        yaw: 0,
        altitude: 0,
        state: "perched",
        hopPhase: this.rand(z * 6.6 + i) * 10,
        wingPhase: 0,
        flightSeed: this.rand(z * 7.7 + i) * 100,
        stateTimer: 0
      });
    }
    return { id: flockIdSeq++, x, z, birds, used: false };
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  setInput(partial: Partial<EngineInput>) {
    this.input = { ...this.input, ...partial };
  }

  setLookDelta(dx: number) {
    if (this.mode !== "aiming") return;
    this.yaw = Math.max(-MAX_YAW, Math.min(MAX_YAW, this.yaw + dx));
  }

  get currentMode() {
    return this.mode;
  }

  private nearestFlockInfo() {
    let best: { flock: Flock; dist: number } | null = null;
    for (const f of this.flocks) {
      if (f.used) continue;
      const dist = f.z - this.carZ;
      if (dist < -6 || dist > FLOCK_TRIGGER_FAR + 20) continue;
      const lateralOk = Math.abs(f.x - this.carX) < 5;
      if (!lateralOk) continue;
      if (!best || dist < best.dist) best = { flock: f, dist };
    }
    return best;
  }

  requestDismount() {
    if (this.mode !== "driving") return false;
    const info = this.nearestFlockInfo();
    if (!info || info.dist > FLOCK_TRIGGER_FAR || info.dist < -4) return false;
    if (this.speed > this.car.topSpeed * 0.22) return false;
    this.activeFlock = info.flock;
    this.activeFlock.used = true;
    this.mode = "aiming";
    this.yaw = 0;
    this.ammo = MAGAZINE_SIZE;
    this.reloading = false;
    this.combo = 0;
    this.audio.playDoor(true);
    this.callbacks.onModeChange("aiming");
    return true;
  }

  requestMount() {
    if (this.mode !== "aiming") return false;
    this.mode = "driving";
    if (this.activeFlock) {
      this.activeFlock.birds.forEach((b) => {
        if (b.state !== "shot") b.state = "gone";
      });
    }
    this.activeFlock = null;
    this.audio.playDoor(false);
    this.callbacks.onModeChange("driving");
    return true;
  }

  requestReload() {
    if (this.mode !== "aiming" || this.reloading || this.ammo === MAGAZINE_SIZE) return;
    this.reloading = true;
    this.reloadTimer = RELOAD_TIME;
    this.audio.playReload();
  }

  requestShoot() {
    if (this.mode !== "aiming" || this.reloading || this.ammo <= 0 || !this.activeFlock) return;
    this.ammo -= 1;
    this.shots += 1;
    this.audio.playGunshot();
    this.recoil = 1;
    this.muzzleFlash = 0.12;

    const target = this.pickTargetBird();
    if (target) {
      const flying = target.state === "flying";
      const base = flying ? 100 : 50;
      const points = base + this.combo * 20;
      this.combo += 1;
      this.score += points;
      this.hits += 1;
      this.bag += 1;
      target.state = "shot";
      this.audio.playFeatherPuff();
      this.callbacks.onHit(points, flying);
    } else {
      this.combo = 0;
      this.score = Math.max(0, this.score - 5);
      this.callbacks.onMiss(-5);
      this.spookFlock();
    }

    if (this.ammo === 0) this.requestReload();
  }

  private pickTargetBird(): Bird | null {
    if (!this.activeFlock) return null;
    let best: { bird: Bird; d: number } | null = null;
    for (const b of this.activeFlock.birds) {
      if (b.state === "shot" || b.state === "gone" || b.state === "fleeing") continue;
      const screenYaw = b.baseYaw + b.yaw - this.yaw;
      const d = Math.abs(screenYaw);
      const radius = b.state === "flying" ? 0.075 : 0.11;
      if (d < radius && (!best || d < best.d)) best = { bird: b, d };
    }
    return best?.bird ?? null;
  }

  private spookFlock() {
    if (!this.activeFlock) return;
    this.activeFlock.birds.forEach((b) => {
      if (b.state === "perched" && this.rand(b.id + this.carZ) > 0.4) {
        b.state = "flying";
        b.stateTimer = 0;
        this.audio.playWingFlap();
      }
    });
  }

  getStats() {
    return { score: this.score, shots: this.shots, hits: this.hits, bag: this.bag };
  }

  resetStats() {
    this.score = 0;
    this.shots = 0;
    this.hits = 0;
    this.bag = 0;
    this.combo = 0;
    this.vehicleHealth = 100;
    this.carZ = 0;
    this.carX = 0;
    this.speed = 0;
    this.mode = "driving";
    this.activeFlock = null;
    this.spawnWorld();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.audio.startEngine(this.car.enginePitch, this.car.engineGrit);
    this.lastT = performance.now();
    const loop = (t: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (t - this.lastT) / 1000);
      this.lastT = t;
      this.update(dt);
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.audio.stopEngine();
  }

  destroy() {
    this.stop();
  }

  private update(dt: number) {
    this.dayPhase = (this.dayPhase + dt * 0.002) % 1;

    if (this.mode === "driving") {
      const accel = this.car.acceleration * 26;
      if (this.input.throttle) this.speed += accel * dt;
      else if (this.input.brake) this.speed -= accel * 2.2 * dt;
      else this.speed -= this.car.topSpeed * 0.35 * dt;
      this.speed = Math.max(0, Math.min(this.car.topSpeed, this.speed));

      const speedFactor = this.speed / this.car.topSpeed;
      this.carX += this.input.steer * this.car.handling * (0.4 + speedFactor) * dt * 3.2;
      this.carX = Math.max(-LANE_LIMIT, Math.min(LANE_LIMIT, this.carX));
      this.tilt = this.input.steer * 0.12 * (0.4 + speedFactor);

      this.carZ += this.speed * dt;

      this.audio.setSpeed(speedFactor, this.speed > 0.5);

      if (this.speed > 2 && this.rand(this.carZ) > 0.55) {
        this.dust.push({ x: -0.6 + this.rand(this.carZ * 2) * 1.2, life: 1, side: this.rand(this.carZ * 3) > 0.5 ? 1 : -1 });
      }

      const info = this.nearestFlockInfo();
      if (info && info.dist < FLOCK_FLEE_DIST && this.speed > this.car.topSpeed * 0.45) {
        info.flock.used = true;
        info.flock.birds.forEach((b) => (b.state = "gone"));
      }

      for (const s of this.scenery) {
        if (s.z - this.carZ < -8) {
          s.z = this.carZ + 260 + this.rand(s.seed + this.carZ) * 60;
          s.x = (this.rand(s.seed * 1.3 + this.carZ) > 0.5 ? 1 : -1) * (2 + this.rand(s.seed * 2.7 + this.carZ) * 8);
          s.seed += 1;
        }
      }
      for (const f of this.flocks) {
        if (f.used && f.z - this.carZ < -10) {
          const idx = this.flocks.indexOf(f);
          this.flocks[idx] = this.makeFlock(this.carZ + 220 + this.rand(f.id) * 80);
        }
      }
    } else if (this.activeFlock) {
      if (this.reloading) {
        this.reloadTimer -= dt;
        if (this.reloadTimer <= 0) {
          this.reloading = false;
          this.ammo = MAGAZINE_SIZE;
        }
      }
      this.recoil = Math.max(0, this.recoil - dt * 6);
      this.muzzleFlash = Math.max(0, this.muzzleFlash - dt * 4);

      let aliveCount = 0;
      for (const b of this.activeFlock.birds) {
        b.wingPhase += dt * (b.state === "flying" ? 14 : 3);
        if (b.state === "perched") {
          aliveCount++;
          b.hopPhase += dt;
          if (Math.sin(b.hopPhase) > 0.985 && this.rand(b.id + b.stateTimer) > 0.985) {
            b.state = "flying";
          }
        } else if (b.state === "flying" || b.state === "fleeing") {
          aliveCount++;
          b.stateTimer += dt;
          b.yaw += dt * (0.25 + this.rand(b.flightSeed) * 0.2) * (b.baseYaw > 0 ? 1 : -1) * -1;
          b.altitude = Math.min(1, b.altitude + dt * 0.6);
          if (b.stateTimer > 3.2) b.state = "gone";
        } else if (b.state === "shot") {
          aliveCount++;
          b.altitude = Math.max(-0.3, b.altitude - dt * 1.4);
          b.stateTimer += dt;
          if (b.stateTimer > 0.9) b.state = "gone";
        }
      }
      const remaining = this.activeFlock.birds.some((b) => b.state !== "gone" && b.state !== "shot");
      if (!remaining && aliveCount === 0) {
        // all resolved; keep in aiming until player chooses to mount
      }
    }

    this.dust = this.dust.filter((d) => (d.life -= dt * 1.4) > 0);

    this.emitHud();
  }

  private emitHud() {
    const info = this.mode === "driving" ? this.nearestFlockInfo() : null;
    const flockBirdsLeft = this.activeFlock
      ? this.activeFlock.birds.filter((b) => b.state !== "shot" && b.state !== "gone").length
      : 0;
    this.callbacks.onHud({
      mode: this.mode,
      speedRatio: this.speed / this.car.topSpeed,
      ammo: this.ammo,
      magazine: MAGAZINE_SIZE,
      reloading: this.reloading,
      bag: this.bag,
      score: this.score,
      shots: this.shots,
      hits: this.hits,
      canDismount: !!info && info.dist <= FLOCK_TRIGGER_NEAR && this.speed <= this.car.topSpeed * 0.22,
      canMount: this.mode === "aiming",
      flockBirdsLeft,
      vehicleHealth: this.vehicleHealth,
      timeOfDay: this.dayPhase
    });
  }

  private skyColors(): [string, string] {
    const t = Math.sin(this.dayPhase * Math.PI * 2) * 0.5 + 0.5;
    const mix = (a: string, b: string, k: number) => {
      const pa = parseInt(a.slice(1), 16);
      const pb = parseInt(b.slice(1), 16);
      const ar = (pa >> 16) & 255,
        ag = (pa >> 8) & 255,
        ab = pa & 255;
      const br = (pb >> 16) & 255,
        bg = (pb >> 8) & 255,
        bb = pb & 255;
      const r = Math.round(ar + (br - ar) * k);
      const g = Math.round(ag + (bg - ag) * k);
      const bl = Math.round(ab + (bb - ab) * k);
      return `rgb(${r},${g},${bl})`;
    };
    const top = mix(this.region.skySunset[0], this.region.skyDay[0], t);
    const bottom = mix(this.region.skySunset[1], this.region.skyDay[1], t);
    return [top, bottom];
  }

  private render() {
    const { ctx, width: w, height: h } = this;
    const horizonY = h * HORIZON_RATIO;
    const [skyTop, skyBottom] = this.skyColors();

    ctx.clearRect(0, 0, w, h);

    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, skyTop);
    skyGrad.addColorStop(1, skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    const sunX = w * (0.2 + this.dayPhase * 0.6);
    const sunY = horizonY * (0.25 + 0.5 * Math.abs(Math.sin(this.dayPhase * Math.PI)));
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 90);
    sunGlow.addColorStop(0, "rgba(255,235,190,0.9)");
    sunGlow.addColorStop(1, "rgba(255,235,190,0)");
    ctx.fillStyle = sunGlow;
    ctx.fillRect(sunX - 90, sunY - 90, 180, 180);
    ctx.beginPath();
    ctx.fillStyle = "#fff3d6";
    ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
    ctx.fill();

    this.drawDuneLayer(horizonY, 0.55, 28, "rgba(150,110,60,0.35)");
    this.drawDuneLayer(horizonY, 0.8, 16, this.region.duneColor);

    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    groundGrad.addColorStop(0, this.region.sandColor);
    groundGrad.addColorStop(1, this.region.sandColorDark);
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    if (this.mode === "driving") this.renderDriving(horizonY);
    else this.renderAiming(horizonY);

    this.renderHeatShimmer(horizonY);
  }

  private drawDuneLayer(horizonY: number, heightFactor: number, waves: number, color: string) {
    const { ctx, width: w } = this;
    const parallax = this.mode === "driving" ? this.carX * 6 : this.yaw * 180;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    for (let i = 0; i <= waves; i++) {
      const x = (i / waves) * (w + 80) - 40 - (parallax % (w / waves));
      const y = horizonY - Math.abs(Math.sin(i * 1.7 + this.region.duneColor.length)) * 26 * heightFactor - 6;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, horizonY);
    ctx.closePath();
    ctx.fill();
  }

  private project(x: number, z: number, w: number, horizonY: number, h: number) {
    const relZ = Math.max(0.3, z - this.carZ);
    const p = 1 / relZ;
    const screenX = w / 2 + (x - this.carX) * p * (w * 0.55);
    const screenY = horizonY + p * (h * 0.62);
    const scale = p * 60;
    return { screenX, screenY, scale, relZ };
  }

  private renderDriving(horizonY: number) {
    const { ctx, width: w, height: h } = this;

    // خطوط منظور أرضية
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    const laneCount = 7;
    for (let i = -laneCount; i <= laneCount; i++) {
      const { screenX: sx } = this.project(i * 1.1, this.carZ + 60, w, horizonY, h);
      ctx.beginPath();
      ctx.moveTo(w / 2 + (i * 1.1 - this.carX) * 6, horizonY);
      ctx.lineTo(sx, h);
      ctx.stroke();
    }

    const items = [
      ...this.scenery.map((s) => ({ type: "scenery" as const, ref: s, z: s.z, x: s.x })),
      ...this.flocks
        .filter((f) => !f.used)
        .map((f) => ({ type: "flock" as const, ref: f, z: f.z, x: f.x }))
    ].filter((it) => it.z - this.carZ > 0.3 && it.z - this.carZ < 300);
    items.sort((a, b) => b.z - a.z);

    for (const it of items) {
      const { screenX, screenY, scale, relZ } = this.project(it.x, it.z, w, horizonY, h);
      if (relZ > 240 || screenY < horizonY - 4) continue;
      if (it.type === "scenery") this.drawScenery(it.ref, screenX, screenY, scale);
      else this.drawFlockMarker(it.ref, screenX, screenY, scale);
    }

    for (const d of this.dust) {
      const { screenX, screenY } = this.project(d.side * 0.9, this.carZ + 1.5, w, horizonY, h);
      ctx.globalAlpha = d.life * 0.35;
      ctx.fillStyle = this.region.sandColorDark;
      ctx.beginPath();
      ctx.arc(screenX + d.x * 30, screenY + (1 - d.life) * 30, 10 * (1.4 - d.life), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    this.drawCar(w / 2, h * 0.86, w * 0.34);
  }

  private drawScenery(s: Scenery, x: number, y: number, scale: number) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    if (s.kind === "rock") {
      ctx.fillStyle = "#8a7a63";
      ctx.beginPath();
      ctx.ellipse(0, 0, scale * s.size, scale * s.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(0, scale * s.size * 0.55, scale * s.size, scale * s.size * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.kind === "bush") {
      ctx.fillStyle = "#5a6b3d";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(-scale * 0.4 + i * scale * 0.4, -i * 2, scale * s.size * 0.5, scale * s.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (s.kind === "wood") {
      ctx.strokeStyle = "#5a4327";
      ctx.lineWidth = Math.max(1, scale * 0.15);
      ctx.beginPath();
      ctx.moveTo(-scale * s.size, 0);
      ctx.lineTo(scale * s.size, -scale * s.size * 0.3);
      ctx.stroke();
    } else if (s.kind === "camp") {
      ctx.fillStyle = "#7a6a4a";
      ctx.beginPath();
      ctx.moveTo(-scale * s.size, 0);
      ctx.lineTo(0, -scale * s.size * 1.4);
      ctx.lineTo(scale * s.size, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#3a2f22";
      ctx.beginPath();
      ctx.ellipse(scale * s.size * 1.6, scale * 0.1, scale * 0.25, scale * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.kind === "ruin") {
      ctx.fillStyle = "#9c8a6a";
      ctx.fillRect(-scale * s.size * 0.4, -scale * s.size * 1.2, scale * s.size * 0.8, scale * s.size * 1.2);
      ctx.fillRect(scale * s.size * 0.5, -scale * s.size * 0.7, scale * s.size * 0.5, scale * s.size * 0.7);
    }
    ctx.restore();
  }

  private drawFlockMarker(f: Flock, x: number, y: number, scale: number) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    f.birds.forEach((b, i) => {
      const bx = (i - f.birds.length / 2) * scale * 0.35;
      ctx.fillStyle = b.kind === "qumri" ? "#8b7355" : "#7d8a99";
      ctx.beginPath();
      ctx.ellipse(bx, 0, scale * 0.22, scale * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  private drawCar(cx: number, cy: number, size: number) {
    const { ctx } = this;
    const bounce = Math.sin(this.carZ * 0.9) * this.car.suspensionSoftness * (2 + this.speed / this.car.topSpeed * 3);
    ctx.save();
    ctx.translate(cx, cy + bounce);
    ctx.rotate(this.tilt);

    const bodyW = size;
    const bodyH = size * 0.42;

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(0, bodyH * 0.62, bodyW * 0.52, bodyH * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    const wheelAngle = (this.carZ * 6) % (Math.PI * 2);
    ctx.fillStyle = "#1c1a16";
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.translate(side * bodyW * 0.32, bodyH * 0.55);
      ctx.rotate(wheelAngle * side);
      ctx.fillRect(-bodyW * 0.09, -bodyW * 0.09, bodyW * 0.18, bodyW * 0.18);
      ctx.restore();
    });

    ctx.fillStyle = this.car.color;
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.5, bodyH * 0.5);
    ctx.lineTo(-bodyW * 0.46, -bodyH * 0.1);
    ctx.lineTo(-bodyW * 0.28, -bodyH * 0.55);
    ctx.lineTo(bodyW * 0.28, -bodyH * 0.55);
    ctx.lineTo(bodyW * 0.46, -bodyH * 0.1);
    ctx.lineTo(bodyW * 0.5, bodyH * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.car.colorDark;
    ctx.fillRect(-bodyW * 0.5, bodyH * 0.32, bodyW, bodyH * 0.2);

    ctx.fillStyle = "rgba(140,190,220,0.55)";
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.24, -bodyH * 0.52);
    ctx.lineTo(-bodyW * 0.16, -bodyH * 0.92);
    ctx.lineTo(bodyW * 0.16, -bodyH * 0.92);
    ctx.lineTo(bodyW * 0.24, -bodyH * 0.52);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.car.accent;
    ctx.fillRect(-bodyW * 0.06, -bodyH * 0.02, bodyW * 0.12, bodyH * 0.14);

    ctx.fillStyle = "#fff6d8";
    ctx.beginPath();
    ctx.ellipse(-bodyW * 0.46, bodyH * 0.1, bodyW * 0.03, bodyH * 0.06, 0, 0, Math.PI * 2);
    ctx.ellipse(bodyW * 0.46, bodyH * 0.1, bodyW * 0.03, bodyH * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderAiming(horizonY: number) {
    const { ctx, width: w, height: h } = this;

    if (this.activeFlock) {
      const list = [...this.activeFlock.birds].sort((a, b) => (a.state === "flying" ? 1 : 0) - (b.state === "flying" ? 1 : 0));
      for (const b of list) {
        if (b.state === "gone") continue;
        const screenYaw = b.baseYaw + b.yaw - this.yaw;
        if (Math.abs(screenYaw) > 0.75) continue;
        const x = w / 2 + screenYaw * w * 0.9;
        const groundY = horizonY + h * 0.34;
        const flightLift = b.state === "flying" || b.state === "fleeing" ? b.altitude * h * 0.22 : 0;
        const fallDrop = b.state === "shot" ? Math.max(0, -b.altitude) * h * 0.3 : 0;
        const y = groundY - flightLift + fallDrop;
        this.drawBird(x, y, 46 - Math.abs(screenYaw) * 10, b);
      }
    }

    this.drawGunViewmodel(w, h);

    if (this.muzzleFlash > 0) {
      ctx.fillStyle = `rgba(255,235,180,${this.muzzleFlash})`;
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.72, 36, 0, Math.PI * 2);
      ctx.fill();
    }

    const cx = w / 2;
    const cy = h / 2 - this.recoil * 14;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    const gap = 8 + this.recoil * 10;
    const len = 14;
    ctx.beginPath();
    ctx.moveTo(cx - gap - len, cy);
    ctx.lineTo(cx - gap, cy);
    ctx.moveTo(cx + gap, cy);
    ctx.lineTo(cx + gap + len, cy);
    ctx.moveTo(cx, cy - gap - len);
    ctx.lineTo(cx, cy - gap);
    ctx.moveTo(cx, cy + gap);
    ctx.lineTo(cx, cy + gap + len);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }

  private drawBird(x: number, y: number, size: number, b: Bird) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    const flap = Math.sin(b.wingPhase) * (b.state === "flying" ? 0.9 : 0.15);
    const bodyColor = b.kind === "qumri" ? "#8b7355" : "#7d8a99";
    const bellyColor = b.kind === "qumri" ? "#c9b48f" : "#c3ccd4";

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.22, size * 0.32, size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.translate(side * size * 0.1, -size * 0.05);
      ctx.rotate(side * (0.3 + flap * 0.6));
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(side * size * 0.18, 0, size * 0.24, size * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.22, size * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.06, size * 0.14, size * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(size * 0.2, -size * 0.08, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c98a3f";
    ctx.beginPath();
    ctx.moveTo(size * 0.28, -size * 0.08);
    ctx.lineTo(size * 0.38, -size * 0.05);
    ctx.lineTo(size * 0.28, -size * 0.02);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawGunViewmodel(w: number, h: number) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(w / 2 + this.yaw * -40, h - this.recoil * 22);
    ctx.rotate(this.recoil * -0.06);
    ctx.fillStyle = "#2b2116";
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(-14, -160);
    ctx.lineTo(14, -160);
    ctx.lineTo(30, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4a3a26";
    ctx.fillRect(-10, -70, 20, 60);
    ctx.restore();
  }

  private renderHeatShimmer(horizonY: number) {
    const { ctx, width: w } = this;
    const t = performance.now() / 600;
    ctx.save();
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = "#fff";
      const y = horizonY - 6 + Math.sin(t + i) * 3;
      ctx.fillRect(0, y, w, 2);
    }
    ctx.restore();
  }
}
