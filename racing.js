(() => {
  "use strict";

  // ---------- Tuned physics constants (validated against known 1/4-mile figures) ----------
  const PHYS = {
    mu: 1.05,              // effective tire grip coefficient (street performance tire)
    transferFactor: 0.35,  // extra rear load from weight transfer under acceleration
    airDensity: 1.2,
    rollingCoeff: 0.015,
    gravity: 9.81,
    driveEfficiency: 0.92,
    spinRpmClimb: 4500      // rpm/s the engine flares to while wheels are spinning freely
  };

  const QUARTER_MILE_M = 402.336;

  const CARS = {
    crownvic: {
      key: "crownvic",
      name: "فورد كراون فيكتوريا 2011",
      shortName: "كراون فيكتوريا",
      hp: 250, torqueNm: 403, torqueRpm: 4000, redline: 5200, idleRpm: 800,
      mass: 1955,
      gearRatios: [3.02, 1.62, 1.00, 0.75],
      finalDrive: 3.27,
      wheelRadius: 0.34,
      dragArea: 0.82,
      rearPct: 0.44,
      bodyColor: "#16171b", trimColor: "#c9ccd1", cabinColor: "#202127", tailColor: "#ff4b4b"
    },
    caprice: {
      key: "caprice",
      name: "شيفروليه كابرس 2006",
      shortName: "كابرس",
      hp: 362, torqueNm: 530, torqueRpm: 4400, redline: 6500, idleRpm: 800,
      mass: 1850,
      gearRatios: [3.06, 1.63, 1.00, 0.70],
      finalDrive: 3.27,
      wheelRadius: 0.33,
      dragArea: 0.67,
      rearPct: 0.47,
      bodyColor: "#7a1428", trimColor: "#d9b04c", cabinColor: "#8c1b32", tailColor: "#ff4b4b"
    }
  };

  function engineTorque(cfg, rpm) {
    if (rpm >= cfg.redline) {
      return torqueCurve(cfg, cfg.redline) * 0.3; // rev-limiter bounce
    }
    return torqueCurve(cfg, rpm);
  }
  function torqueCurve(cfg, rpm) {
    let t;
    if (rpm <= cfg.torqueRpm) {
      t = cfg.torqueNm * (0.5 + 0.5 * (rpm / cfg.torqueRpm));
    } else {
      const fall = (rpm - cfg.torqueRpm) / (cfg.redline - cfg.torqueRpm);
      t = cfg.torqueNm * (1 - 0.35 * fall);
    }
    return Math.max(t, cfg.torqueNm * 0.4);
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  // ---------- Canvas ----------
  const canvas = document.getElementById("track");
  const ctx = canvas.getContext("2d");
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener("resize", resize);
  resize();

  const SCALE = 7.5; // px per meter at the start; we compress as the race progresses

  // ---------- Entities ----------
  function makeEntity(cfg) {
    return {
      cfg, x: 0, v: 0, rpm: cfg.idleRpm, gear: 0, prevAccel: 0,
      spinning: false, moving: false, reactionTime: null, finishTime: null,
      trapSpeed: null, throttle: false, particles: []
    };
  }

  let player = null, ai = null;
  let state = "select"; // select | staging | racing | done
  let stagingStart = 0, greenTime = 0, aiReactTime = 0, aiShiftThreshold = 0.96;
  let raceEndTimer = 0;
  let lastTs = 0;
  let foulBy = null;

  // ---------- Physics step ----------
  function stepEntity(e, dt, throttleOn) {
    if (!throttleOn) {
      e.rpm = Math.max(e.cfg.idleRpm, e.rpm - 1500 * dt);
      return;
    }
    const cfg = e.cfg;
    const torque = engineTorque(cfg, e.rpm);
    const wheelTorque = torque * cfg.gearRatios[e.gear] * cfg.finalDrive * PHYS.driveEfficiency;
    const wheelForce = wheelTorque / cfg.wheelRadius;

    const rearLoad = cfg.mass * PHYS.gravity * cfg.rearPct *
      (1 + PHYS.transferFactor * clamp(e.prevAccel / PHYS.gravity, 0, 1));
    const maxTraction = PHYS.mu * rearLoad;

    e.spinning = wheelForce > maxTraction;
    const force = e.spinning ? maxTraction : wheelForce;

    const drag = 0.5 * PHYS.airDensity * cfg.dragArea * e.v * e.v;
    const rr = PHYS.rollingCoeff * cfg.mass * PHYS.gravity;
    const net = force - drag - rr;
    const accel = net / cfg.mass;

    e.v = Math.max(0, e.v + accel * dt);
    e.x += e.v * dt;

    if (e.spinning) {
      e.rpm = Math.min(cfg.redline, e.rpm + PHYS.spinRpmClimb * dt);
    } else {
      e.rpm = (e.v / cfg.wheelRadius) * cfg.gearRatios[e.gear] * cfg.finalDrive * 60 / (2 * Math.PI);
      e.rpm = Math.max(cfg.idleRpm, e.rpm);
    }
    e.prevAccel = accel;
  }

  function shiftUp(e) {
    if (e.gear >= e.cfg.gearRatios.length - 1) return;
    const old = e.gear;
    e.gear++;
    e.rpm *= e.cfg.gearRatios[e.gear] / e.cfg.gearRatios[old];
  }
  function shiftDown(e) {
    if (e.gear <= 0) return;
    const old = e.gear;
    e.gear--;
    e.rpm *= e.cfg.gearRatios[e.gear] / e.cfg.gearRatios[old];
    e.rpm = Math.min(e.rpm, e.cfg.redline);
  }

  // ---------- Input ----------
  const keys = {};
  window.addEventListener("keydown", (e) => {
    const k = e.key === " " ? "space" : e.key.toLowerCase();
    if (keys[k]) return; // ignore auto-repeat for edge-triggered actions
    keys[k] = true;

    if (k === "space") {
      if (state === "staging") {
        if (performance.now() < greenTime) {
          triggerFoul("player");
        }
      } else if (state === "racing" && !player.moving) {
        player.moving = true;
        player.reactionTime = (performance.now() - greenTime) / 1000;
      }
    }
    if (state === "racing" && player.moving) {
      if (k === "arrowup") shiftUp(player);
      if (k === "arrowdown") shiftDown(player);
    }
  });
  window.addEventListener("keyup", (e) => {
    const k = e.key === " " ? "space" : e.key.toLowerCase();
    keys[k] = false;
  });

  function triggerFoul(who) {
    foulBy = who;
    state = "done";
    raceEndTimer = 0.8;
    finishRace();
  }

  // ---------- Race flow ----------
  const el = {
    hud: document.getElementById("hud"),
    selectScreen: document.getElementById("selectScreen"),
    resultScreen: document.getElementById("resultScreen"),
    tree: document.getElementById("tree"),
    playerTag: document.getElementById("player-tag"),
    rpmFill: document.getElementById("rpm-fill"),
    gearNum: document.getElementById("gear-num"),
    speedNum: document.getElementById("speed-num"),
    rpmNum: document.getElementById("rpm-num"),
    spinWarn: document.getElementById("spin-warning"),
    p1Name: document.getElementById("p1-name"),
    p2Name: document.getElementById("p2-name"),
    p1Progress: document.getElementById("p1-progress"),
    p2Progress: document.getElementById("p2-progress"),
  };

  document.querySelectorAll(".car-card").forEach((btn) => {
    btn.addEventListener("click", () => startRace(btn.dataset.car));
  });
  document.getElementById("rematchBtn").addEventListener("click", () => startRace(player.cfg.key));
  document.getElementById("changeCarBtn").addEventListener("click", () => {
    el.resultScreen.classList.add("hidden");
    el.selectScreen.classList.remove("hidden");
    state = "select";
  });

  function startRace(playerCarKey) {
    const aiCarKey = playerCarKey === "crownvic" ? "caprice" : "crownvic";
    player = makeEntity(CARS[playerCarKey]);
    ai = makeEntity(CARS[aiCarKey]);
    foulBy = null;

    el.playerTag.textContent = `${player.cfg.name} — أنت`;
    el.p1Name.textContent = "أنت";
    el.p2Name.textContent = ai.cfg.shortName;

    el.selectScreen.classList.add("hidden");
    el.resultScreen.classList.add("hidden");
    el.hud.classList.remove("hidden");

    document.querySelectorAll(".bulb").forEach((b) => b.classList.remove("lit"));

    stagingStart = performance.now();
    greenTime = stagingStart + 2500;
    aiReactTime = greenTime + rand(250, 600);
    aiShiftThreshold = rand(0.93, 0.99);

    state = "staging";
    lastTs = performance.now();
    requestAnimationFrame(loop);
  }

  function updateTreeLights(now) {
    const t = now - stagingStart;
    const set = (id, on) => {
      const b = document.querySelector(`.bulb[data-b="${id}"]`);
      if (b) b.classList.toggle("lit", on);
    };
    set("pre", t >= 0);
    set("stage", t >= 0);
    set("a1", t >= 1000);
    set("a2", t >= 1500);
    set("a3", t >= 2000);
    set("green", t >= 2500);
  }

  function finishRace() {
    document.getElementById("result-title").textContent =
      foulBy === "player" ? "بداية خاطئة! خسرت السباق" : winnerText();
    document.getElementById("res-p1-name").textContent = `أنت (${player.cfg.shortName})`;
    document.getElementById("res-p2-name").textContent = ai.cfg.shortName;
    document.getElementById("res-p1-et").textContent = player.finishTime ? `${player.finishTime.toFixed(2)} ث` : (foulBy === "player" ? "بداية خاطئة" : "لم يُنهِ");
    document.getElementById("res-p2-et").textContent = ai.finishTime ? `${ai.finishTime.toFixed(2)} ث` : "لم يُنهِ";
    document.getElementById("res-p1-trap").textContent = player.trapSpeed ? `${player.trapSpeed.toFixed(1)} كم/س` : "--";
    document.getElementById("res-p2-trap").textContent = ai.trapSpeed ? `${ai.trapSpeed.toFixed(1)} كم/س` : "--";
    document.getElementById("res-p1-rt").textContent = player.reactionTime != null ? `${player.reactionTime.toFixed(3)} ث` : "--";
    document.getElementById("res-p2-rt").textContent = ai.reactionTime != null ? `${((aiReactTime - greenTime) / 1000).toFixed(3)} ث` : "--";
    el.resultScreen.classList.remove("hidden");
    el.hud.classList.add("hidden");
  }

  function winnerText() {
    if (player.finishTime != null && (ai.finishTime == null || player.finishTime < ai.finishTime)) return "🏆 فزت بالسباق!";
    if (ai.finishTime != null) return "خسرت — فاز " + ai.cfg.shortName;
    return "النتيجة";
  }

  // ---------- Update ----------
  function update(dt) {
    const now = performance.now();

    if (state === "staging") {
      updateTreeLights(now);
      if (now >= greenTime) state = "racing";
      return;
    }

    if (state === "racing") {
      if (keys["space"] && !player.moving && now >= greenTime) {
        player.moving = true;
        player.reactionTime = (now - greenTime) / 1000;
      }
      if (!ai.moving && now >= aiReactTime) ai.moving = true;

      if (player.moving && player.finishTime == null) {
        stepEntity(player, dt, keys["space"] === true);
        if (player.x >= QUARTER_MILE_M) {
          player.x = QUARTER_MILE_M;
          player.finishTime = (now - greenTime) / 1000;
          player.trapSpeed = player.v * 3.6;
        }
      }
      if (ai.moving && ai.finishTime == null) {
        if (ai.rpm >= ai.cfg.redline * aiShiftThreshold) shiftUp(ai);
        stepEntity(ai, dt, true);
        if (ai.x >= QUARTER_MILE_M) {
          ai.x = QUARTER_MILE_M;
          ai.finishTime = (now - greenTime) / 1000;
          ai.trapSpeed = ai.v * 3.6;
        }
      }

      spawnSmoke(player, dt);
      spawnSmoke(ai, dt);

      if (player.finishTime != null && ai.finishTime != null) {
        state = "done";
        raceEndTimer = 1.0;
      }
      updateHud();
    }

    if (state === "done") {
      raceEndTimer -= dt;
      if (raceEndTimer <= 0 && el.resultScreen.classList.contains("hidden")) {
        finishRace();
      }
    }
  }

  function spawnSmoke(e, dt) {
    if (e.spinning && Math.random() < 0.6) {
      e.particles.push({ dx: -0.4 - Math.random() * 0.3, dy: -0.1 + Math.random() * 0.2, life: 0.6, age: 0 });
    }
    for (let i = e.particles.length - 1; i >= 0; i--) {
      e.particles[i].age += dt;
      if (e.particles[i].age > e.particles[i].life) e.particles.splice(i, 1);
    }
  }

  function updateHud() {
    el.rpmFill.style.width = `${clamp((player.rpm / player.cfg.redline) * 100, 0, 100)}%`;
    el.gearNum.textContent = player.gear + 1;
    el.speedNum.textContent = Math.round(player.v * 3.6);
    el.rpmNum.textContent = Math.round(player.rpm);
    el.spinWarn.classList.toggle("hidden", !player.spinning);
    el.p1Progress.style.width = `${clamp((player.x / QUARTER_MILE_M) * 100, 0, 100)}%`;
    el.p2Progress.style.width = `${clamp((ai.x / QUARTER_MILE_M) * 100, 0, 100)}%`;
  }

  // ---------- Draw ----------
  function worldScale() {
    const lead = Math.max(player.x, ai.x);
    return lead > 260 ? Math.max(3.2, SCALE * (260 / lead)) : SCALE;
  }

  function drawCar(e, screenX, laneY, scale) {
    const cfg = e.cfg;
    const bodyLen = 34, bodyH = 16;
    ctx.save();
    ctx.translate(screenX, laneY);

    // smoke particles (behind car)
    for (const p of e.particles) {
      const a = 1 - p.age / p.life;
      ctx.beginPath();
      ctx.fillStyle = `rgba(180,175,170,${0.35 * a})`;
      ctx.ellipse(-bodyLen / 2 + p.dx * 40 * p.age, bodyH / 2 + p.dy * 20, 8 + p.age * 14, 5 + p.age * 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // shadow
    ctx.beginPath();
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.ellipse(0, bodyH / 2 + 6, bodyLen / 1.7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // wheels
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.arc(-bodyLen / 2 + 7, bodyH / 2, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(bodyLen / 2 - 7, bodyH / 2, 6, 0, Math.PI * 2); ctx.fill();

    // body
    ctx.fillStyle = cfg.bodyColor;
    roundRect(-bodyLen / 2, -bodyH / 2, bodyLen, bodyH, 4);
    ctx.fill();
    ctx.strokeStyle = cfg.trimColor;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // cabin
    ctx.fillStyle = cfg.cabinColor;
    roundRect(-bodyLen / 2 + 9, -bodyH / 2 - 8, bodyLen - 20, 9, 3);
    ctx.fill();

    // taillight
    ctx.fillStyle = cfg.tailColor;
    ctx.fillRect(-bodyLen / 2 - 1, -3, 3, 6);

    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    const w = canvas.width, h = canvas.height;

    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, "#241a33");
    sky.addColorStop(0.5, "#6b3242");
    sky.addColorStop(1, "#d9812f");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.55);

    // sun
    ctx.beginPath();
    ctx.fillStyle = "#f4c874";
    ctx.arc(w * 0.78, h * 0.42, 46, 0, Math.PI * 2);
    ctx.fill();

    // ground
    ctx.fillStyle = "#3a3038";
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    if (state === "select") return;

    const scale = worldScale();
    const leadX = Math.max(player.x, ai.x);
    const camOffset = leadX * scale - w * 0.28;

    const laneYPlayer = h * 0.62;
    const laneYAi = h * 0.78;

    // road strip
    ctx.fillStyle = "#2c262b";
    ctx.fillRect(0, h * 0.55, w, h * 0.32);

    // distance markers + lane dashes
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.setLineDash([14, 16]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, (laneYPlayer + laneYAi) / 2);
    ctx.lineTo(w, (laneYPlayer + laneYAi) / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "11px Rajdhani, sans-serif";
    for (let m = 0; m <= QUARTER_MILE_M + 20; m += 50) {
      const sx = m * scale - camOffset;
      if (sx < -20 || sx > w + 20) continue;
      ctx.fillRect(sx, h * 0.55, 2, 10);
      ctx.fillText(`${m}m`, sx + 4, h * 0.55 + 20);
    }

    // finish line
    const finishSx = QUARTER_MILE_M * scale - camOffset;
    if (finishSx > -40 && finishSx < w + 40) {
      const squares = 8;
      const sqH = (h * 0.32) / squares;
      for (let i = 0; i < squares; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#eee" : "#111";
        ctx.fillRect(finishSx, h * 0.55 + i * sqH, 10, sqH);
      }
    }

    drawCar(ai, ai.x * scale - camOffset, laneYAi, scale);
    drawCar(player, player.x * scale - camOffset, laneYPlayer, scale);
  }

  // ---------- Loop ----------
  function loop(ts) {
    if (state === "done" && el.resultScreen && !el.resultScreen.classList.contains("hidden")) {
      return; // stop looping once results are shown
    }
    requestAnimationFrame(loop);
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;
    update(dt);
    draw();
  }

  draw(); // initial background paint behind the selection screen
})();
