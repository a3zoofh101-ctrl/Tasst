(() => {
  "use strict";

  // ---------- Config ----------
  const WORLD_W = 3200;
  const WORLD_H = 3200;
  const CAMP = { x: WORLD_W / 2, y: WORLD_H / 2, radius: 140 };
  const CLEARING_RADIUS = 220; // no trees/animals spawn too close to camp

  const SPECIES = {
    rabbit: {
      name: "أرنب", emoji: "🐇", hp: 1, wanderSpeed: 40, fleeSpeed: 150,
      detection: 210, value: 5, coinValue: 3, trapVulnerable: true, dangerous: false,
      radius: 12, color: "#c9a876"
    },
    deer: {
      name: "غزال", emoji: "🦌", hp: 2, wanderSpeed: 55, fleeSpeed: 190,
      detection: 260, value: 15, coinValue: 8, trapVulnerable: false, dangerous: false,
      radius: 16, color: "#a97c50"
    },
    fox: {
      name: "ثعلب", emoji: "🦊", hp: 2, wanderSpeed: 60, fleeSpeed: 210,
      detection: 240, value: 20, coinValue: 10, trapVulnerable: true, dangerous: false,
      radius: 13, color: "#d35400"
    },
    elephant: {
      name: "فيل", emoji: "🐘", hp: 6, wanderSpeed: 30, fleeSpeed: 90,
      detection: 190, value: 60, coinValue: 30, trapVulnerable: false, dangerous: false,
      radius: 26, color: "#95a5a6"
    },
    lion: {
      name: "أسد", emoji: "🦁", hp: 4, wanderSpeed: 45, fleeSpeed: 180,
      chargeSpeed: 230, detection: 300, value: 100, coinValue: 50,
      trapVulnerable: false, dangerous: true, radius: 18, color: "#e0a458",
      attackDamage: 12, attackCooldown: 1.0, chargeTriggerDist: 260, giveUpDist: 620
    }
  };

  const SPAWN_CAP = { rabbit: 8, deer: 6, fox: 5, elephant: 3, lion: 3 };
  const SPAWN_INTERVAL = 6; // seconds, try to spawn one missing animal

  const WEAPONS = {
    bow: {
      key: "1", name: "القوس", icon: "🏹", ammoField: "arrows",
      damage: 1, projectileSpeed: 620, cooldown: 0.55, noiseRadius: 160, silent: true
    },
    rifle: {
      key: "2", name: "البندقية", icon: "🔫", ammoField: "bullets",
      damage: 3, projectileSpeed: 1400, cooldown: 0.85, noiseRadius: 900, silent: false,
      magazine: 6, reloadTime: 1.5
    },
    trap: {
      key: "3", name: "الفخ", icon: "🪤", ammoField: "traps",
      cooldown: 0.4, placeRange: 70
    }
  };

  const MOVE_SPEED = 150;
  const RUN_MULT = 1.8;
  const SNEAK_MULT = 0.5;
  const STAMINA_MAX = 100;
  const STAMINA_DRAIN = 28; // per second while running
  const STAMINA_REGEN = 16; // per second otherwise

  // ---------- Utilities ----------
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.floor(rand(a, b + 1));
  const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const angleTo = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);

  function segCircleIntersect(x1, y1, x2, y2, cx, cy, r) {
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return dist(x1, y1, cx, cy) <= r;
    let t = ((cx - x1) * dx + (cy - y1) * dy) / len2;
    t = clamp(t, 0, 1);
    const px = x1 + t * dx, py = y1 + t * dy;
    return dist(px, py, cx, cy) <= r;
  }

  // ---------- Canvas setup ----------
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  // ---------- Game state ----------
  let state = "menu"; // menu | playing | paused | gameover
  let lastTime = 0;

  const keys = {};
  const mouse = { sx: 0, sy: 0, wx: 0, wy: 0, down: false };

  const player = {
    x: CAMP.x, y: CAMP.y, angle: 0,
    health: 100, maxHealth: 100,
    stamina: STAMINA_MAX,
    stance: "normal", // normal | run | sneak
    weapon: "bow",
    ammo: { arrows: 10, bullets: 18, bulletsInMag: 6, traps: 5 },
    score: 0, coins: 0,
    shootCooldown: 0,
    reloading: false, reloadTimer: 0,
    campCooldown: 0,
    firstCatch: {}
  };

  const camera = { x: 0, y: 0 };
  const trees = [];
  const animals = [];
  const traps = [];
  const projectiles = [];
  const floats = []; // floating text popups

  let spawnTimer = SPAWN_INTERVAL;

  // ---------- World generation ----------
  function genTrees() {
    trees.length = 0;
    const count = 260;
    let tries = 0;
    while (trees.length < count && tries < count * 20) {
      tries++;
      const x = rand(60, WORLD_W - 60);
      const y = rand(60, WORLD_H - 60);
      if (dist(x, y, CAMP.x, CAMP.y) < CLEARING_RADIUS) continue;
      const r = rand(16, 34);
      let overlaps = false;
      for (const t of trees) {
        if (dist(x, y, t.x, t.y) < r + t.r + 12) { overlaps = true; break; }
      }
      if (overlaps) continue;
      trees.push({ x, y, r });
    }
  }

  function randomSpawnPoint(minDistFromPlayer) {
    let x, y, tries = 0;
    do {
      x = rand(80, WORLD_W - 80);
      y = rand(80, WORLD_H - 80);
      tries++;
    } while ((dist(x, y, CAMP.x, CAMP.y) < CLEARING_RADIUS ||
              dist(x, y, player.x, player.y) < minDistFromPlayer) && tries < 60);
    return { x, y };
  }

  function spawnAnimal(speciesKey, pos) {
    const cfg = SPECIES[speciesKey];
    const p = pos || randomSpawnPoint(500);
    animals.push({
      species: speciesKey, cfg,
      x: p.x, y: p.y,
      hp: cfg.hp,
      state: "wander", // wander | alert | flee | attack | dead
      alert: 0,
      wanderTarget: null,
      stateTimer: rand(1, 3),
      attackTimer: 0,
      angle: rand(0, Math.PI * 2),
      deadTimer: 0
    });
  }

  function initialSpawns() {
    animals.length = 0;
    for (const key in SPAWN_CAP) {
      const n = Math.ceil(SPAWN_CAP[key] * 0.6);
      for (let i = 0; i < n; i++) spawnAnimal(key);
    }
  }

  // ---------- Floating text ----------
  function addFloat(x, y, text, color) {
    floats.push({ x, y, text, color: color || "#fff", life: 1.2, vy: -30 });
  }

  function notice(text) {
    const el = document.getElementById("notice-banner");
    el.textContent = text;
    el.classList.remove("hidden");
    el.style.opacity = "1";
    clearTimeout(notice._t);
    notice._t = setTimeout(() => { el.style.opacity = "0"; }, 2200);
  }

  // ---------- Line of sight ----------
  function hasLineOfSight(x1, y1, x2, y2) {
    for (const t of trees) {
      if (segCircleIntersect(x1, y1, x2, y2, t.x, t.y, t.r * 0.8)) return false;
    }
    return true;
  }

  function treeBlocking(x, y, radius) {
    for (const t of trees) {
      const d = dist(x, y, t.x, t.y);
      if (d < t.r * 0.6 + radius) return t;
    }
    return null;
  }

  // ---------- Input ----------
  window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === "Control") keys["ctrl"] = true;
    if (e.key === "Shift") keys["shift"] = true;
    if (state === "playing") {
      if (e.key === "1") player.weapon = "bow";
      if (e.key === "2") player.weapon = "rifle";
      if (e.key === "3") player.weapon = "trap";
      if (e.key.toLowerCase() === "r") tryReload();
      if (e.key.toLowerCase() === "e") tryInteract();
      if (e.key === "Escape") togglePause();
    } else if (state === "paused" && e.key === "Escape") {
      togglePause();
    }
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
    if (e.key === "Control") keys["ctrl"] = false;
    if (e.key === "Shift") keys["shift"] = false;
  });
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.sx = e.clientX - rect.left;
    mouse.sy = e.clientY - rect.top;
  });
  canvas.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    mouse.down = true;
    if (state === "playing") handleShoot();
  });
  canvas.addEventListener("mouseup", (e) => { if (e.button === 0) mouse.down = false; });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  function togglePause() {
    if (state === "playing") {
      state = "paused";
      document.getElementById("pauseScreen").classList.remove("hidden");
    } else if (state === "paused") {
      state = "playing";
      document.getElementById("pauseScreen").classList.add("hidden");
      lastTime = performance.now();
    }
  }

  // ---------- Weapon actions ----------
  function tryReload() {
    if (player.weapon !== "rifle") return;
    const w = WEAPONS.rifle;
    if (player.reloading) return;
    if (player.ammo.bulletsInMag >= w.magazine) return;
    if (player.ammo.bullets <= 0) { addFloat(player.x, player.y - 40, "لا ذخيرة احتياطية!", "#ff6b6b"); return; }
    player.reloading = true;
    player.reloadTimer = w.reloadTime;
  }

  function handleShoot() {
    if (player.shootCooldown > 0) return;
    const w = WEAPONS[player.weapon];
    if (player.weapon === "trap") {
      placeTrap();
      return;
    }
    if (player.reloading) return;
    if (player.weapon === "rifle") {
      if (player.ammo.bulletsInMag <= 0) { tryReload(); return; }
      player.ammo.bulletsInMag--;
    } else {
      if (player.ammo.arrows <= 0) { addFloat(player.x, player.y - 40, "لا سهام متبقية!", "#ff6b6b"); return; }
      player.ammo.arrows--;
    }
    player.shootCooldown = w.cooldown;
    projectiles.push({
      x: player.x, y: player.y, angle: player.angle,
      speed: w.projectileSpeed, damage: w.damage, weapon: player.weapon, life: 2
    });
    // noise pulse
    for (const a of animals) {
      if (a.state === "dead") continue;
      if (dist(a.x, a.y, player.x, player.y) < w.noiseRadius) {
        a.alert = Math.min(100, a.alert + (w.silent ? 25 : 100));
      }
    }
    if (!w.silent) notice("🔊 دوّى صوت البندقية! هربت الحيوانات القريبة");
  }

  function placeTrap() {
    if (player.ammo.traps <= 0) { addFloat(player.x, player.y - 40, "لا فخاخ متبقية!", "#ff6b6b"); return; }
    const w = WEAPONS.trap;
    let tx = mouse.wx, ty = mouse.wy;
    const d = dist(player.x, player.y, tx, ty);
    if (d > w.placeRange) {
      const ang = angleTo(player.x, player.y, tx, ty);
      tx = player.x + Math.cos(ang) * w.placeRange;
      ty = player.y + Math.sin(ang) * w.placeRange;
    }
    if (dist(tx, ty, CAMP.x, CAMP.y) < CAMP.radius) return;
    player.ammo.traps--;
    player.shootCooldown = w.cooldown;
    traps.push({ x: tx, y: ty, state: "armed", caughtSpecies: null, radius: 26 });
    addFloat(tx, ty - 20, "تم وضع الفخ", "#a3e4a1");
  }

  function tryInteract() {
    // collect nearest trap
    let nearestTrap = null, nd = 60;
    for (const t of traps) {
      const d = dist(player.x, player.y, t.x, t.y);
      if (d < nd) { nd = d; nearestTrap = t; }
    }
    if (nearestTrap) {
      if (nearestTrap.state === "triggered") {
        const cfg = SPECIES[nearestTrap.caughtSpecies];
        awardCatch(cfg, nearestTrap.x, nearestTrap.y, true);
      }
      traps.splice(traps.indexOf(nearestTrap), 1);
      player.ammo.traps++;
      addFloat(player.x, player.y - 30, "تم جمع الفخ", "#a3e4a1");
      return;
    }
    // camp restock
    if (dist(player.x, player.y, CAMP.x, CAMP.y) < CAMP.radius) {
      if (player.campCooldown > 0) {
        addFloat(player.x, player.y - 40, `انتظر ${Math.ceil(player.campCooldown)} ث للتزود مجددًا`, "#ffd479");
        return;
      }
      player.ammo.arrows = 10;
      player.ammo.bullets = 18;
      player.ammo.bulletsInMag = WEAPONS.rifle.magazine;
      player.ammo.traps = 5;
      player.health = player.maxHealth;
      player.campCooldown = 60;
      notice("🏕️ تم التزود بالكامل عند المخيم");
    }
  }

  function awardCatch(cfg, x, y, fromTrap) {
    player.score += cfg.value;
    player.coins += cfg.coinValue;
    addFloat(x, y - 20, `+${cfg.value} 🪙${cfg.coinValue}`, "#ffe08a");
    if (!player.firstCatch[cfg.name]) {
      player.firstCatch[cfg.name] = true;
      notice(`🎉 أول اصطياد لـ ${cfg.name}${fromTrap ? " بالفخ" : ""}!`);
    }
  }

  // ---------- Animal AI ----------
  function updateAnimal(a, dt) {
    if (a.state === "dead") {
      a.deadTimer -= dt;
      return;
    }
    const cfg = a.cfg;
    const dToPlayer = dist(a.x, a.y, player.x, player.y);

    // detection
    const stanceMult = player.stance === "sneak" ? SNEAK_MULT : (player.stance === "run" ? RUN_MULT * 1.3 : 1);
    const effectiveRange = cfg.detection * stanceMult;
    const los = dToPlayer < effectiveRange * 1.4 ? hasLineOfSight(a.x, a.y, player.x, player.y) : false;
    const noticed = dToPlayer < effectiveRange && los;
    const panicClose = dToPlayer < 55;

    if ((noticed || panicClose) && a.state !== "flee" && a.state !== "attack") {
      a.alert = Math.min(100, a.alert + dt * (panicClose ? 140 : 45));
    } else if (a.state === "wander") {
      a.alert = Math.max(0, a.alert - dt * 20);
    }

    if (a.state === "wander" || a.state === "alert") {
      a.state = a.alert > 15 ? "alert" : "wander";
      if (a.alert >= 100) {
        if (cfg.dangerous && dToPlayer < cfg.chargeTriggerDist) {
          a.state = "attack";
        } else {
          a.state = "flee";
          a.stateTimer = rand(3.5, 6);
        }
      }
    }

    if (a.state === "wander" || a.state === "alert") {
      a.stateTimer -= dt;
      if (!a.wanderTarget || a.stateTimer <= 0) {
        a.stateTimer = rand(2, 4.5);
        if (Math.random() < 0.25) {
          a.wanderTarget = null; // idle pause
        } else {
          const ang = rand(0, Math.PI * 2);
          const rdist = rand(80, 220);
          a.wanderTarget = {
            x: clamp(a.x + Math.cos(ang) * rdist, 40, WORLD_W - 40),
            y: clamp(a.y + Math.sin(ang) * rdist, 40, WORLD_H - 40)
          };
        }
      }
      if (a.wanderTarget) {
        const ang = angleTo(a.x, a.y, a.wanderTarget.x, a.wanderTarget.y);
        a.angle = ang;
        const spd = cfg.wanderSpeed * (a.state === "alert" ? 1.4 : 1);
        moveEntity(a, ang, spd * dt);
        if (dist(a.x, a.y, a.wanderTarget.x, a.wanderTarget.y) < 10) a.wanderTarget = null;
      }
    } else if (a.state === "flee") {
      const ang = angleTo(player.x, player.y, a.x, a.y);
      a.angle = ang;
      moveEntity(a, ang, cfg.fleeSpeed * dt);
      a.stateTimer -= dt;
      a.alert = Math.max(0, a.alert - dt * 10);
      if (a.stateTimer <= 0 && dToPlayer > cfg.detection * 1.2) {
        a.state = "wander";
        a.alert = 0;
      }
    } else if (a.state === "attack") {
      if (dToPlayer > cfg.giveUpDist) {
        a.state = "flee";
        a.stateTimer = 3;
      } else if (dToPlayer < 42) {
        a.attackTimer -= dt;
        if (a.attackTimer <= 0) {
          a.attackTimer = cfg.attackCooldown;
          player.health = Math.max(0, player.health - cfg.attackDamage);
          addFloat(player.x, player.y - 30, `-${cfg.attackDamage}`, "#ff4d4d");
          if (player.health <= 0) triggerGameOver(false);
        }
      } else {
        const ang = angleTo(a.x, a.y, player.x, player.y);
        a.angle = ang;
        moveEntity(a, ang, cfg.chargeSpeed * dt);
      }
    }

    // trap check for vulnerable species while wandering/alert
    if (cfg.trapVulnerable && (a.state === "wander" || a.state === "alert")) {
      for (const t of traps) {
        if (t.state !== "armed") continue;
        if (dist(a.x, a.y, t.x, t.y) < t.radius) {
          if (Math.random() < 0.7) {
            t.state = "triggered";
            t.caughtSpecies = a.species;
            a.state = "dead";
            a.deadTimer = 0.01;
          }
          break;
        }
      }
    }
  }

  function moveEntity(e, angle, dist_) {
    let nx = e.x + Math.cos(angle) * dist_;
    let ny = e.y + Math.sin(angle) * dist_;
    const blocker = treeBlocking(nx, ny, e.radius || e.cfg?.radius || 10);
    if (blocker) {
      // slide along tree
      nx = e.x; ny = e.y;
    }
    e.x = clamp(nx, 20, WORLD_W - 20);
    e.y = clamp(ny, 20, WORLD_H - 20);
  }

  // ---------- Update ----------
  function update(dt) {
    dt = Math.min(dt, 0.05);

    // stance
    const wantRun = keys["shift"] && player.stamina > 0;
    const wantSneak = keys["ctrl"] && !wantRun;
    player.stance = wantRun ? "run" : (wantSneak ? "sneak" : "normal");

    if (player.stance === "run") {
      player.stamina = Math.max(0, player.stamina - STAMINA_DRAIN * dt);
    } else {
      player.stamina = Math.min(STAMINA_MAX, player.stamina + STAMINA_REGEN * dt);
    }

    let mx = 0, my = 0;
    if (keys["w"] || keys["arrowup"]) my -= 1;
    if (keys["s"] || keys["arrowdown"]) my += 1;
    if (keys["a"] || keys["arrowleft"]) mx -= 1;
    if (keys["d"] || keys["arrowright"]) mx += 1;
    if (mx || my) {
      const len = Math.hypot(mx, my);
      mx /= len; my /= len;
      const mult = player.stance === "run" ? RUN_MULT : (player.stance === "sneak" ? SNEAK_MULT : 1);
      const speed = MOVE_SPEED * mult;
      let nx = player.x + mx * speed * dt;
      let ny = player.y + my * speed * dt;
      if (!treeBlocking(nx, player.y, 14)) player.x = clamp(nx, 20, WORLD_W - 20);
      if (!treeBlocking(player.x, ny, 14)) player.y = clamp(ny, 20, WORLD_H - 20);
    }

    // camera & aim
    camera.x = clamp(player.x - canvas.width / 2, 0, WORLD_W - canvas.width);
    camera.y = clamp(player.y - canvas.height / 2, 0, WORLD_H - canvas.height);
    mouse.wx = mouse.sx + camera.x;
    mouse.wy = mouse.sy + camera.y;
    player.angle = angleTo(player.x, player.y, mouse.wx, mouse.wy);

    if (player.shootCooldown > 0) player.shootCooldown -= dt;
    if (player.campCooldown > 0) player.campCooldown -= dt;
    if (mouse.down && player.weapon === "trap") handleShoot();

    if (player.reloading) {
      player.reloadTimer -= dt;
      if (player.reloadTimer <= 0) {
        player.reloading = false;
        const need = WEAPONS.rifle.magazine - player.ammo.bulletsInMag;
        const take = Math.min(need, player.ammo.bullets);
        player.ammo.bulletsInMag += take;
        player.ammo.bullets -= take;
      }
    }

    // animals
    for (let i = animals.length - 1; i >= 0; i--) {
      const a = animals[i];
      updateAnimal(a, dt);
      if (a.state === "dead" && a.deadTimer <= -1) animals.splice(i, 1);
    }

    // spawn
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnTimer = SPAWN_INTERVAL;
      for (const key in SPAWN_CAP) {
        const count = animals.filter(a => a.species === key && a.state !== "dead").length;
        if (count < SPAWN_CAP[key]) { spawnAnimal(key); break; }
      }
    }

    // projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += Math.cos(p.angle) * p.speed * dt;
      p.y += Math.sin(p.angle) * p.speed * dt;
      p.life -= dt;
      let hit = false;
      if (treeBlocking(p.x, p.y, 4)) hit = true;
      if (!hit) {
        for (const a of animals) {
          if (a.state === "dead") continue;
          if (dist(p.x, p.y, a.x, a.y) < (a.cfg.radius + 6)) {
            a.hp -= p.damage;
            a.alert = 100;
            addFloat(a.x, a.y - 20, `-${p.damage}`, "#fff");
            if (a.hp <= 0) {
              a.state = "dead";
              a.deadTimer = 1.2;
              awardCatch(a.cfg, a.x, a.y, false);
            } else if (a.cfg.dangerous) {
              a.state = "attack";
            } else {
              a.state = "flee";
              a.stateTimer = rand(3, 5);
            }
            hit = true;
            break;
          }
        }
      }
      if (hit || p.life <= 0 || p.x < 0 || p.y < 0 || p.x > WORLD_W || p.y > WORLD_H) {
        projectiles.splice(i, 1);
      }
    }

    // floats
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.y += f.vy * dt;
      f.life -= dt;
      if (f.life <= 0) floats.splice(i, 1);
    }

    updateHUD();
  }

  // ---------- HUD ----------
  const el = {
    health: document.getElementById("health-fill"),
    stamina: document.getElementById("stamina-fill"),
    stance: document.getElementById("stance-label"),
    weaponName: document.getElementById("weapon-name"),
    ammoCount: document.getElementById("ammo-count"),
    trapsCount: document.getElementById("traps-count"),
    score: document.getElementById("score"),
    coins: document.getElementById("coins"),
    interactHint: document.getElementById("interact-hint")
  };

  function updateHUD() {
    el.health.style.width = `${(player.health / player.maxHealth) * 100}%`;
    el.stamina.style.width = `${(player.stamina / STAMINA_MAX) * 100}%`;
    el.stamina.className = "bar-fill stamina" + (player.stance === "sneak" ? " sneak" : player.stance === "run" ? " run" : "");
    const stanceText = player.stance === "run" ? "جري 🏃 (صاخب)" : player.stance === "sneak" ? "تخفٍّ 🤫 (هادئ)" : "عادية 🚶";
    el.stance.textContent = `وضعية: ${stanceText}`;

    const w = WEAPONS[player.weapon];
    el.weaponName.textContent = `${w.icon} ${w.name}`;
    if (player.weapon === "rifle") {
      el.ammoCount.textContent = player.reloading
        ? `إعادة تعبئة...`
        : `الطلقات: ${player.ammo.bulletsInMag}/${player.ammo.bullets}`;
    } else if (player.weapon === "bow") {
      el.ammoCount.textContent = `السهام: ${player.ammo.arrows}`;
    } else {
      el.ammoCount.textContent = `جاهز للوضع`;
    }
    el.trapsCount.textContent = `الفخاخ: ${player.ammo.traps}`;
    el.score.textContent = `النقاط: ${player.score}`;
    el.coins.textContent = `🪙 ${player.coins}`;

    let hint = "";
    let near = false;
    for (const t of traps) {
      if (dist(player.x, player.y, t.x, t.y) < 60) {
        near = true;
        hint = t.state === "triggered" ? "اضغط E لجمع الفخ (يوجد صيد!)" : "اضغط E لجمع الفخ";
        break;
      }
    }
    if (!near && dist(player.x, player.y, CAMP.x, CAMP.y) < CAMP.radius) {
      near = true;
      hint = player.campCooldown > 0 ? `المخيم: انتظر ${Math.ceil(player.campCooldown)} ث` : "اضغط E للتزود بالكامل";
    }
    el.interactHint.classList.toggle("hidden", !near);
    if (near) el.interactHint.textContent = hint;
  }

  // ---------- Draw ----------
  function worldToScreen(x, y) { return [x - camera.x, y - camera.y]; }

  let grassPattern = null;
  function buildGrassPattern() {
    const pc = document.createElement("canvas");
    pc.width = 64; pc.height = 64;
    const pctx = pc.getContext("2d");
    pctx.fillStyle = "#3d6136";
    pctx.fillRect(0, 0, 64, 64);
    pctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let i = 0; i < 40; i++) {
      pctx.fillRect(Math.random() * 64, Math.random() * 64, 2, 2);
    }
    pctx.strokeStyle = "rgba(0,0,0,0.06)";
    for (let i = 0; i < 8; i++) {
      pctx.beginPath();
      const x = Math.random() * 64, y = Math.random() * 64;
      pctx.moveTo(x, y);
      pctx.lineTo(x + rand(-4, 4), y - rand(4, 9));
      pctx.stroke();
    }
    grassPattern = ctx.createPattern(pc, "repeat");
  }

  function draw() {
    ctx.fillStyle = grassPattern || "#3a5a34";
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    ctx.fillRect(camera.x, camera.y, canvas.width, canvas.height);

    // world border
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, WORLD_W, WORLD_H);

    // camp
    ctx.beginPath();
    ctx.fillStyle = "rgba(210,170,90,0.25)";
    ctx.arc(CAMP.x, CAMP.y, CAMP.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⛺", CAMP.x, CAMP.y);

    // trees
    for (const t of trees) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.ellipse(t.x, t.y + t.r * 0.6, t.r * 0.9, t.r * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = "#2d4a26";
      ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = "#24391f";
      ctx.arc(t.x - t.r * 0.25, t.y - t.r * 0.2, t.r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }

    // traps
    for (const t of traps) {
      ctx.beginPath();
      ctx.strokeStyle = t.state === "triggered" ? "#e74c3c" : "#d4c48a";
      ctx.lineWidth = 3;
      ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = "18px sans-serif";
      ctx.fillText(t.state === "triggered" ? "🎯" : "🪤", t.x, t.y);
    }

    // animals
    for (const a of animals) {
      if (a.state === "dead" && a.deadTimer < -1) continue;
      const cfg = a.cfg;
      const fade = a.state === "dead" ? clamp(a.deadTimer, 0, 1) : 1;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.beginPath();
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.ellipse(a.x, a.y + cfg.radius * 0.6, cfg.radius, cfg.radius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${cfg.radius * 2.2}px sans-serif`;
      ctx.save();
      ctx.translate(a.x, a.y);
      if (a.state === "dead") ctx.rotate(Math.PI / 2);
      ctx.fillText(cfg.emoji, 0, 0);
      ctx.restore();

      if (a.state !== "dead") {
        // alert indicator
        if (a.alert > 15 && a.alert < 100) {
          ctx.font = "16px sans-serif";
          ctx.fillStyle = "#f1c40f";
          ctx.fillText("?", a.x, a.y - cfg.radius - 14);
        } else if (a.state === "flee") {
          ctx.font = "16px sans-serif";
          ctx.fillStyle = "#e67e22";
          ctx.fillText("!", a.x, a.y - cfg.radius - 14);
        } else if (a.state === "attack") {
          ctx.font = "18px sans-serif";
          ctx.fillStyle = "#e74c3c";
          ctx.fillText("!!!", a.x, a.y - cfg.radius - 14);
        }
        // hp bar for damaged animals
        if (a.hp < cfg.hp) {
          const w = cfg.radius * 2;
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(a.x - w / 2, a.y - cfg.radius - 10, w, 5);
          ctx.fillStyle = "#e74c3c";
          ctx.fillRect(a.x - w / 2, a.y - cfg.radius - 10, w * (a.hp / cfg.hp), 5);
        }
      }
      ctx.restore();
    }

    // projectiles
    for (const p of projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.strokeStyle = p.weapon === "rifle" ? "#f1c40f" : "#eee";
      ctx.lineWidth = p.weapon === "rifle" ? 2 : 3;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
      ctx.restore();
    }

    // player
    {
      const stanceColor = player.stance === "sneak" ? "#2ecc71" : player.stance === "run" ? "#f1c40f" : "#3498db";
      ctx.save();
      ctx.translate(player.x, player.y);
      // noise/vision ring
      ctx.beginPath();
      ctx.strokeStyle = stanceColor + "55";
      ctx.lineWidth = 2;
      ctx.arc(0, 0, player.stance === "sneak" ? 40 : player.stance === "run" ? 90 : 65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.rotate(player.angle);
      ctx.beginPath();
      ctx.fillStyle = stanceColor;
      ctx.moveTo(16, 0);
      ctx.lineTo(-12, 10);
      ctx.lineTo(-12, -10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // floating texts
    for (const f of floats) {
      ctx.save();
      ctx.globalAlpha = clamp(f.life, 0, 1);
      ctx.fillStyle = f.color;
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }

    ctx.restore();

    // compass to camp (screen-space)
    drawCompass();
  }

  function drawCompass() {
    const d = dist(player.x, player.y, CAMP.x, CAMP.y);
    if (d < CAMP.radius + 40) return;
    const ang = angleTo(player.x, player.y, CAMP.x, CAMP.y);
    const cx = canvas.width - 46, cy = canvas.height - 46;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(ang);
    ctx.fillStyle = "#ffd479";
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-10, 8);
    ctx.lineTo(-10, -8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#fff";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("المخيم", cx, cy + 44);
  }

  // ---------- Loop ----------
  function loop(ts) {
    requestAnimationFrame(loop);
    if (state !== "playing") { lastTime = ts; return; }
    const dt = (ts - lastTime) / 1000;
    lastTime = ts;
    update(dt);
    draw();
  }

  // ---------- Lifecycle ----------
  function triggerGameOver(escaped) {
    state = "gameover";
    document.getElementById("gameOverTitle").textContent = escaped ? "عدت سالمًا إلى المخيم" : "أصابك الحيوان... انتهت الرحلة";
    document.getElementById("gameOverStats").textContent =
      `النقاط: ${player.score} — العملات: ${player.coins}`;
    document.getElementById("gameOverScreen").classList.remove("hidden");
  }

  function resetGame() {
    player.x = CAMP.x; player.y = CAMP.y;
    player.health = player.maxHealth;
    player.stamina = STAMINA_MAX;
    player.weapon = "bow";
    player.ammo = { arrows: 10, bullets: 18, bulletsInMag: 6, traps: 5 };
    player.score = 0; player.coins = 0;
    player.shootCooldown = 0; player.reloading = false; player.campCooldown = 0;
    player.firstCatch = {};
    traps.length = 0; projectiles.length = 0; floats.length = 0;
    genTrees();
    initialSpawns();
    if (!grassPattern) buildGrassPattern();
    spawnTimer = SPAWN_INTERVAL;
  }

  function startGame() {
    resetGame();
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("hud").classList.remove("hidden");
    state = "playing";
    lastTime = performance.now();
  }

  document.getElementById("startBtn").addEventListener("click", startGame);
  document.getElementById("restartBtn").addEventListener("click", startGame);
  document.getElementById("resumeBtn").addEventListener("click", togglePause);

  buildGrassPattern();
  requestAnimationFrame(loop);
})();
