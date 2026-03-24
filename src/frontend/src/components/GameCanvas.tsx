import { useCallback, useEffect, useRef, useState } from "react";

export type GameMode = "survival" | "mission" | "sandbox";

interface GameCanvasProps {
  mode: GameMode;
  onExit: () => void;
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Vec2 {
  x: number;
  y: number;
}
interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  piercing: boolean;
  fromPlayer: boolean;
  radius: number;
  life: number;
}
interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
}
interface AmmoPickup {
  x: number;
  y: number;
  type: WeaponType;
  amount: number;
  life: number;
}
interface HealthPickup {
  x: number;
  y: number;
  amount: number;
  life: number;
}
interface Wall {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}
type WeaponType = "pistol" | "rifle" | "shotgun" | "sniper";
interface Weapon {
  name: string;
  type: WeaponType;
  damage: number;
  fireRate: number;
  ammo: number;
  maxAmmo: number;
  reloadTime: number;
  reloading: number;
  spread: number;
  bulletCount: number;
  piercing: boolean;
  bulletSpeed: number;
}
type EnemyState = "patrol" | "chase" | "attack";
interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  state: EnemyState;
  angle: number;
  fireCooldown: number;
  patrolTarget: Vec2;
  isBoss: boolean;
  id: number;
  flashTimer: number;
}
interface GameState {
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    hp: number;
    maxHp: number;
    angle: number;
    weapons: Weapon[];
    weaponIndex: number;
    invincible: number;
  };
  enemies: Enemy[];
  bullets: Bullet[];
  explosions: Explosion[];
  ammoPickups: AmmoPickup[];
  healthPickups: HealthPickup[];
  walls: Wall[];
  score: number;
  wave: number;
  waveTimer: number;
  waveBreak: boolean;
  waveBreakTimer: number;
  gameOver: boolean;
  victory: boolean;
  missionIndex: number;
  missionTimer: number;
  missionObjective: string;
  missionComplete: boolean;
  extractPoint: { x: number; y: number; radius: number } | null;
  holdZone: { x: number; y: number; radius: number } | null;
  lastTime: number;
  mouseX: number;
  mouseY: number;
  keys: Set<string>;
  mouseDown: boolean;
  fireCooldown: number;
  enemyIdCounter: number;
  spawnTimer: number;
  cameraX: number;
  cameraY: number;
  holdTimer: number;
  surviveTimer: number;
  killCount: number;
}

const WORLD_W = 2000;
const WORLD_H = 2000;
const PLAYER_SPEED = 220;
const PLAYER_SIZE = 14;
const ENEMY_SIZE = 13;

function makeWeapons(unlimited = false): Weapon[] {
  return [
    {
      name: "PISTOL",
      type: "pistol",
      damage: 25,
      fireRate: 0.4,
      ammo: 999,
      maxAmmo: 999,
      reloadTime: 1.2,
      reloading: 0,
      spread: 0.05,
      bulletCount: 1,
      piercing: false,
      bulletSpeed: 550,
    },
    {
      name: "ASSAULT RIFLE",
      type: "rifle",
      damage: 15,
      fireRate: 0.1,
      ammo: unlimited ? 9999 : 30,
      maxAmmo: 30,
      reloadTime: 2.0,
      reloading: 0,
      spread: 0.08,
      bulletCount: 1,
      piercing: false,
      bulletSpeed: 700,
    },
    {
      name: "SHOTGUN",
      type: "shotgun",
      damage: 35,
      fireRate: 0.9,
      ammo: unlimited ? 9999 : 8,
      maxAmmo: 8,
      reloadTime: 2.5,
      reloading: 0,
      spread: 0.25,
      bulletCount: 6,
      piercing: false,
      bulletSpeed: 500,
    },
    {
      name: "SNIPER",
      type: "sniper",
      damage: 90,
      fireRate: 1.5,
      ammo: unlimited ? 9999 : 5,
      maxAmmo: 5,
      reloadTime: 3.0,
      reloading: 0,
      spread: 0.01,
      bulletCount: 1,
      piercing: true,
      bulletSpeed: 1200,
    },
  ];
}

function makeMilitaryWalls(): Wall[] {
  const walls: Wall[] = [];
  // Border
  walls.push({ x: 0, y: 0, w: WORLD_W, h: 30, color: "#3a3a2a" });
  walls.push({ x: 0, y: WORLD_H - 30, w: WORLD_W, h: 30, color: "#3a3a2a" });
  walls.push({ x: 0, y: 0, w: 30, h: WORLD_H, color: "#3a3a2a" });
  walls.push({ x: WORLD_W - 30, y: 0, w: 30, h: WORLD_H, color: "#3a3a2a" });
  // Buildings
  walls.push({ x: 150, y: 150, w: 200, h: 120, color: "#4a4a3a" });
  walls.push({ x: 500, y: 200, w: 30, h: 200, color: "#5a5a4a" });
  walls.push({ x: 600, y: 150, w: 150, h: 30, color: "#4a4a3a" });
  walls.push({ x: 600, y: 300, w: 150, h: 30, color: "#4a4a3a" });
  walls.push({ x: 800, y: 100, w: 250, h: 200, color: "#3d4a3a" });
  walls.push({ x: 1100, y: 150, w: 180, h: 30, color: "#4a4a3a" });
  walls.push({ x: 1100, y: 300, w: 30, h: 150, color: "#4a4a3a" });
  walls.push({ x: 1350, y: 150, w: 200, h: 150, color: "#4a4a3a" });
  walls.push({ x: 200, y: 500, w: 30, h: 300, color: "#5a5a4a" });
  walls.push({ x: 400, y: 500, w: 200, h: 30, color: "#4a4a3a" });
  walls.push({ x: 400, y: 700, w: 200, h: 30, color: "#4a4a3a" });
  walls.push({ x: 700, y: 600, w: 300, h: 30, color: "#3d4a3a" });
  walls.push({ x: 700, y: 500, w: 30, h: 130, color: "#4a4a3a" });
  walls.push({ x: 1000, y: 500, w: 250, h: 200, color: "#4a4a3a" });
  walls.push({ x: 1350, y: 450, w: 30, h: 250, color: "#5a5a4a" });
  walls.push({ x: 1500, y: 500, w: 200, h: 30, color: "#4a4a3a" });
  walls.push({ x: 1700, y: 400, w: 200, h: 200, color: "#3d4a3a" });
  walls.push({ x: 200, y: 900, w: 350, h: 150, color: "#4a4a3a" });
  walls.push({ x: 650, y: 850, w: 30, h: 200, color: "#5a5a4a" });
  walls.push({ x: 750, y: 900, w: 200, h: 30, color: "#4a4a3a" });
  walls.push({ x: 1100, y: 800, w: 200, h: 200, color: "#3d4a3a" });
  walls.push({ x: 1400, y: 900, w: 250, h: 30, color: "#4a4a3a" });
  walls.push({ x: 1650, y: 800, w: 30, h: 250, color: "#5a5a4a" });
  walls.push({ x: 1750, y: 850, w: 200, h: 150, color: "#4a4a3a" });
  walls.push({ x: 200, y: 1200, w: 30, h: 350, color: "#4a4a3a" });
  walls.push({ x: 350, y: 1300, w: 300, h: 30, color: "#4a4a3a" });
  walls.push({ x: 750, y: 1200, w: 200, h: 200, color: "#3d4a3a" });
  walls.push({ x: 1050, y: 1100, w: 30, h: 300, color: "#5a5a4a" });
  walls.push({ x: 1200, y: 1200, w: 350, h: 30, color: "#4a4a3a" });
  walls.push({ x: 1600, y: 1150, w: 250, h: 200, color: "#4a4a3a" });
  walls.push({ x: 300, y: 1600, w: 400, h: 150, color: "#3d4a3a" });
  walls.push({ x: 800, y: 1600, w: 30, h: 250, color: "#5a5a4a" });
  walls.push({ x: 950, y: 1700, w: 250, h: 30, color: "#4a4a3a" });
  walls.push({ x: 1300, y: 1600, w: 300, h: 30, color: "#4a4a3a" });
  walls.push({ x: 1700, y: 1500, w: 200, h: 300, color: "#4a4a3a" });
  // Sandbags (small)
  walls.push({ x: 470, y: 340, w: 60, h: 20, color: "#7a6a4a" });
  walls.push({ x: 620, y: 450, w: 20, h: 60, color: "#7a6a4a" });
  walls.push({ x: 900, y: 420, w: 60, h: 20, color: "#7a6a4a" });
  walls.push({ x: 1180, y: 430, w: 20, h: 60, color: "#7a6a4a" });
  walls.push({ x: 1450, y: 320, w: 60, h: 20, color: "#7a6a4a" });
  walls.push({ x: 330, y: 750, w: 60, h: 20, color: "#7a6a4a" });
  walls.push({ x: 870, y: 680, w: 20, h: 60, color: "#7a6a4a" });
  walls.push({ x: 1120, y: 720, w: 60, h: 20, color: "#7a6a4a" });
  walls.push({ x: 1560, y: 680, w: 20, h: 60, color: "#7a6a4a" });
  walls.push({ x: 420, y: 1050, w: 60, h: 20, color: "#7a6a4a" });
  walls.push({ x: 680, y: 1120, w: 20, h: 60, color: "#7a6a4a" });
  walls.push({ x: 920, y: 1050, w: 60, h: 20, color: "#7a6a4a" });
  walls.push({ x: 1380, y: 1080, w: 20, h: 60, color: "#7a6a4a" });
  walls.push({ x: 1820, y: 1100, w: 60, h: 20, color: "#7a6a4a" });
  walls.push({ x: 520, y: 1480, w: 60, h: 20, color: "#7a6a4a" });
  walls.push({ x: 1050, y: 1450, w: 20, h: 60, color: "#7a6a4a" });
  walls.push({ x: 1580, y: 1420, w: 60, h: 20, color: "#7a6a4a" });
  return walls;
}

function rectsOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function circleRect(
  cx: number,
  cy: number,
  cr: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
) {
  const nearX = Math.max(rx, Math.min(cx, rx + rw));
  const nearY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nearX;
  const dy = cy - nearY;
  return dx * dx + dy * dy < cr * cr;
}

function spawnEnemy(
  gs: GameState,
  x?: number,
  y?: number,
  isBoss = false,
): Enemy {
  let ex = x ?? Math.random() * (WORLD_W - 200) + 100;
  let ey = y ?? Math.random() * (WORLD_H - 200) + 100;
  // ensure not on wall
  let tries = 0;
  while (
    tries < 20 &&
    gs.walls.some((w) =>
      rectsOverlap(ex - 15, ey - 15, 30, 30, w.x, w.y, w.w, w.h),
    )
  ) {
    ex = Math.random() * (WORLD_W - 200) + 100;
    ey = Math.random() * (WORLD_H - 200) + 100;
    tries++;
  }
  return {
    x: ex,
    y: ey,
    vx: 0,
    vy: 0,
    hp: isBoss ? 200 : 50,
    maxHp: isBoss ? 200 : 50,
    state: "patrol",
    angle: Math.random() * Math.PI * 2,
    fireCooldown: Math.random() * 2,
    patrolTarget: {
      x: ex + (Math.random() - 0.5) * 300,
      y: ey + (Math.random() - 0.5) * 300,
    },
    isBoss,
    id: gs.enemyIdCounter++,
    flashTimer: 0,
  };
}

function getMissionConfig(idx: number): {
  objective: string;
  extractPoint: GameState["extractPoint"];
  holdZone: GameState["holdZone"];
} {
  switch (idx) {
    case 0:
      return {
        objective: "ELIMINATE 10 ENEMIES",
        extractPoint: null,
        holdZone: null,
      };
    case 1:
      return {
        objective: "SURVIVE 60 SECONDS",
        extractPoint: null,
        holdZone: null,
      };
    case 2:
      return {
        objective: "REACH EXTRACTION POINT",
        extractPoint: { x: 1800, y: 1800, radius: 60 },
        holdZone: null,
      };
    case 3:
      return {
        objective: "ELIMINATE THE COMMANDER",
        extractPoint: null,
        holdZone: null,
      };
    case 4:
      return {
        objective: "HOLD THE BASE FOR 90 SECONDS",
        extractPoint: null,
        holdZone: { x: 1000, y: 1000, radius: 100 },
      };
    default:
      return {
        objective: "MISSION COMPLETE",
        extractPoint: null,
        holdZone: null,
      };
  }
}

function initGameState(mode: GameMode): GameState {
  const unlimited = mode === "sandbox";
  const walls = makeMilitaryWalls();
  const mCfg =
    mode === "mission"
      ? getMissionConfig(0)
      : {
          objective: "",
          extractPoint: null as GameState["extractPoint"],
          holdZone: null as GameState["holdZone"],
        };
  const gs: GameState = {
    player: {
      x: 1000,
      y: 1000,
      vx: 0,
      vy: 0,
      hp: 100,
      maxHp: 100,
      angle: 0,
      weapons: makeWeapons(unlimited),
      weaponIndex: 0,
      invincible: 0,
    },
    enemies: [],
    bullets: [],
    explosions: [],
    ammoPickups: [],
    healthPickups: [],
    walls,
    score: 0,
    wave: 1,
    waveTimer: 0,
    waveBreak: false,
    waveBreakTimer: 0,
    gameOver: false,
    victory: false,
    missionIndex: 0,
    missionTimer: 0,
    missionObjective: mCfg.objective,
    missionComplete: false,
    extractPoint: mCfg.extractPoint,
    holdZone: mCfg.holdZone,
    lastTime: 0,
    mouseX: 0,
    mouseY: 0,
    keys: new Set(),
    mouseDown: false,
    fireCooldown: 0,
    enemyIdCounter: 0,
    spawnTimer: 0,
    cameraX: 0,
    cameraY: 0,
    holdTimer: 0,
    surviveTimer: 0,
    killCount: 0,
  };
  // spawn initial enemies
  if (mode === "survival") {
    for (let i = 0; i < 5; i++) gs.enemies.push(spawnEnemy(gs));
  } else if (mode === "mission") {
    for (let i = 0; i < 6; i++) gs.enemies.push(spawnEnemy(gs));
  }
  return gs;
}

function updateGame(
  gs: GameState,
  dt: number,
  mode: GameMode,
  canvasW: number,
  canvasH: number,
) {
  if (gs.gameOver || gs.victory) return;

  const p = gs.player;
  // Camera
  gs.cameraX = Math.max(0, Math.min(WORLD_W - canvasW, p.x - canvasW / 2));
  gs.cameraY = Math.max(0, Math.min(WORLD_H - canvasH, p.y - canvasH / 2));

  // Player angle toward mouse
  const screenPX = p.x - gs.cameraX;
  const screenPY = p.y - gs.cameraY;
  p.angle = Math.atan2(gs.mouseY - screenPY, gs.mouseX - screenPX);

  // Movement
  let mvx = 0;
  let mvy = 0;
  if (gs.keys.has("w") || gs.keys.has("arrowup")) mvy -= 1;
  if (gs.keys.has("s") || gs.keys.has("arrowdown")) mvy += 1;
  if (gs.keys.has("a") || gs.keys.has("arrowleft")) mvx -= 1;
  if (gs.keys.has("d") || gs.keys.has("arrowright")) mvx += 1;
  if (mvx !== 0 && mvy !== 0) {
    mvx *= Math.SQRT1_2;
    mvy *= Math.SQRT1_2;
  }
  const spd = PLAYER_SPEED * dt;
  let nx = p.x + mvx * spd;
  let ny = p.y + mvy * spd;
  // wall collision
  const pr = PLAYER_SIZE;
  let blocked = false;
  for (const w of gs.walls) {
    if (circleRect(nx, p.y, pr, w.x, w.y, w.w, w.h)) {
      nx = p.x;
      blocked = true;
    }
    if (circleRect(p.x, ny, pr, w.x, w.y, w.w, w.h)) {
      ny = p.y;
      blocked = true;
    }
  }
  _ = blocked;
  p.x = Math.max(pr, Math.min(WORLD_W - pr, nx));
  p.y = Math.max(pr, Math.min(WORLD_H - pr, ny));
  if (p.invincible > 0) p.invincible -= dt;

  // Weapon selection
  // (handled by key events outside loop)

  // Firing
  const wep = p.weapons[p.weaponIndex];
  if (wep.reloading > 0) {
    wep.reloading -= dt;
    if (wep.reloading <= 0) {
      wep.reloading = 0;
      wep.ammo = mode === "sandbox" ? 9999 : wep.maxAmmo;
    }
  }
  if (gs.fireCooldown > 0) gs.fireCooldown -= dt;
  if (
    gs.mouseDown &&
    gs.fireCooldown <= 0 &&
    wep.reloading === 0 &&
    wep.ammo > 0
  ) {
    for (let b = 0; b < wep.bulletCount; b++) {
      const angle = p.angle + (Math.random() - 0.5) * wep.spread * 2;
      gs.bullets.push({
        x: p.x + Math.cos(p.angle) * 20,
        y: p.y + Math.sin(p.angle) * 20,
        vx: Math.cos(angle) * wep.bulletSpeed,
        vy: Math.sin(angle) * wep.bulletSpeed,
        damage: wep.damage,
        piercing: wep.piercing,
        fromPlayer: true,
        radius: wep.type === "sniper" ? 4 : wep.type === "shotgun" ? 3 : 3,
        life: 1.5,
      });
    }
    if (wep.type !== "pistol") wep.ammo--;
    if (wep.ammo === 0 && mode !== "sandbox") {
      wep.reloading = wep.reloadTime;
    }
    gs.fireCooldown = wep.fireRate;
  }

  // Update bullets
  gs.bullets = gs.bullets.filter((b) => {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0) return false;
    if (b.x < 0 || b.x > WORLD_W || b.y < 0 || b.y > WORLD_H) return false;
    // wall collision
    for (const w of gs.walls) {
      if (circleRect(b.x, b.y, b.radius, w.x, w.y, w.w, w.h)) {
        gs.explosions.push({
          x: b.x,
          y: b.y,
          radius: 3,
          maxRadius: 8,
          life: 0.15,
          maxLife: 0.15,
        });
        return false;
      }
    }
    // player hit
    if (!b.fromPlayer && p.invincible <= 0) {
      const dx = b.x - p.x;
      const dy = b.y - p.y;
      if (dx * dx + dy * dy < (b.radius + pr) * (b.radius + pr)) {
        p.hp -= b.damage;
        p.invincible = 0.4;
        if (p.hp <= 0) {
          p.hp = 0;
          gs.gameOver = true;
        }
        return false;
      }
    }
    // enemy hit
    if (b.fromPlayer) {
      let hit = false;
      for (const e of gs.enemies) {
        const dx = b.x - e.x;
        const dy = b.y - e.y;
        if (
          dx * dx + dy * dy <
          (b.radius + ENEMY_SIZE) * (b.radius + ENEMY_SIZE)
        ) {
          e.hp -= b.damage;
          e.flashTimer = 0.1;
          gs.explosions.push({
            x: b.x,
            y: b.y,
            radius: 4,
            maxRadius: 12,
            life: 0.2,
            maxLife: 0.2,
          });
          if (!b.piercing) hit = true;
          break;
        }
      }
      if (hit) return false;
    }
    return true;
  });

  // Kill dead enemies
  const before = gs.enemies.length;
  gs.enemies = gs.enemies.filter((e) => {
    if (e.hp <= 0) {
      gs.score += e.isBoss ? 50 : 10;
      gs.killCount++;
      gs.explosions.push({
        x: e.x,
        y: e.y,
        radius: 10,
        maxRadius: e.isBoss ? 60 : 30,
        life: 0.5,
        maxLife: 0.5,
      });
      // drop ammo
      if (Math.random() < 0.4) {
        const types: WeaponType[] = ["rifle", "shotgun", "sniper"];
        gs.ammoPickups.push({
          x: e.x,
          y: e.y,
          type: types[Math.floor(Math.random() * types.length)],
          amount: 10,
          life: 15,
        });
      }
      if (Math.random() < 0.15) {
        gs.healthPickups.push({ x: e.x, y: e.y, amount: 25, life: 15 });
      }
      return false;
    }
    return true;
  });
  const killed = before - gs.enemies.length;
  _ = killed;

  // Enemy AI
  for (const e of gs.enemies) {
    const dxp = p.x - e.x;
    const dyp = p.y - e.y;
    const distToPlayer = Math.sqrt(dxp * dxp + dyp * dyp);
    if (distToPlayer < 200) e.state = distToPlayer < 100 ? "attack" : "chase";
    else e.state = "patrol";

    const waveMultiplier = mode === "survival" ? 1 + (gs.wave - 1) * 0.15 : 1;
    const speed = (e.isBoss ? 95 : 75) * waveMultiplier;

    if (e.state === "patrol") {
      const dtx = e.patrolTarget.x - e.x;
      const dty = e.patrolTarget.y - e.y;
      const d = Math.sqrt(dtx * dtx + dty * dty);
      if (d < 10)
        e.patrolTarget = {
          x: e.x + (Math.random() - 0.5) * 400,
          y: e.y + (Math.random() - 0.5) * 400,
        };
      else {
        e.vx = (dtx / d) * speed * 0.5;
        e.vy = (dty / d) * speed * 0.5;
      }
    } else if (e.state === "chase" || e.state === "attack") {
      const d = distToPlayer;
      e.angle = Math.atan2(dyp, dxp);
      if (d > 80) {
        e.vx = (dxp / d) * speed;
        e.vy = (dyp / d) * speed;
      } else {
        e.vx = 0;
        e.vy = 0;
      }
    }

    // contact damage
    if (distToPlayer < PLAYER_SIZE + ENEMY_SIZE && p.invincible <= 0) {
      p.hp -= 10 * dt * 60 * 0.016;
      p.invincible = 0.05;
      if (p.hp <= 0) {
        p.hp = 0;
        gs.gameOver = true;
      }
    }

    // enemy shooting
    if (e.state === "attack") {
      e.fireCooldown -= dt;
      if (e.fireCooldown <= 0) {
        const angle = e.angle + (Math.random() - 0.5) * 0.3;
        gs.bullets.push({
          x: e.x + Math.cos(e.angle) * 18,
          y: e.y + Math.sin(e.angle) * 18,
          vx: Math.cos(angle) * 380,
          vy: Math.sin(angle) * 380,
          damage: e.isBoss ? 20 : 10,
          piercing: false,
          fromPlayer: false,
          radius: 3,
          life: 1.5,
        });
        e.fireCooldown = e.isBoss ? 0.6 : 1.2;
      }
    }

    // move enemy with wall collision
    let ex = e.x + e.vx * dt;
    let ey = e.y + e.vy * dt;
    for (const w of gs.walls) {
      if (circleRect(ex, e.y, ENEMY_SIZE, w.x, w.y, w.w, w.h)) {
        ex = e.x;
        e.vx *= -0.5;
      }
      if (circleRect(e.x, ey, ENEMY_SIZE, w.x, w.y, w.w, w.h)) {
        ey = e.y;
        e.vy *= -0.5;
      }
    }
    e.x = Math.max(ENEMY_SIZE, Math.min(WORLD_W - ENEMY_SIZE, ex));
    e.y = Math.max(ENEMY_SIZE, Math.min(WORLD_H - ENEMY_SIZE, ey));
    if (e.flashTimer > 0) e.flashTimer -= dt;
  }

  // Explosions
  gs.explosions = gs.explosions.filter((ex) => {
    ex.life -= dt;
    ex.radius = ex.maxRadius * (1 - ex.life / ex.maxLife);
    return ex.life > 0;
  });

  // Pickups
  gs.ammoPickups = gs.ammoPickups.filter((pk) => {
    pk.life -= dt;
    if (pk.life <= 0) return false;
    const dx = pk.x - p.x;
    const dy = pk.y - p.y;
    if (dx * dx + dy * dy < 25 * 25) {
      const wep2 = p.weapons.find((w) => w.type === pk.type);
      if (wep2) {
        wep2.ammo = Math.min(wep2.maxAmmo, wep2.ammo + pk.amount);
      }
      return false;
    }
    return true;
  });
  gs.healthPickups = gs.healthPickups.filter((pk) => {
    pk.life -= dt;
    if (pk.life <= 0) return false;
    const dx = pk.x - p.x;
    const dy = pk.y - p.y;
    if (dx * dx + dy * dy < 25 * 25) {
      p.hp = Math.min(p.maxHp, p.hp + pk.amount);
      return false;
    }
    return true;
  });

  // Mode-specific logic
  if (mode === "survival") {
    gs.waveTimer += dt;
    if (gs.waveBreak) {
      gs.waveBreakTimer -= dt;
      if (gs.waveBreakTimer <= 0) {
        gs.waveBreak = false;
        gs.wave++;
        const count = 5 + (gs.wave - 1) * 3;
        for (let i = 0; i < count; i++) gs.enemies.push(spawnEnemy(gs));
        // spawn pickups
        for (let i = 0; i < 3; i++) {
          gs.healthPickups.push({
            x: 200 + Math.random() * 1600,
            y: 200 + Math.random() * 1600,
            amount: 30,
            life: 30,
          });
          const types2: WeaponType[] = ["rifle", "shotgun", "sniper"];
          gs.ammoPickups.push({
            x: 200 + Math.random() * 1600,
            y: 200 + Math.random() * 1600,
            type: types2[Math.floor(Math.random() * 3)],
            amount: 15,
            life: 30,
          });
        }
      }
    } else if (gs.enemies.length === 0 && !gs.waveBreak) {
      gs.score += gs.wave * 50;
      gs.waveBreak = true;
      gs.waveBreakTimer = 5;
    }
  } else if (mode === "mission") {
    gs.missionTimer += dt;
    gs.spawnTimer += dt;
    // continuous respawn for mission
    if (gs.spawnTimer > 4 && gs.enemies.length < 8) {
      gs.enemies.push(spawnEnemy(gs));
      gs.spawnTimer = 0;
    }
    const cfg = getMissionConfig(gs.missionIndex);
    let completed = false;
    if (gs.missionIndex === 0) completed = gs.killCount >= 10;
    else if (gs.missionIndex === 1) {
      gs.surviveTimer += dt;
      completed = gs.surviveTimer >= 60;
    } else if (gs.missionIndex === 2 && gs.extractPoint) {
      const dx = p.x - gs.extractPoint.x;
      const dy = p.y - gs.extractPoint.y;
      completed =
        dx * dx + dy * dy < gs.extractPoint.radius * gs.extractPoint.radius;
    } else if (gs.missionIndex === 3) {
      // boss already spawned? if not, spawn it
      if (!gs.enemies.some((e) => e.isBoss) && gs.enemies.length < 3) {
        gs.enemies.push(spawnEnemy(gs, undefined, undefined, true));
      }
      completed = gs.killCount >= 1 && !gs.enemies.some((e) => e.isBoss);
    } else if (gs.missionIndex === 4 && gs.holdZone) {
      const dx = p.x - gs.holdZone.x;
      const dy = p.y - gs.holdZone.y;
      if (dx * dx + dy * dy < gs.holdZone.radius * gs.holdZone.radius) {
        gs.holdTimer += dt;
      }
      completed = gs.holdTimer >= 90;
    }
    _ = cfg;
    if (completed && !gs.missionComplete) {
      if (gs.missionIndex < 4) {
        gs.missionIndex++;
        gs.killCount = 0;
        gs.surviveTimer = 0;
        gs.holdTimer = 0;
        gs.missionTimer = 0;
        const newCfg = getMissionConfig(gs.missionIndex);
        gs.missionObjective = newCfg.objective;
        gs.extractPoint = newCfg.extractPoint;
        gs.holdZone = newCfg.holdZone;
        gs.enemies = [];
        for (let i = 0; i < 6; i++) gs.enemies.push(spawnEnemy(gs));
        if (gs.missionIndex === 3) {
          gs.enemies = [spawnEnemy(gs, undefined, undefined, true)];
          for (let i = 0; i < 3; i++) gs.enemies.push(spawnEnemy(gs));
        }
      } else {
        gs.missionComplete = true;
        gs.victory = true;
      }
    }
  } else if (mode === "sandbox") {
    // Nothing auto-spawns; handled by key events
  }
}

let _: unknown; // discard

function renderGame(
  ctx: CanvasRenderingContext2D,
  gs: GameState,
  mode: GameMode,
  canvasW: number,
  canvasH: number,
) {
  const cx = gs.cameraX;
  const cy = gs.cameraY;
  ctx.clearRect(0, 0, canvasW, canvasH);

  // Ground
  ctx.fillStyle = "#1a2a1a";
  ctx.fillRect(0, 0, canvasW, canvasH);
  // Ground texture grid
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1;
  const gridSize = 60;
  const startX = -(cx % gridSize);
  const startY = -(cy % gridSize);
  for (let gx = startX; gx < canvasW; gx += gridSize) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, canvasH);
    ctx.stroke();
  }
  for (let gy = startY; gy < canvasH; gy += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(canvasW, gy);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(-cx, -cy);

  // Extract/Hold zones
  if (gs.extractPoint) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#4aff4a";
    ctx.beginPath();
    ctx.arc(
      gs.extractPoint.x,
      gs.extractPoint.y,
      gs.extractPoint.radius,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "#6fff6f";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#6fff6f";
    ctx.font = "bold 14px 'Barlow Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "EXTRACTION",
      gs.extractPoint.x,
      gs.extractPoint.y - gs.extractPoint.radius - 8,
    );
    ctx.restore();
  }
  if (gs.holdZone) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#4a9fff";
    ctx.beginPath();
    ctx.arc(gs.holdZone.x, gs.holdZone.y, gs.holdZone.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6fbfff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#6fbfff";
    ctx.font = "bold 14px 'Barlow Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "HOLD ZONE",
      gs.holdZone.x,
      gs.holdZone.y - gs.holdZone.radius - 8,
    );
    ctx.restore();
  }

  // Walls
  for (const w of gs.walls) {
    ctx.fillStyle = w.color;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
  }

  // Health pickups
  for (const pk of gs.healthPickups) {
    ctx.fillStyle = "#ff4a4a";
    ctx.fillRect(pk.x - 8, pk.y - 3, 16, 6);
    ctx.fillRect(pk.x - 3, pk.y - 8, 6, 16);
  }

  // Ammo pickups
  for (const pk of gs.ammoPickups) {
    ctx.fillStyle =
      pk.type === "rifle"
        ? "#f5c518"
        : pk.type === "shotgun"
          ? "#ff8c00"
          : "#a0a0ff";
    ctx.fillRect(pk.x - 6, pk.y - 6, 12, 12);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(pk.x - 6, pk.y - 6, 12, 12);
  }

  // Explosions
  for (const ex of gs.explosions) {
    const t = ex.life / ex.maxLife;
    ctx.save();
    ctx.globalAlpha = t * 0.8;
    const g = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, ex.radius);
    g.addColorStop(0, "#fff8aa");
    g.addColorStop(0.4, "#ff8c00");
    g.addColorStop(1, "rgba(255,60,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Bullets
  for (const b of gs.bullets) {
    ctx.save();
    ctx.fillStyle = b.fromPlayer ? "#ffe84a" : "#ff5555";
    ctx.shadowColor = b.fromPlayer ? "#ffe84a" : "#ff0000";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Enemies
  for (const e of gs.enemies) {
    const sz = e.isBoss ? 20 : ENEMY_SIZE;
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle);
    // body
    ctx.fillStyle =
      e.flashTimer > 0 ? "#ffffff" : e.isBoss ? "#990000" : "#cc2222";
    ctx.fillRect(-sz, -sz, sz * 2, sz * 2);
    ctx.strokeStyle = e.isBoss ? "#ff0000" : "#880000";
    ctx.lineWidth = 2;
    ctx.strokeRect(-sz, -sz, sz * 2, sz * 2);
    // gun barrel
    ctx.fillStyle = "#440000";
    ctx.fillRect(sz * 0.5, -3, sz * 0.9, 6);
    ctx.restore();
    // HP bar
    const bw = sz * 2.5;
    ctx.fillStyle = "#330000";
    ctx.fillRect(e.x - bw / 2, e.y - sz - 10, bw, 4);
    ctx.fillStyle = e.isBoss ? "#ff4400" : "#cc3333";
    ctx.fillRect(e.x - bw / 2, e.y - sz - 10, bw * (e.hp / e.maxHp), 4);
    if (e.isBoss) {
      ctx.fillStyle = "#ff8888";
      ctx.font = "bold 11px 'Barlow Condensed', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("COMMANDER", e.x, e.y - sz - 14);
    }
  }

  // Player
  const p = gs.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(
    -PLAYER_SIZE - 2,
    -PLAYER_SIZE - 2,
    PLAYER_SIZE * 2 + 4,
    PLAYER_SIZE * 2 + 4,
  );
  // body
  const flash = p.invincible > 0 && Math.floor(p.invincible * 20) % 2 === 0;
  ctx.fillStyle = flash ? "#ffffff" : "#4a6a2a";
  ctx.fillRect(-PLAYER_SIZE, -PLAYER_SIZE, PLAYER_SIZE * 2, PLAYER_SIZE * 2);
  ctx.strokeStyle = "#2a4a1a";
  ctx.lineWidth = 2;
  ctx.strokeRect(-PLAYER_SIZE, -PLAYER_SIZE, PLAYER_SIZE * 2, PLAYER_SIZE * 2);
  // gun barrel
  ctx.fillStyle = "#1a3a1a";
  ctx.fillRect(PLAYER_SIZE * 0.5, -4, PLAYER_SIZE * 1.2, 8);
  ctx.restore();

  ctx.restore(); // end camera

  // ─── HUD ─────────────────────────────────────────────────────────────────
  // Health bar
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(16, 16, 204, 28);
  ctx.fillStyle = p.hp > 60 ? "#4abf4a" : p.hp > 30 ? "#d4a842" : "#cc3333";
  ctx.fillRect(18, 18, Math.max(0, 200 * (p.hp / p.maxHp)), 24);
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, 204, 28);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px 'Barlow Condensed', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`HP  ${Math.ceil(p.hp)} / ${p.maxHp}`, 22, 33);

  // Score & Mode info (top right)
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(canvasW - 220, 16, 204, mode === "survival" ? 56 : 84);
  ctx.fillStyle = "#f5c518";
  ctx.font = "bold 13px 'Barlow Condensed', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`SCORE: ${gs.score}`, canvasW - 22, 33);
  if (mode === "survival") {
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`WAVE ${gs.wave}`, canvasW - 22, 52);
    if (gs.waveBreak) {
      ctx.fillStyle = "#6fbf4a";
      ctx.fillText(
        `NEXT WAVE: ${Math.ceil(gs.waveBreakTimer)}s`,
        canvasW - 22,
        68,
      );
    }
  } else if (mode === "mission") {
    ctx.fillStyle = "#aaddff";
    ctx.font = "bold 11px 'Barlow Condensed', sans-serif";
    ctx.fillText(`MISSION ${gs.missionIndex + 1}/5`, canvasW - 22, 50);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px 'Barlow Condensed', sans-serif";
    ctx.fillText(gs.missionObjective, canvasW - 22, 68);
    // progress
    let progress = "";
    if (gs.missionIndex === 0) progress = `KILLS: ${gs.killCount}/10`;
    else if (gs.missionIndex === 1)
      progress = `TIME: ${Math.ceil(60 - gs.surviveTimer)}s`;
    else if (gs.missionIndex === 2) progress = "REACH GREEN ZONE";
    else if (gs.missionIndex === 3)
      progress = gs.enemies.some((e) => e.isBoss)
        ? "COMMANDER ALIVE"
        : "HUNTING...";
    else if (gs.missionIndex === 4)
      progress = `HOLD: ${Math.ceil(gs.holdTimer)}/90s`;
    ctx.fillStyle = "#f5c518";
    ctx.fillText(progress, canvasW - 22, 86);
  } else {
    ctx.fillStyle = "#aaffaa";
    ctx.font = "bold 11px 'Barlow Condensed', sans-serif";
    ctx.fillText("SANDBOX MODE", canvasW - 22, 50);
    ctx.fillStyle = "#cccccc";
    ctx.fillText(`KILLS: ${gs.score / 10}`, canvasW - 22, 66);
  }

  // Weapon HUD (bottom left)
  const wep = p.weapons[p.weaponIndex];
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(16, canvasH - 70, 220, 54);
  ctx.fillStyle = "#f5c518";
  ctx.font = "bold 14px 'Barlow Condensed', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(wep.name, 22, canvasH - 48);
  ctx.fillStyle = "#cccccc";
  ctx.font = "12px 'Barlow Condensed', sans-serif";
  if (wep.reloading > 0) {
    ctx.fillStyle = "#ff9944";
    ctx.fillText(`RELOADING... ${wep.reloading.toFixed(1)}s`, 22, canvasH - 28);
  } else if (wep.type === "pistol") {
    ctx.fillText("∞  AMMO", 22, canvasH - 28);
  } else {
    ctx.fillText(`${wep.ammo} / ${wep.maxAmmo}`, 22, canvasH - 28);
  }
  // Weapon slots
  for (let wi = 0; wi < 4; wi++) {
    const wx = 22 + wi * 52;
    ctx.fillStyle =
      wi === p.weaponIndex ? "rgba(100,160,60,0.5)" : "rgba(0,0,0,0.3)";
    ctx.fillRect(wx - 2, canvasH - 22, 48, 14);
    ctx.fillStyle = wi === p.weaponIndex ? "#6fbf4a" : "#888";
    ctx.font = "bold 10px 'Barlow Condensed', sans-serif";
    const names = ["[1]PSTL", "[2]AR", "[3]SGUN", "[4]SNPR"];
    ctx.fillText(names[wi], wx, canvasH - 10);
  }

  // Minimap
  const mmSize = 100;
  const mmX = canvasW - mmSize - 16;
  const mmY = canvasH - mmSize - 16;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(mmX, mmY, mmSize, mmSize);
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.strokeRect(mmX, mmY, mmSize, mmSize);
  const mmScale = mmSize / WORLD_W;
  // walls on minimap
  ctx.fillStyle = "#3a3a2a";
  for (const w of gs.walls) {
    if (w.w > 30 || w.h > 30) {
      // only larger walls
      ctx.fillRect(
        mmX + w.x * mmScale,
        mmY + w.y * mmScale,
        Math.max(1, w.w * mmScale),
        Math.max(1, w.h * mmScale),
      );
    }
  }
  // extract/hold on minimap
  if (gs.extractPoint) {
    ctx.fillStyle = "#4aff4a";
    ctx.beginPath();
    ctx.arc(
      mmX + gs.extractPoint.x * mmScale,
      mmY + gs.extractPoint.y * mmScale,
      4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  if (gs.holdZone) {
    ctx.fillStyle = "#4a9fff";
    ctx.beginPath();
    ctx.arc(
      mmX + gs.holdZone.x * mmScale,
      mmY + gs.holdZone.y * mmScale,
      4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  // enemies on minimap
  for (const e of gs.enemies) {
    ctx.fillStyle = e.isBoss ? "#ff8800" : "#ff4444";
    ctx.fillRect(mmX + e.x * mmScale - 1.5, mmY + e.y * mmScale - 1.5, 3, 3);
  }
  // player on minimap
  ctx.fillStyle = "#6fbf4a";
  ctx.beginPath();
  ctx.arc(mmX + p.x * mmScale, mmY + p.y * mmScale, 3, 0, Math.PI * 2);
  ctx.fill();
  // minimap label
  ctx.fillStyle = "#888";
  ctx.font = "9px 'Barlow Condensed', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("MINIMAP", mmX + 2, mmY + 10);

  // Sandbox controls overlay
  if (mode === "sandbox") {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(canvasW / 2 - 160, canvasH - 65, 320, 50);
    ctx.fillStyle = "#aaffaa";
    ctx.font = "bold 11px 'Barlow Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "[E] Spawn Enemy at Cursor  [R] Spawn 10  [H] Restore Health",
      canvasW / 2,
      canvasH - 43,
    );
    ctx.fillText(
      "UNLIMITED AMMO  ·  NO LOSE CONDITION",
      canvasW / 2,
      canvasH - 26,
    );
  }

  // Wave break overlay
  if (mode === "survival" && gs.waveBreak) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(canvasW / 2 - 180, canvasH / 2 - 50, 360, 100);
    ctx.fillStyle = "#6fbf4a";
    ctx.font = "bold 28px 'Barlow Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`WAVE ${gs.wave} CLEARED!`, canvasW / 2, canvasH / 2 - 10);
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px 'Barlow Condensed', sans-serif";
    ctx.fillText(
      `NEXT WAVE IN ${Math.ceil(gs.waveBreakTimer)}s`,
      canvasW / 2,
      canvasH / 2 + 22,
    );
  }
}

export default function GameCanvas({ mode, onExit }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef = useRef<GameState | null>(null);
  const animRef = useRef<number>(0);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalWave, setFinalWave] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const getCanvasSize = useCallback(() => {
    return { w: window.innerWidth, h: window.innerHeight };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gs = initGameState(mode);
    gsRef.current = gs;
    const { w, h } = getCanvasSize();
    canvas.width = w;
    canvas.height = h;

    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.type === "keydown") {
        gs.keys.add(key);
        if (key === "1") gs.player.weaponIndex = 0;
        if (key === "2") gs.player.weaponIndex = 1;
        if (key === "3") gs.player.weaponIndex = 2;
        if (key === "4") gs.player.weaponIndex = 3;
        if (key === "r" && mode !== "sandbox") {
          const wep = gs.player.weapons[gs.player.weaponIndex];
          if (
            wep.reloading === 0 &&
            wep.ammo < wep.maxAmmo &&
            wep.type !== "pistol"
          ) {
            wep.reloading = wep.reloadTime;
          }
        }
        if (mode === "sandbox") {
          if (key === "e") {
            // spawn at mouse world pos
            const ex2 = gs.mouseX + gs.cameraX;
            const ey2 = gs.mouseY + gs.cameraY;
            gs.enemies.push(spawnEnemy(gs, ex2, ey2));
          }
          if (key === "r") {
            for (let i = 0; i < 10; i++) gs.enemies.push(spawnEnemy(gs));
          }
          if (key === "h") {
            gs.player.hp = gs.player.maxHp;
          }
        }
        if (key === "escape") {
          cancelAnimationFrame(animRef.current);
          onExit();
        }
      } else {
        gs.keys.delete(key);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      gs.mouseX = e.clientX - rect.left;
      gs.mouseY = e.clientY - rect.top;
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) gs.mouseDown = true;
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) gs.mouseDown = false;
    };
    const handleResize = () => {
      const { w: nw, h: nh } = getCanvasSize();
      canvas.width = nw;
      canvas.height = nh;
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKey);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize);

    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const cw = canvas.width;
      const ch = canvas.height;
      updateGame(gs, dt, mode, cw, ch);
      renderGame(ctx, gs, mode, cw, ch);
      if (gs.gameOver || gs.victory) {
        setGameOver(gs.gameOver && !gs.victory);
        setVictory(gs.victory);
        setFinalScore(gs.score);
        setFinalWave(gs.wave);
        return;
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKey);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
    };
  }, [mode, onExit, getCanvasSize]);

  const handleRestart = () => {
    setGameOver(false);
    setVictory(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gs = initGameState(mode);
    gsRef.current = gs;
    let lastTime = performance.now();
    const { w, h } = getCanvasSize();
    canvas.width = w;
    canvas.height = h;
    cancelAnimationFrame(animRef.current);
    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const cw = canvas.width;
      const ch = canvas.height;
      updateGame(gs, dt, mode, cw, ch);
      renderGame(ctx, gs, mode, cw, ch);
      if (gs.gameOver || gs.victory) {
        setGameOver(gs.gameOver && !gs.victory);
        setVictory(gs.victory);
        setFinalScore(gs.score);
        setFinalWave(gs.wave);
        return;
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
  };

  const modeLabel =
    mode === "survival"
      ? "SURVIVAL"
      : mode === "mission"
        ? "MISSION"
        : "SANDBOX";

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black"
      style={{ cursor: "crosshair" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* ESC hint */}
      {!gameOver && !victory && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 text-xs font-condensed text-white/60 tracking-widest pointer-events-none">
          WASD MOVE · MOUSE AIM · CLICK SHOOT · 1-4 WEAPONS · ESC EXIT
        </div>
      )}

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-6">
          <div className="text-destructive font-condensed font-900 text-7xl tracking-widest animate-pulse">
            MISSION FAILED
          </div>
          <div className="text-white/80 font-condensed text-2xl tracking-widest">
            {modeLabel} MODE
          </div>
          <div className="flex gap-8 text-center">
            <div>
              <div className="text-4xl font-condensed font-700 text-primary">
                {finalScore}
              </div>
              <div className="text-xs text-white/50 tracking-widest">
                FINAL SCORE
              </div>
            </div>
            {mode === "survival" && (
              <div>
                <div className="text-4xl font-condensed font-700 text-white">
                  {finalWave}
                </div>
                <div className="text-xs text-white/50 tracking-widest">
                  WAVES SURVIVED
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              data-ocid="gameover.restart_button"
              onClick={handleRestart}
              className="bg-primary hover:bg-orange-400 text-primary-foreground font-condensed font-700 text-sm tracking-widest px-8 py-4 transition-all duration-200"
            >
              TRY AGAIN
            </button>
            <button
              type="button"
              data-ocid="gameover.exit_button"
              onClick={onExit}
              className="bg-card border border-border hover:border-primary text-foreground font-condensed font-700 text-sm tracking-widest px-8 py-4 transition-all duration-200"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      )}

      {/* Victory Overlay */}
      {victory && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-6">
          <div className="text-green-400 font-condensed font-900 text-7xl tracking-widest">
            {mode === "survival"
              ? `WAVE ${finalWave} CLEARED!`
              : "MISSION COMPLETE"}
          </div>
          <div className="text-white/80 font-condensed text-2xl tracking-widest">
            {modeLabel} MODE
          </div>
          <div>
            <div className="text-4xl font-condensed font-700 text-primary text-center">
              {finalScore}
            </div>
            <div className="text-xs text-white/50 tracking-widest text-center">
              TOTAL SCORE
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              data-ocid="victory.restart_button"
              onClick={handleRestart}
              className="bg-green-700 hover:bg-green-600 text-white font-condensed font-700 text-sm tracking-widest px-8 py-4 transition-all duration-200"
            >
              PLAY AGAIN
            </button>
            <button
              type="button"
              data-ocid="victory.exit_button"
              onClick={onExit}
              className="bg-card border border-border hover:border-primary text-foreground font-condensed font-700 text-sm tracking-widest px-8 py-4 transition-all duration-200"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
