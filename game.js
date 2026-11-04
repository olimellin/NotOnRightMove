'use strict';

/* =====================================================================
   LOGO
   Swap the placeholder wordmark for the real logo by setting this to
   'assets/logo.png' once the file is in the /assets folder.
   Leave it as an empty string to use the text wordmark "bourn".
   ===================================================================== */
const LOGO_SRC = '';

/* =====================================================================
   CONFIG: tune levels, timers, obstacles, copy and URLs here.
   Grid coordinates are [column, row], counted from 0 at the top left.
   rot: 0 = vertical, 1 = horizontal (for straight pieces).
   Times (opensAt) are seconds on the level clock, which starts when the
   level starts, so they include the countdown before the water flows.
   Source delays are seconds after the water starts.
   ===================================================================== */
const CONFIG = {
  urls: {
    flowCheck: 'https://bourn.ai/flow-check'
  },

  storageKeys: {
    leaderboard: 'kif.leaderboard.v1',
    leads: 'kif.leads.v1',
    settings: 'kif.settings.v1'
  },

  copy: {
    title: 'Keep It Flowing',
    tagline: 'Business finance that flows. So you can too.',
    signOff: 'Get in flow.',
    ctaButton: 'Check your business flow',
    disclaimer: "This is a game. It doesn't show real amounts, approval or terms. The Flexible Trade Account is available to eligible UK limited companies, subject to status.",
    sourceLabel: ['Invoices', 'sent'],
    lateLabel: ['Late', 'payer'],
    destLabel: ['Your', 'business'],
    markers: ['Payroll', 'Suppliers', 'Growth'],
    markerAt: [0.33, 0.66, 1],
    bournName: 'Bourn',
    bournTool: 'Bourn pipe',
    bournReplaced: 'Limit grows with your invoices',
    bournUnlocked: 'New: the Bourn pipe. Drop it on the overdraft pipe.',
    bournLocked: 'The Bourn pipe unlocks once your overdraft hits its limit.',
    bournNone: "You've used this level's Bourn pipe.",
    bournWhere: 'The Bourn pipe replaces the overdraft pipe, or goes on an empty square.',
    bournEmpty: 'Placed. The Bourn pipe does most good on the overdraft pipe.',
    bottleneck: 'Fixed limit',
    backingUp: 'Backing up',
    fixedLabel: 'Overdraft',
    fixedInfo: 'The overdraft pipe is fixed in place. It carries the same amount however busy you get.',
    gateLabel: 'Review',
    gateInfo: 'The annual review gate opens once, for a short window.',
    waitInfo: 'This route opens after a 60-day wait.',
    wallInfo: "You can't build here.",
    leakLabel: 'Upload',
    leakTap: 'Tap',
    days: 'days',
    dueIn: 'Due in',
    timeLeft: 'Time left',
    waterStarts: 'Water starts in',
    flowStarted: 'The money is flowing.',
    spillWarn: 'Spilling! Close off open pipe ends.',
    nextMarker: 'Next: ',
    allMarkers: 'Growth reached',
    over: {
      time: "Time's up. Your business didn't reach Growth.",
      dry: 'The money ran dry. Spills and running costs drained your business.'
    },
    tips: {
      bourn: 'Tip: the overdraft pipe is your bottleneck. Swap in the Bourn pipe so the limit grows with your invoices.',
      spill: 'Tip: water spills from any open pipe end. Build ahead of the flow.',
      leak: 'Tip: keep tapping leaking pipes to patch them.',
      gate: "Tip: the review gate closes again. Route around it if you can.",
      general: 'Tip: plan the route during the countdown, then start the flow early for bonus points.'
    },
    complete: ['Money is flowing.', 'Nice and steady.', 'Your business keeps moving.'],
    howTo: [
      { img: 'assets/howto-1.svg', title: 'Place and rotate', text: 'Pick a pipe from the tray and tap a square to place it. Tap a placed pipe to turn it. Keyboard: arrows, R, Enter.' },
      { img: 'assets/howto-2.svg', title: 'Connect the flow', text: 'Join "Invoices sent" to "Your business" before the countdown ends. Open pipe ends spill money.' },
      { img: 'assets/howto-3.svg', title: 'Reach Growth', text: 'Fill the business gauge past Payroll and Suppliers to Growth before time runs out. Watch for the violet Bourn pipe.' }
    ]
  },

  scoring: {
    perSecondLeft: 10,     // points per second left on the clock
    perFlow: 4,            // points per unit of flow delivered
    perSpill: 6,           // points lost per unit spilled or leaked
    perSkippedSecond: 5,   // bonus for starting the flow early
    stars: { two: 0.15, three: 0.35, maxSpillRatioForThree: 0.2 } // fraction of level time left
  },

  flow: {
    normalCapacity: 99,     // ordinary pipes never bottleneck
    tankDrain: 0.5,         // how quickly a tank empties into the pipes
    bourn: { base: 1.5, scale: 10, visualMax: 9 }, // capacity = base + scale * (invoices waiting)
    bournUnlockDelay: 3,    // seconds of bottleneck before the Bourn pipe unlocks (level 2)
    leakWeight: 1.1         // how much a fully leaking pipe drains compared with the business
  },

  levels: [
    {
      name: 'Day one',
      intro: 'Your first invoices are out. Connect them to your business so the money can flow.',
      newThing: null,
      hint: 'Pick a pipe, then tap a square to place it. Tap a placed pipe to turn it.',
      size: 7, buildTime: 25, levelTime: 60, fillSpeed: 2.5,
      sources: [{ row: 1, rate: [3, 3], ramp: 0, tank: 10, delay: 0 }],
      dest: { row: 5 },
      gauge: { start: 30, target: 80, drain: 1, gain: 1, spillPenalty: 0.5, leakPenalty: 0.25 },
      fixedPipe: null,
      bourn: { count: 0, unlock: 'start' },
      walls: [], gates: [], waits: [], leaks: []
    },
    {
      name: 'First big contract',
      intro: "You've won a contract twice your usual size. Can your finance keep up?",
      newThing: '<strong>New: the overdraft pipe.</strong> It carries a fixed amount, however full your invoice tank gets.',
      hint: 'Watch the overdraft pipe once the water reaches it.',
      size: 7, buildTime: 25, levelTime: 80, fillSpeed: 2.5,
      sources: [{ row: 2, rate: [2, 6], ramp: 25, tank: 10, delay: 0 }],
      dest: { row: 4 },
      gauge: { start: 25, target: 100, drain: 1.6, gain: 1, spillPenalty: 0.5, leakPenalty: 0.25 },
      fixedPipe: { c: 6, r: 4, rot: 1, capacity: 2 },
      bourn: { count: 1, unlock: 'bottleneck' },
      walls: [[3, 1], [3, 2], [3, 3]], gates: [], waits: [], leaks: []
    },
    {
      name: 'Growing team',
      intro: 'More people means more payroll. Will your finance wait for its annual review?',
      newThing: '<strong>New: the annual review gate</strong> opens once, briefly. <strong>The 60-day wait</strong> opens late.',
      hint: 'Your Bourn pipe is ready from the start this time.',
      size: 8, buildTime: 30, levelTime: 75, fillSpeed: 2.5,
      sources: [{ row: 2, rate: [3, 6], ramp: 30, tank: 10, delay: 0 }],
      dest: { row: 5 },
      gauge: { start: 30, target: 100, drain: 2, gain: 1, spillPenalty: 0.5, leakPenalty: 0.25 },
      fixedPipe: { c: 7, r: 5, rot: 1, capacity: 2.5 },
      bourn: { count: 1, unlock: 'start' },
      walls: [[3, 0], [3, 1], [3, 3], [3, 4], [3, 6]],
      gates: [{ c: 3, r: 2, rot: 1, opensAt: 32, openFor: 8 }],
      waits: [{ c: 3, r: 5, rot: 1, opensAt: 52, days: 60 }],
      leaks: []
    },
    {
      name: 'Busy season',
      intro: "Orders are flying in. Don't let manual uploads leak your cash flow.",
      newThing: '<strong>New: manual upload leaks.</strong> Tap a leaking pipe again and again to patch it.',
      hint: 'Leaks start once the water flows. Keep tapping them.',
      size: 8, buildTime: 30, levelTime: 75, fillSpeed: 2.5,
      sources: [{ row: 3, rate: [3, 7], ramp: 30, tank: 10, delay: 0 }],
      dest: { row: 6 },
      gauge: { start: 30, target: 100, drain: 2.2, gain: 1, spillPenalty: 0.5, leakPenalty: 0.25 },
      fixedPipe: { c: 7, r: 6, rot: 1, capacity: 2.5 },
      bourn: { count: 1, unlock: 'start' },
      walls: [[4, 2], [4, 3], [4, 4], [4, 5], [2, 6], [2, 7]],
      gates: [],
      waits: [],
      leaks: [{ c: 0, r: 3, rot: 1, creep: 0.12, patch: 0.4 }, { c: 1, r: 3, rot: 1, creep: 0.1, patch: 0.4 }]
    },
    {
      name: 'Scale-up',
      intro: 'Bigger customers, slower payers. Keep every invoice flowing.',
      newThing: '<strong>New: late payers.</strong> Three smaller tanks start flowing at random times.',
      hint: 'Join every tank to your business, or their water spills.',
      size: 9, buildTime: 30, levelTime: 60, fillSpeed: 2.8,
      shuffleDelays: true,
      sources: [
        { row: 1, rate: [2, 3.5], ramp: 20, tank: 6, delay: [0, 0] },
        { row: 4, rate: [2, 3.5], ramp: 20, tank: 6, delay: [3, 9] },
        { row: 7, rate: [2, 3.5], ramp: 20, tank: 6, delay: [8, 15] }
      ],
      dest: { row: 4 },
      gauge: { start: 30, target: 100, drain: 2.5, gain: 1, spillPenalty: 0.5, leakPenalty: 0.25 },
      fixedPipe: { c: 8, r: 4, rot: 1, capacity: 3 },
      bourn: { count: 1, unlock: 'start' },
      walls: [[4, 0], [4, 1], [4, 3], [2, 5], [6, 6], [6, 7]],
      gates: [{ c: 4, r: 2, rot: 1, opensAt: 38, openFor: 6 }],
      waits: [],
      leaks: [{ c: 7, r: 4, rot: 1, creep: 0.1, patch: 0.45 }]
    }
  ]
};

/* =====================================================================
   LEAD CAPTURE STUB
   Wire this to the real endpoint later. Right now nothing leaves the
   browser: submissions are only kept in localStorage on this device.
   ===================================================================== */
function submitLead(data) {
  // TODO: replace with a real request, for example:
  // return fetch('https://YOUR-ENDPOINT/leads', {
  //   method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  // });
  void data;
  return Promise.resolve({ ok: true, sent: false });
}

/* ===================================================================== */

(function () {
  const COLORS = {
    navy: '#06063A', violet: '#3919F7', cyan: '#28CCFF', lavender: '#F3F2FB',
    pale: '#DCD6FF', slate: '#46486F', mid: '#7B6FE8',
    board: '#0B0B48', cell: '#10105A', cellEdge: 'rgba(220,214,255,0.12)', pipeInner: '#0B0B40'
  };
  const FONT = '"Lexend Deca", system-ui, sans-serif';
  const DX = [0, 1, 0, -1];
  const DY = [-1, 0, 1, 0];
  const OPP = [2, 3, 0, 1];
  const PIECES = { straight: 5, corner: 3, tee: 7 };
  const PIECE_NAMES = { straight: 'Straight', corner: 'Corner', tee: 'T-junction' };
  const CORNER = { 3: [0, 1], 6: [1, 2], 12: [2, 3], 9: [3, 0] };
  const DIR_NAMES = ['up', 'right', 'down', 'left'];

  const $ = (s) => document.querySelector(s);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const rotMask = (m, k) => { k &= 3; return ((m << k) | (m >> (4 - k))) & 15; };
  const randRange = (a, b) => a + Math.random() * (b - a);

  const params = new URLSearchParams(location.search);
  const TIME_SCALE = clamp(parseFloat(params.get('speed')) || 1, 0.25, 8); // testing aid

  /* ---------- Safe storage ---------- */
  const store = {
    get(key, fallback) {
      try { const v = window.localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(key, val) {
      try { window.localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
    }
  };

  /* ---------- Reduced motion ---------- */
  let reduced = false;
  try {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced = mq.matches;
    const onChange = (e) => { reduced = e.matches; };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  } catch (e) { /* ignore */ }

  /* ---------- Sound (Web Audio blips, off by default) ---------- */
  const Sound = {
    ctx: null, on: false,
    ensure() {
      if (!this.on) return null;
      try {
        if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; this.ctx = new AC(); }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
      } catch (e) { return null; }
    },
    blip(freq, dur, type, vol, slide) {
      const ctx = this.ensure(); if (!ctx) return;
      try {
        const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(freq, t);
        if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol || 0.08, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + dur + 0.02);
      } catch (e) { /* ignore */ }
    },
    place() { this.blip(520, 0.09, 'triangle', 0.08, 700); },
    rotate() { this.blip(760, 0.06, 'sine', 0.05, 900); },
    remove() { this.blip(400, 0.08, 'triangle', 0.06, 260); },
    flow(rate) { this.blip(220 + rate * 18, 0.18, 'sine', 0.025, 160 + rate * 14); },
    spill() { this.blip(180, 0.16, 'sawtooth', 0.025, 110); },
    patch() { this.blip(880, 0.05, 'square', 0.03, 1200); },
    bourn() { [523, 659, 784].forEach((f, i) => setTimeout(() => this.blip(f, 0.16, 'sine', 0.07), i * 90)); },
    win() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, 0.2, 'triangle', 0.07), i * 110)); },
    lose() { [392, 330, 262].forEach((f, i) => setTimeout(() => this.blip(f, 0.22, 'sine', 0.06), i * 140)); }
  };

  /* ---------- State ---------- */
  const S = {
    screen: 'start',
    levelIndex: 0, level: null, N: 7, grid: [],
    t: 0, phase: 'build', flowStart: 0, paused: false,
    sources: [], rowToSrc: {}, gauge: 0, delivered: 0, spilled: 0,
    destFlow: 0, spillFlow: 0, leakFlow: 0, destReached: false, destCapped: false,
    bottleneck: false, bottleneckIdx: -1, bottleneckTime: 0, bournCap: 0, fillRatio: 0,
    spills: [], tool: 'straight', rot: 0, bournLeft: 0, bournUnlocked: false, bournUsed: false,
    cursor: { c: 0, r: 0 }, kbd: false, hover: null,
    floatLabel: null, skipBonus: 0, result: null,
    run: { scores: [], stars: [] },
    dash: 0, dashSlow: 0, dashBourn: 0, flowTick: 0, spillWarned: false,
    particles: [], L: null, ctx: null, canvas: null, bg: null, hud: {},
    arrays: null
  };

  /* =====================================================================
     LEVEL SETUP
     ===================================================================== */
  function makeCell(kind, extra) {
    return Object.assign({ kind, piece: 'straight', rot: 0, fill: 0, entry: 3, flow: 0, capped: false, fed: false }, extra || {});
  }
  function idxOf(c, r) { return r * S.N + c; }
  function getCell(c, r) { return (c >= 0 && r >= 0 && c < S.N && r < S.N) ? S.grid[idxOf(c, r)] : null; }

  function setupLevel(i) {
    const lv = CONFIG.levels[i];
    S.levelIndex = i; S.level = lv; S.N = lv.size;
    const N = lv.size;
    S.grid = [];
    for (let k = 0; k < N * N; k++) S.grid.push(makeCell('empty'));
    const put = (c, r, cell) => { if (c >= 0 && r >= 0 && c < N && r < N) S.grid[idxOf(c, r)] = cell; };
    (lv.walls || []).forEach(([c, r]) => put(c, r, makeCell('wall')));
    (lv.waits || []).forEach((w) => put(w.c, w.r, makeCell('wait', { rot: w.rot || 0, opensAt: w.opensAt, days: w.days || 60 })));
    (lv.gates || []).forEach((g) => put(g.c, g.r, makeCell('gate', { rot: g.rot || 0, opensAt: g.opensAt, openFor: g.openFor })));
    (lv.leaks || []).forEach((l) => put(l.c, l.r, makeCell('leak', { rot: l.rot || 0, leak: 0, creep: l.creep, patch: l.patch, patchFlash: 0 })));
    if (lv.fixedPipe) {
      const f = lv.fixedPipe;
      put(f.c, f.r, makeCell('fixed', { rot: f.rot || 0, capacity: f.capacity }));
    }

    let delays = lv.sources.map((s) => (Array.isArray(s.delay) ? randRange(s.delay[0], s.delay[1]) : (s.delay || 0)));
    if (lv.shuffleDelays) {
      for (let k = delays.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [delays[k], delays[j]] = [delays[j], delays[k]]; }
    }
    S.sources = lv.sources.map((s, k) => ({
      row: s.row, rate: s.rate, ramp: s.ramp || 0, Tmax: s.tank, T: 0, I: 0,
      delay: delays[k], active: false, small: lv.sources.length > 1, desire: 0, out: 0, late: delays[k] > 0
    }));
    S.rowToSrc = {};
    S.sources.forEach((s, k) => { S.rowToSrc[s.row] = k; });

    S.t = 0; S.phase = 'build'; S.flowStart = 0; S.paused = false;
    S.gauge = lv.gauge.start; S.delivered = 0; S.spilled = 0;
    S.destFlow = 0; S.spillFlow = 0; S.leakFlow = 0; S.destReached = false; S.destCapped = false;
    S.bottleneck = false; S.bottleneckIdx = -1; S.bottleneckTime = 0;
    S.spills = []; S.tool = 'straight'; S.rot = 0;
    S.bournLeft = lv.bourn.count; S.bournUnlocked = lv.bourn.count > 0 && lv.bourn.unlock !== 'bottleneck'; S.bournUsed = false;
    S.cursor = { c: 0, r: lv.sources[0].row }; S.hover = null; S.floatLabel = null; S.skipBonus = 0; S.result = null;
    S.particles = []; S.spillWarned = false; S.flowTick = 0;
    S.arrays = {
      fed: new Int16Array(N * N), parent: new Int32Array(N * N), entry: new Int8Array(N * N), queue: new Int32Array(N * N + 8)
    };
    S.hud = {};
    buildGaugeMarkers();
    buildTray();
    updateLevelTitle();
    layout();
  }

  /* =====================================================================
     TILE LOGIC
     ===================================================================== */
  function gateState(cell) {
    if (S.t < cell.opensAt) return 'pending';
    if (S.t < cell.opensAt + cell.openFor) return 'open';
    return 'closed';
  }
  function maskOf(cell) {
    switch (cell.kind) {
      case 'empty': case 'wall': return 0;
      case 'wait': return S.t >= cell.opensAt ? rotMask(PIECES.straight, cell.rot) : 0;
      case 'gate': return gateState(cell) === 'open' ? rotMask(PIECES.straight, cell.rot) : 0;
      default: return rotMask(PIECES[cell.piece], cell.rot);
    }
  }
  function shapeMask(cell) {
    if (cell.kind === 'empty' || cell.kind === 'wall') return 0;
    return rotMask(PIECES[cell.piece], cell.rot);
  }
  function capacityOf(cell) {
    if (cell.kind === 'fixed') return cell.capacity;
    if (cell.kind === 'bourn') return S.bournCap;
    return CONFIG.flow.normalCapacity;
  }

  /* =====================================================================
     SIMULATION
     ===================================================================== */
  function update(dt) {
    S.t += dt;
    const lv = S.level;
    if (S.phase === 'build') {
      // Invoices go out during the countdown, so the tank fills up.
      S.sources.forEach((s) => {
        if (s.delay <= 0) { s.I = s.rate[0]; s.T = Math.min(s.Tmax, s.Tmax * 0.95 * (S.t / lv.buildTime)); s.active = true; }
      });
      if (S.t >= lv.buildTime) startFlow(false);
    } else if (S.phase === 'flow') {
      simulate(dt);
    }
    updateParticles(dt);
    if (S.floatLabel && S.t > S.floatLabel.until) S.floatLabel = null;
  }

  function simulate(dt) {
    const lv = S.level, N = S.N, grid = S.grid, srcs = S.sources, A = S.arrays;
    const ft = S.t - S.flowStart;
    const F = CONFIG.flow;

    let sumT = 0, sumMax = 0;
    for (const s of srcs) {
      s.active = ft >= s.delay;
      if (s.active) {
        const k = s.ramp > 0 ? clamp((ft - s.delay) / s.ramp, 0, 1) : 1;
        s.I = lerp(s.rate[0], s.rate[1], k);
      } else s.I = 0;
      sumT += s.T; sumMax += s.Tmax;
    }
    S.fillRatio = sumMax > 0 ? sumT / sumMax : 0;
    S.bournCap = F.bourn.base + F.bourn.scale * S.fillRatio;

    // Leaks get worse over time unless patched.
    for (const cell of grid) {
      if (cell.kind === 'leak') { cell.leak = Math.min(1, cell.leak + cell.creep * dt); cell.patchFlash = Math.max(0, cell.patchFlash - dt); }
    }

    // Breadth-first walk from each source through connected, full tiles.
    const fed = A.fed, parent = A.parent, entry = A.entry, queue = A.queue;
    fed.fill(-1); parent.fill(-1);
    const uf = srcs.map((_, i) => i);
    const find = (i) => { while (uf[i] !== i) { uf[i] = uf[uf[i]]; i = uf[i]; } return i; };
    const union = (a, b) => { a = find(a); b = find(b); if (a !== b) uf[b] = a; };
    let qh = 0, qt = 0;
    const spills = [];
    let destFrom = -1, destComp = -1;

    srcs.forEach((s, i) => {
      if (!(s.active || s.T > 0.01)) return;
      const idx = s.row * N;
      const m = maskOf(grid[idx]);
      if (m & 8) {
        if (fed[idx] === -1) { fed[idx] = i; entry[idx] = 3; parent[idx] = -1; queue[qt++] = idx; } else union(fed[idx], i);
      } else spills.push({ c: -1, r: s.row, d: 1, comp: i });
    });

    while (qh < qt) {
      const idx = queue[qh++];
      const cell = grid[idx];
      if (cell.fill < 1) continue;
      const c = idx % N, r = (idx / N) | 0, m = maskOf(cell), comp = fed[idx];
      for (let d = 0; d < 4; d++) {
        if (!(m & (1 << d))) continue;
        const nc = c + DX[d], nr = r + DY[d];
        if (d === 1 && nc === N && nr === lv.dest.row) { destFrom = idx; destComp = comp; continue; }
        if (d === 3 && nc === -1 && S.rowToSrc[nr] !== undefined) { union(comp, S.rowToSrc[nr]); continue; }
        if (nc < 0 || nr < 0 || nc >= N || nr >= N) { spills.push({ c, r, d, comp }); continue; }
        const nidx = nr * N + nc;
        const nm = maskOf(grid[nidx]);
        if (!(nm & (1 << OPP[d]))) { spills.push({ c, r, d, comp }); continue; }
        if (fed[nidx] === -1) { fed[nidx] = comp; entry[nidx] = OPP[d]; parent[nidx] = idx; queue[qt++] = nidx; } else union(comp, fed[nidx]);
      }
    }

    // Group into connected networks and share each network's water between its outlets.
    const comps = new Map();
    const getComp = (root) => {
      let o = comps.get(root);
      if (!o) { o = { D: 0, wDest: 0, wSpill: 0, wLeak: 0, cap: Infinity, capIdx: -1, O: 0, capped: false, destFlow: 0, spillF: 0, leakF: 0 }; comps.set(root, o); }
      return o;
    };
    srcs.forEach((s, i) => { s.desire = s.I + F.tankDrain * s.T; getComp(find(i)).D += s.desire; });
    spills.forEach((sp) => { sp.root = find(sp.comp); getComp(sp.root).wSpill += 1; });
    const leakCells = [];
    for (let k = 0; k < grid.length; k++) {
      const cell = grid[k];
      if (cell.kind === 'leak' && fed[k] >= 0 && cell.fill >= 1 && cell.leak > 0.02) {
        const w = cell.leak * F.leakWeight;
        getComp(find(fed[k])).wLeak += w;
        leakCells.push({ k, w, root: find(fed[k]) });
      }
    }
    if (destFrom >= 0) {
      const o = getComp(find(destComp));
      o.wDest = 1;
      let k = destFrom;
      while (k >= 0) { const cap = capacityOf(grid[k]); if (cap < o.cap) { o.cap = cap; o.capIdx = k; } k = parent[k]; }
    }

    let destFlow = 0, spillFlow = 0, leakFlow = 0;
    comps.forEach((o) => {
      const W = o.wDest + o.wSpill + o.wLeak;
      if (W <= 0 || o.D <= 0) return;
      const share = o.D * o.wDest / W;
      o.destFlow = Math.min(share, o.cap);
      o.capped = share > o.cap + 1e-6;
      o.spillF = o.D * o.wSpill / W;
      o.leakF = o.D * o.wLeak / W;
      o.O = o.destFlow + o.spillF + o.leakF;
      destFlow += o.destFlow; spillFlow += o.spillF; leakFlow += o.leakF;
    });
    srcs.forEach((s, i) => {
      const o = comps.get(find(i));
      s.out = (o && o.D > 0) ? o.O * s.desire / o.D : 0;
      s.capped = !!(o && o.capped) || (o && o.O === 0 && s.T > s.Tmax * 0.9);
      s.T = clamp(s.T + (s.I - s.out) * dt, 0, s.Tmax);
    });

    // Water front: tiles fill one after another, at a steady speed.
    for (let k = 0; k < grid.length; k++) {
      const cell = grid[k];
      if (fed[k] >= 0) {
        const o = comps.get(find(fed[k]));
        if (cell.fill < 1) {
          cell.entry = entry[k];
          if (o && o.D > 0.001) cell.fill = Math.min(1, cell.fill + lv.fillSpeed * dt * (cell.kind === 'bourn' ? 1.6 : 1));
        }
        cell.fed = true; cell.flow = o ? o.O : 0; cell.capped = !!(o && o.capped);
      } else {
        cell.fed = false; cell.fill = Math.max(0, cell.fill - 1.5 * dt); cell.flow = 0; cell.capped = false;
      }
    }

    spills.forEach((sp) => { const o = comps.get(sp.root); sp.flow = o && o.wSpill > 0 ? o.spillF / o.wSpill : 0; });
    S.spills = spills.filter((sp) => sp.flow > 0.01);
    S.leakCells = leakCells;

    const dc = destFrom >= 0 ? comps.get(find(destComp)) : null;
    S.destReached = !!(dc && dc.destFlow > 0);
    S.destCapped = !!(dc && dc.capped);
    S.bottleneck = !!(dc && dc.capped && dc.capIdx >= 0 && grid[dc.capIdx].kind === 'fixed');
    S.bottleneckIdx = S.bottleneck ? dc.capIdx : -1;
    S.destFlow = destFlow; S.spillFlow = spillFlow; S.leakFlow = leakFlow;

    // Business gauge.
    const g = lv.gauge;
    S.gauge += (destFlow * g.gain - g.drain - spillFlow * g.spillPenalty - leakFlow * g.leakPenalty) * dt;
    S.delivered += destFlow * dt;
    S.spilled += (spillFlow + leakFlow) * dt;

    // Bourn pipe unlock (level 2 shows the bottleneck first).
    if (S.bottleneck) S.bottleneckTime += dt;
    if (!S.bournUnlocked && S.bournLeft > 0 && lv.bourn.unlock === 'bottleneck' && S.bottleneckTime >= F.bournUnlockDelay) {
      S.bournUnlocked = true;
      toast(CONFIG.copy.bournUnlocked, 'bourn', 5000);
      Sound.bourn();
      buildTray(true);
    }

    if (spillFlow > 0.3 && !S.spillWarned) { S.spillWarned = true; toast(CONFIG.copy.spillWarn); Sound.spill(); }

    // Effects and sound.
    S.dash += dt * (0.5 + Math.min(destFlow, 10) * 0.22);
    S.dashSlow += dt * 0.25;
    S.dashBourn += dt * (0.8 + Math.min(S.bournCap, 12) * 0.25);
    S.flowTick -= dt;
    if (S.flowTick <= 0) { S.flowTick = 0.45; if (destFlow > 0.05) Sound.flow(destFlow); }
    spawnEffects(dt);

    if (S.gauge >= g.target) { S.gauge = g.target; endLevel(true); return; }
    if (S.gauge <= 0) { S.gauge = 0; endLevel(false, 'dry'); return; }
    if (ft >= lv.levelTime) endLevel(false, 'time');
  }

  function startFlow(early) {
    if (S.phase !== 'build') return;
    const lv = S.level;
    if (early) S.skipBonus = Math.round(Math.max(0, lv.buildTime - S.t) * CONFIG.scoring.perSkippedSecond);
    S.phase = 'flow';
    S.flowStart = S.t;
    toast(CONFIG.copy.flowStarted);
    announce(CONFIG.copy.flowStarted);
    Sound.blip(330, 0.3, 'sine', 0.06, 520);
  }

  function endLevel(win, reason) {
    if (S.phase === 'done') return;
    S.phase = 'done';
    const lv = S.level, sc = CONFIG.scoring;
    const timeLeft = Math.max(0, lv.levelTime - (S.t - S.flowStart));
    if (win) {
      const pTime = Math.round(timeLeft * sc.perSecondLeft);
      const pFlow = Math.round(S.delivered * sc.perFlow);
      const pSpill = Math.round(S.spilled * sc.perSpill);
      const score = Math.max(0, pTime + pFlow - pSpill + S.skipBonus);
      const frac = timeLeft / lv.levelTime;
      const spillRatio = S.spilled / Math.max(1, S.delivered);
      let stars = 1;
      if (frac >= sc.stars.two) stars = 2;
      if (frac >= sc.stars.three && spillRatio <= sc.stars.maxSpillRatioForThree) stars = 3;
      S.run.scores[S.levelIndex] = score;
      S.run.stars[S.levelIndex] = stars;
      S.result = { win: true, score, stars, pTime, pFlow, pSpill, skip: S.skipBonus };
      Sound.win();
      setTimeout(showComplete, 900);
    } else {
      S.result = { win: false, reason };
      Sound.lose();
      setTimeout(showOver, 900);
    }
  }

  /* =====================================================================
     PLAYER ACTIONS
     ===================================================================== */
  function actAt(c, r) {
    if (S.screen !== 'game' || S.phase === 'done' || S.paused) return;
    const cell = getCell(c, r);
    if (!cell) return;
    const copy = CONFIG.copy;

    if (cell.kind === 'leak') {
      cell.leak = Math.max(0, cell.leak - cell.patch);
      cell.patchFlash = 0.25;
      Sound.patch();
      return;
    }
    if (S.tool === 'remove') { removeAt(c, r); return; }

    if (S.tool === 'bourn') {
      if (!S.bournUnlocked) { toast(copy.bournLocked); return; }
      if (S.bournLeft <= 0) { toast(copy.bournNone); return; }
      if (cell.kind === 'fixed') {
        S.grid[idxOf(c, r)] = makeCell('bourn', { rot: cell.rot, replaced: cell, fill: cell.fill, entry: cell.entry, locked: true });
        S.bournLeft--; S.bournUsed = true;
        S.floatLabel = { text: copy.bournReplaced, c, r, until: S.t + 4.5 };
        toast(copy.bournReplaced, 'bourn', 3500);
        announce(copy.bournReplaced);
        Sound.bourn();
        S.tool = 'straight';
        buildTray();
        return;
      }
      if (cell.kind === 'empty') {
        S.grid[idxOf(c, r)] = makeCell('bourn', { rot: S.rot & 1 });
        S.bournLeft--; S.bournUsed = true;
        toast(copy.bournEmpty, 'bourn');
        Sound.place();
        S.tool = 'straight';
        buildTray();
        return;
      }
      toast(copy.bournWhere);
      return;
    }

    // Pipe tools
    if (cell.kind === 'empty') {
      S.grid[idxOf(c, r)] = makeCell('pipe', { piece: S.tool, rot: S.rot });
      Sound.place();
      announce(PIECE_NAMES[S.tool] + ' placed');
    } else if (cell.kind === 'pipe' || (cell.kind === 'bourn' && !cell.locked)) {
      rotateCell(cell);
    } else {
      explain(cell);
    }
  }

  function rotateCell(cell) {
    cell.rot = (cell.rot + 1) & 3;
    if (cell.kind === 'bourn') cell.rot &= 1;
    cell.fill = 0;
    Sound.rotate();
  }

  function explain(cell) {
    const copy = CONFIG.copy;
    const map = {
      fixed: copy.fixedInfo + (S.bournUnlocked && S.bournLeft > 0 ? ' Try the Bourn pipe on it.' : ''),
      gate: copy.gateInfo, wait: copy.waitInfo, wall: copy.wallInfo,
      bourn: copy.bournReplaced
    };
    if (map[cell.kind]) toast(map[cell.kind]);
  }

  function removeAt(c, r) {
    if (S.phase === 'done') return;
    const cell = getCell(c, r);
    if (!cell) return;
    if (cell.kind === 'pipe') {
      S.grid[idxOf(c, r)] = makeCell('empty');
      Sound.remove();
      announce('Pipe removed');
    } else if (cell.kind === 'bourn') {
      S.grid[idxOf(c, r)] = cell.replaced ? Object.assign(cell.replaced, { fill: 0 }) : makeCell('empty');
      S.bournLeft++;
      Sound.remove();
      buildTray();
      announce('Bourn pipe back in the tray');
    }
  }

  function selectTool(tool) {
    if (tool === 'bourn' && (!S.level || S.level.bourn.count === 0)) return;
    if (S.tool === tool && PIECES[tool]) { rotateTray(); return; }
    S.tool = tool;
    buildTray();
    announce((tool === 'bourn' ? CONFIG.copy.bournTool : tool === 'remove' ? 'Remove' : PIECE_NAMES[tool]) + ' selected');
  }
  function rotateTray() {
    S.rot = (S.rot + 1) & 3;
    Sound.rotate();
    buildTray();
  }

  /* =====================================================================
     LAYOUT AND RENDERING
     ===================================================================== */
  const GUT = 1.3, TOP = 0.85, BOTTOM = 0.4;

  function layout() {
    const wrap = $('#board-wrap'), canvas = S.canvas;
    if (!wrap || !canvas || !S.level) return;
    const W = wrap.clientWidth, H = wrap.clientHeight;
    if (W < 10 || H < 10) return;
    const N = S.N;
    const cs = Math.max(16, Math.floor(Math.min(W / (N + GUT * 2), H / (N + TOP + BOTTOM), 86)));
    const w = Math.round(cs * (N + GUT * 2)), h = Math.round(cs * (N + TOP + BOTTOM));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    S.L = { cs, w, h, dpr, ox: Math.round(cs * GUT), oy: Math.round(cs * TOP) };
    buildBackground();
  }

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function buildBackground() {
    const L = S.L, N = S.N;
    const bg = document.createElement('canvas');
    bg.width = Math.round(L.w * L.dpr); bg.height = Math.round(L.h * L.dpr);
    const ctx = bg.getContext('2d');
    ctx.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
    const cs = L.cs, pad = cs * 0.12;
    rr(ctx, L.ox - pad, L.oy - pad, N * cs + pad * 2, N * cs + pad * 2, cs * 0.3);
    ctx.fillStyle = COLORS.board; ctx.fill();
    ctx.strokeStyle = 'rgba(220,214,255,0.22)'; ctx.lineWidth = 1; ctx.stroke();
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const x = L.ox + c * cs, y = L.oy + r * cs;
        const cell = S.grid[idxOf(c, r)];
        rr(ctx, x + 2, y + 2, cs - 4, cs - 4, cs * 0.16);
        if (cell.kind === 'wall') {
          ctx.fillStyle = '#07072e'; ctx.fill();
          ctx.save(); ctx.clip();
          ctx.strokeStyle = 'rgba(220,214,255,0.12)'; ctx.lineWidth = 2;
          for (let k = -cs; k < cs * 2; k += cs * 0.22) { ctx.beginPath(); ctx.moveTo(x + k, y); ctx.lineTo(x + k - cs, y + cs); ctx.stroke(); }
          ctx.restore();
        } else {
          ctx.fillStyle = COLORS.cell; ctx.fill();
          ctx.strokeStyle = COLORS.cellEdge; ctx.lineWidth = 1; ctx.stroke();
        }
      }
    }
    S.bg = bg;
  }

  // Path helpers ------------------------------------------------------
  function arcPath(ctx, cx, cy, h, dA, dB, p) {
    const px = cx + (DX[dA] + DX[dB]) * h, py = cy + (DY[dA] + DY[dB]) * h;
    const a1 = Math.atan2(cy + DY[dA] * h - py, cx + DX[dA] * h - px);
    const a2 = Math.atan2(cy + DY[dB] * h - py, cx + DX[dB] * h - px);
    let delta = a2 - a1;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    ctx.moveTo(px + Math.cos(a1) * h, py + Math.sin(a1) * h);
    ctx.arc(px, py, h, a1, a1 + delta * p, delta < 0);
  }
  function shellPath(ctx, cx, cy, mask, h) {
    ctx.beginPath();
    const cr = CORNER[mask];
    if (cr) { arcPath(ctx, cx, cy, h, cr[0], cr[1], 1); return true; }
    for (let d = 0; d < 4; d++) if (mask & (1 << d)) { ctx.moveTo(cx, cy); ctx.lineTo(cx + DX[d] * h, cy + DY[d] * h); }
    return false;
  }
  function waterPath(ctx, cx, cy, mask, entry, fill, h) {
    ctx.beginPath();
    const cr = CORNER[mask];
    if (cr) {
      const from = (cr[1] === entry) ? cr[1] : cr[0];
      const to = from === cr[0] ? cr[1] : cr[0];
      arcPath(ctx, cx, cy, h, from, to, Math.min(1, fill));
      return;
    }
    let e = entry;
    if (!(mask & (1 << e))) { for (let d = 0; d < 4; d++) if (mask & (1 << d)) { e = d; break; } }
    const p1 = Math.min(1, fill * 2);
    ctx.moveTo(cx + DX[e] * h, cy + DY[e] * h);
    ctx.lineTo(cx + DX[e] * h * (1 - p1), cy + DY[e] * h * (1 - p1));
    if (fill > 0.5) {
      const q = Math.min(1, (fill - 0.5) * 2);
      for (let d = 0; d < 4; d++) {
        if (d === e || !(mask & (1 << d))) continue;
        ctx.moveTo(cx, cy); ctx.lineTo(cx + DX[d] * h * q, cy + DY[d] * h * q);
      }
    }
  }

  function strokeShell(ctx, cx, cy, mask, h, width, color) {
    const corner = shellPath(ctx, cx, cy, mask, h);
    ctx.lineWidth = width; ctx.strokeStyle = color; ctx.lineCap = 'butt'; ctx.stroke();
    if (!corner) { ctx.beginPath(); ctx.arc(cx, cy, width / 2, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
  }

  // Draw one pipe with shell, water and flow dashes.
  function drawPipe(ctx, cx, cy, mask, cell, st) {
    const h = S.L.cs / 2, cs = S.L.cs;
    if (st.glow) strokeShell(ctx, cx, cy, mask, h, cs * st.outer + cs * 0.16, st.glow);
    strokeShell(ctx, cx, cy, mask, h, cs * st.outer, st.shell);
    strokeShell(ctx, cx, cy, mask, h, cs * st.inner, COLORS.pipeInner);
    if (!cell || cell.fill <= 0.001) return;
    const pressure = cell.capped && cell.kind !== 'fixed' && cell.kind !== 'bourn';
    let ww = cs * st.water * (pressure ? 1.12 : 1);
    const corner = !!CORNER[mask];
    // soft glow
    waterPath(ctx, cx, cy, mask, cell.entry, cell.fill, h);
    ctx.lineCap = cell.fill < 1 ? 'round' : 'butt';
    ctx.strokeStyle = 'rgba(40,204,255,0.22)'; ctx.lineWidth = ww * 1.9; ctx.stroke();
    ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = ww; ctx.stroke();
    if (!corner && cell.fill > 0.5) { ctx.beginPath(); ctx.arc(cx, cy, ww / 2, 0, Math.PI * 2); ctx.fillStyle = COLORS.cyan; ctx.fill(); }
    if (cell.fill >= 1 && cell.flow > 0.02) {
      const phase = cell.kind === 'bourn' ? S.dashBourn : (pressure ? S.dashSlow : S.dash);
      waterPath(ctx, cx, cy, mask, cell.entry, 1, h);
      ctx.setLineDash([cs * 0.07, cs * 0.18]);
      ctx.lineDashOffset = -phase * cs;
      ctx.strokeStyle = pressure ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.6)';
      ctx.lineWidth = Math.max(1.5, ww * 0.32); ctx.lineCap = 'round';
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  const STYLE = {
    pipe: { outer: 0.42, inner: 0.28, water: 0.2, shell: COLORS.pale },
    ghost: { outer: 0.42, inner: 0.28, water: 0.2, shell: 'rgba(220,214,255,0.35)' },
    fixed: { outer: 0.2, inner: 0.11, water: 0.075, shell: '#8d8fb8' },
    locked: { outer: 0.42, inner: 0.28, water: 0.2, shell: '#a9a3d9' }
  };

  function textLines(ctx, lines, x, y, fs, color, weight, maxW) {
    ctx.font = (weight || 600) + ' ' + fs + 'px ' + FONT;
    if (maxW) {
      const widest = Math.max.apply(null, lines.map((ln) => ctx.measureText(ln).width));
      if (widest > maxW) { fs = Math.max(7, Math.floor(fs * maxW / widest)); ctx.font = (weight || 600) + ' ' + fs + 'px ' + FONT; }
    }
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * fs * 1.15));
  }
  function pill(ctx, text, x, y, fs, bg, fg, maxRight) {
    ctx.font = '600 ' + fs + 'px ' + FONT;
    const w = ctx.measureText(text).width + fs * 1.2, h = fs * 1.8;
    const px = clamp(x - w / 2, 2, (maxRight || S.L.w) - w - 2);
    const py = clamp(y - h / 2, 2, S.L.h - h - 2);
    rr(ctx, px, py, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, px + w / 2, py + h / 2 + 0.5);
  }
  function labelFont(cs) { return clamp(Math.round(cs * 0.2), 9, 13); }

  function render() {
    const ctx = S.ctx, L = S.L;
    if (!ctx || !L) return;
    ctx.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
    ctx.clearRect(0, 0, L.w, L.h);
    if (S.bg) ctx.drawImage(S.bg, 0, 0, L.w, L.h);
    drawSources(ctx);
    drawDest(ctx);
    const N = S.N, cs = L.cs;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cell = S.grid[idxOf(c, r)];
        if (cell.kind === 'empty' || cell.kind === 'wall') continue;
        drawCell(ctx, c, r, cell, L.ox + c * cs + cs / 2, L.oy + r * cs + cs / 2);
      }
    }
    drawSpills(ctx);
    drawParticles(ctx);
    drawLabels(ctx);
    drawCursor(ctx);
  }

  function drawCell(ctx, c, r, cell, cx, cy) {
    const cs = S.L.cs, fs = labelFont(cs);
    const mask = shapeMask(cell);
    switch (cell.kind) {
      case 'pipe': drawPipe(ctx, cx, cy, mask, cell, STYLE.pipe); break;
      case 'fixed': {
        drawPipe(ctx, cx, cy, mask, cell, STYLE.fixed);
        drawLock(ctx, cx + cs * 0.27, cy - cs * 0.27, cs * 0.11);
        if (cs >= 30) pill(ctx, CONFIG.copy.fixedLabel, cx, cy + cs * 0.33, Math.max(8, fs - 2), 'rgba(6,6,58,0.85)', COLORS.pale);
        break;
      }
      case 'bourn': {
        const v = clamp(S.bournCap / CONFIG.flow.bourn.visualMax, 0, 1);
        const outer = 0.34 + 0.24 * v;
        const pulse = reduced ? 0.5 : 0.42 + 0.14 * Math.sin(S.t * 3);
        drawPipe(ctx, cx, cy, mask, cell, { outer, inner: outer - 0.15, water: outer - 0.19, shell: COLORS.violet, glow: 'rgba(123,111,232,' + pulse.toFixed(2) + ')' });
        drawBournBadge(ctx, cx + cs * 0.3, cy - cs * 0.3, cs * 0.13);
        pill(ctx, CONFIG.copy.bournName, cx, cy + cs * 0.36, Math.max(8, fs - 2), COLORS.violet, '#fff');
        break;
      }
      case 'leak': {
        drawPipe(ctx, cx, cy, mask, cell, STYLE.locked);
        drawLeak(ctx, cx, cy, cell);
        break;
      }
      case 'gate': drawGate(ctx, cx, cy, mask, cell); break;
      case 'wait': drawWait(ctx, cx, cy, mask, cell); break;
    }
  }

  function drawLock(ctx, x, y, s) {
    ctx.fillStyle = COLORS.pale;
    rr(ctx, x - s, y - s * 0.2, s * 2, s * 1.5, s * 0.3); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y - s * 0.2, s * 0.65, Math.PI, 0); ctx.strokeStyle = COLORS.pale; ctx.lineWidth = Math.max(1.5, s * 0.35); ctx.stroke();
  }
  function drawBournBadge(ctx, x, y, s) {
    ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.strokeStyle = COLORS.violet; ctx.lineWidth = Math.max(1.5, s * 0.28); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x - s * 0.45, y + s * 0.45); ctx.lineTo(x + s * 0.45, y - s * 0.45);
    ctx.moveTo(x - s * 0.05, y - s * 0.45); ctx.lineTo(x + s * 0.45, y - s * 0.45); ctx.lineTo(x + s * 0.45, y + s * 0.05); ctx.stroke();
  }

  function drawLeak(ctx, cx, cy, cell) {
    const cs = S.L.cs, fs = labelFont(cs);
    const lk = cell.leak;
    // meter ring
    ctx.beginPath(); ctx.arc(cx, cy, cs * 0.4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lk);
    ctx.strokeStyle = 'rgba(40,204,255,0.8)'; ctx.lineWidth = Math.max(2, cs * 0.05); ctx.lineCap = 'round'; ctx.stroke();
    // crack marks
    if (lk > 0.05) {
      ctx.strokeStyle = COLORS.navy; ctx.lineWidth = Math.max(1.5, cs * 0.04);
      ctx.beginPath(); ctx.moveTo(cx - cs * 0.06, cy - cs * 0.2); ctx.lineTo(cx + cs * 0.02, cy - cs * 0.08); ctx.lineTo(cx - cs * 0.04, cy + cs * 0.02); ctx.stroke();
    }
    if (cell.patchFlash > 0) { ctx.beginPath(); ctx.arc(cx, cy, cs * 0.46, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,' + (cell.patchFlash * 3).toFixed(2) + ')'; ctx.lineWidth = 3; ctx.stroke(); }
    if (cs >= 30) pill(ctx, CONFIG.copy.leakLabel, cx, cy + cs * 0.34, Math.max(8, fs - 2), 'rgba(6,6,58,0.85)', COLORS.pale);
    if (lk > 0.3 && S.phase === 'flow') {
      const a = reduced ? 1 : 0.75 + 0.25 * Math.sin(S.t * 8);
      ctx.globalAlpha = a;
      pill(ctx, CONFIG.copy.leakTap, cx, cy - cs * 0.42, fs, COLORS.cyan, COLORS.navy);
      ctx.globalAlpha = 1;
    }
  }

  function drawGate(ctx, cx, cy, mask, cell) {
    const cs = S.L.cs, fs = labelFont(cs), st = gateState(cell);
    drawPipe(ctx, cx, cy, mask, st === 'open' ? cell : null, STYLE.locked);
    // timer ring
    let p = 0, ringColor = COLORS.mid, status = '';
    if (st === 'pending') { p = clamp(S.t / cell.opensAt, 0, 1); status = 'in ' + Math.ceil(cell.opensAt - S.t) + 's'; }
    else if (st === 'open') { p = 1 - (S.t - cell.opensAt) / cell.openFor; ringColor = COLORS.cyan; status = 'open ' + Math.ceil(cell.opensAt + cell.openFor - S.t) + 's'; }
    else { status = 'closed'; }
    ctx.beginPath(); ctx.arc(cx, cy, cs * 0.42, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(220,214,255,0.15)'; ctx.lineWidth = Math.max(2, cs * 0.05); ctx.stroke();
    if (p > 0) { ctx.beginPath(); ctx.arc(cx, cy, cs * 0.42, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); ctx.strokeStyle = ringColor; ctx.lineCap = 'round'; ctx.stroke(); }
    if (st !== 'open') {
      // gate bar across the pipe
      const horizontal = (cell.rot & 1) === 1;
      ctx.save(); ctx.translate(cx, cy); if (!horizontal) ctx.rotate(Math.PI / 2);
      rr(ctx, -cs * 0.06, -cs * 0.3, cs * 0.12, cs * 0.6, cs * 0.05);
      ctx.fillStyle = COLORS.mid; ctx.fill(); ctx.strokeStyle = COLORS.lavender; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
    }
    pill(ctx, CONFIG.copy.gateLabel, cx, cy - cs * 0.36, Math.max(8, fs - 2), 'rgba(6,6,58,0.85)', COLORS.pale);
    pill(ctx, status, cx, cy + cs * 0.36, Math.max(8, fs - 2), st === 'open' ? COLORS.cyan : 'rgba(6,6,58,0.85)', st === 'open' ? COLORS.navy : '#fff');
  }

  function drawWait(ctx, cx, cy, mask, cell) {
    const cs = S.L.cs, fs = labelFont(cs);
    if (S.t >= cell.opensAt) {
      drawPipe(ctx, cx, cy, mask, cell, STYLE.locked);
      return;
    }
    const days = Math.max(1, Math.ceil(cell.days * (1 - S.t / cell.opensAt)));
    const s = cs * 0.72, x = cx - s / 2, y = cy - s / 2;
    rr(ctx, x, y, s, s, cs * 0.1); ctx.fillStyle = COLORS.lavender; ctx.fill();
    ctx.save(); rr(ctx, x, y, s, s, cs * 0.1); ctx.clip();
    ctx.fillStyle = COLORS.violet; ctx.fillRect(x, y, s, s * 0.24); ctx.restore();
    ctx.fillStyle = COLORS.navy; ctx.font = '700 ' + Math.round(s * 0.36) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(days), cx, cy + s * 0.08);
    ctx.font = '400 ' + Math.max(7, Math.round(s * 0.15)) + 'px ' + FONT; ctx.fillStyle = COLORS.slate;
    ctx.fillText(CONFIG.copy.days, cx, cy + s * 0.36);
    // binder rings
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + s * 0.25, y - s * 0.05, s * 0.07, s * 0.16); ctx.fillRect(x + s * 0.68, y - s * 0.05, s * 0.07, s * 0.16);
    void fs;
  }

  function sourceGeom(s) {
    const L = S.L, cs = L.cs;
    const tw = cs * 0.85, th = cs * (s.small ? 1.05 : 1.5);
    const cy = L.oy + (s.row + 0.5) * cs;
    const x = L.ox - cs * 1.2;
    return { x, y: cy - th / 2, w: tw, h: th, cy };
  }

  function drawSources(ctx) {
    const L = S.L, cs = L.cs, fs = labelFont(cs);
    S.sources.forEach((s) => {
      const g = sourceGeom(s);
      const hasWater = s.T > 0.01 || (S.phase === 'flow' && s.active);
      const outlet = getCell(0, s.row);
      const connected = outlet && (maskOf(outlet) & 8);
      // outlet stub
      const sx = g.x + g.w - 2, ex = L.ox;
      ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(sx, g.cy); ctx.lineTo(ex, g.cy);
      ctx.strokeStyle = COLORS.pale; ctx.lineWidth = cs * 0.42; ctx.stroke();
      ctx.strokeStyle = COLORS.pipeInner; ctx.lineWidth = cs * 0.28; ctx.stroke();
      if (hasWater && S.phase !== 'build') {
        ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = cs * 0.2; ctx.stroke();
        if (connected || s.out > 0) {
          ctx.setLineDash([cs * 0.07, cs * 0.18]); ctx.lineDashOffset = -(s.capped ? S.dashSlow : S.dash) * cs;
          ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = Math.max(1.5, cs * 0.064); ctx.stroke(); ctx.setLineDash([]);
        }
      }
      // tank
      const dim = !s.active && s.T < 0.01;
      rr(ctx, g.x, g.y, g.w, g.h, cs * 0.18);
      ctx.fillStyle = '#0B0B40'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = dim ? 'rgba(220,214,255,0.4)' : COLORS.pale; ctx.stroke();
      const level = clamp(s.T / s.Tmax, 0, 1);
      if (level > 0.005) {
        ctx.save(); rr(ctx, g.x + 3, g.y + 3, g.w - 6, g.h - 6, cs * 0.14); ctx.clip();
        const wy = g.y + 3 + (g.h - 6) * (1 - level);
        const amp = reduced ? 0 : cs * 0.025;
        ctx.beginPath(); ctx.moveTo(g.x, g.y + g.h);
        for (let k = 0; k <= 12; k++) { const xx = g.x + (g.w * k) / 12; ctx.lineTo(xx, wy + Math.sin(S.t * 3 + k * 0.9) * amp); }
        ctx.lineTo(g.x + g.w, g.y + g.h); ctx.closePath();
        const grd = ctx.createLinearGradient(0, wy, 0, g.y + g.h);
        grd.addColorStop(0, '#5fdcff'); grd.addColorStop(1, '#1597c9');
        ctx.fillStyle = grd; ctx.fill();
        ctx.restore();
        // pound particles
        if (!reduced && !S.paused && level > 0.15 && Math.random() < 0.05) {
          S.particles.push({ type: 'pound', x: g.x + g.w * (0.3 + Math.random() * 0.4), y: g.y + g.h - cs * 0.12, vx: 0, vy: -cs * 0.3, life: Math.max(0.2, ((g.h - cs * 0.2) * level) / (cs * 0.3)), max: 1, s: cs * 0.17 });
        }
      }
      // £ marker on the tank front
      ctx.fillStyle = level > 0.45 ? 'rgba(6,6,58,0.75)' : 'rgba(220,214,255,0.7)';
      ctx.font = '700 ' + Math.round(cs * 0.3) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('£', g.x + g.w / 2, g.y + g.h * 0.62);
      // labels
      const label = s.late && S.level.sources.length > 1 ? CONFIG.copy.lateLabel : CONFIG.copy.sourceLabel;
      textLines(ctx, label, L.ox - cs * GUT / 2, g.y - fs * 1.7, fs, COLORS.lavender, 600, cs * GUT - 4);
      if (!s.active && s.delay > 0) {
        const left = S.phase === 'build' ? Math.ceil(s.delay) : Math.ceil(s.delay - (S.t - S.flowStart));
        pill(ctx, CONFIG.copy.dueIn + ' ' + left + 's', g.x + g.w / 2, g.y + g.h + fs * 0.9, Math.max(8, fs - 2), 'rgba(6,6,58,0.9)', COLORS.pale);
      } else if (S.phase === 'flow' && level > 0.9 && s.capped) {
        pill(ctx, CONFIG.copy.backingUp, g.x + g.w / 2, g.y + g.h + fs * 0.9, Math.max(8, fs - 2), COLORS.lavender, COLORS.navy);
      }
    });
  }

  function drawDest(ctx) {
    const L = S.L, cs = L.cs, fs = labelFont(cs), N = S.N, lv = S.level;
    const cy = L.oy + (lv.dest.row + 0.5) * cs;
    const bx = L.ox + N * cs + cs * 0.36, bw = cs * 0.66, bh = cs * 1.25, by = cy - bh * 0.55;
    // inlet stub
    ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(L.ox + N * cs, cy); ctx.lineTo(bx + 2, cy);
    ctx.strokeStyle = COLORS.pale; ctx.lineWidth = cs * 0.42; ctx.stroke();
    ctx.strokeStyle = COLORS.pipeInner; ctx.lineWidth = cs * 0.28; ctx.stroke();
    if (S.destReached) {
      ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = cs * 0.2; ctx.stroke();
      ctx.setLineDash([cs * 0.07, cs * 0.18]); ctx.lineDashOffset = -S.dash * cs;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = Math.max(1.5, cs * 0.064); ctx.stroke(); ctx.setLineDash([]);
    }
    // building
    if (S.destReached && !reduced) {
      rr(ctx, bx - 4, by - 4, bw + 8, bh + 8, cs * 0.16); ctx.fillStyle = 'rgba(40,204,255,' + (0.18 + 0.08 * Math.sin(S.t * 4)).toFixed(2) + ')'; ctx.fill();
    }
    rr(ctx, bx, by, bw, bh, cs * 0.12); ctx.fillStyle = COLORS.violet; ctx.fill();
    ctx.fillStyle = COLORS.lavender;
    const ws = bw * 0.2;
    for (let k = 0; k < 3; k++) for (let j = 0; j < 2; j++) {
      ctx.globalAlpha = S.destReached ? 1 : 0.55;
      rr(ctx, bx + bw * 0.2 + j * bw * 0.4, by + bh * 0.14 + k * bh * 0.24, ws, ws, 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // mini gauge
    const gx = bx + bw + cs * 0.08, gw = cs * 0.13, gh = bh;
    rr(ctx, gx, by, gw, gh, gw / 2); ctx.fillStyle = '#15155E'; ctx.fill(); ctx.strokeStyle = 'rgba(220,214,255,0.5)'; ctx.lineWidth = 1; ctx.stroke();
    const p = clamp(S.gauge / lv.gauge.target, 0, 1);
    if (p > 0) { ctx.save(); rr(ctx, gx, by, gw, gh, gw / 2); ctx.clip(); ctx.fillStyle = COLORS.cyan; ctx.fillRect(gx, by + gh * (1 - p), gw, gh * p); ctx.restore(); }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    CONFIG.copy.markerAt.forEach((m) => { const yy = by + gh * (1 - m); ctx.beginPath(); ctx.moveTo(gx - 2, yy); ctx.lineTo(gx + gw + 2, yy); ctx.stroke(); });
    textLines(ctx, CONFIG.copy.destLabel, L.ox + N * cs + cs * GUT / 2, by - fs * 1.7, fs, COLORS.lavender, 600, cs * GUT - 4);
  }

  function edgePoint(c, r, d) {
    const L = S.L, cs = L.cs;
    if (c === -1) return { x: L.ox, y: L.oy + (r + 0.5) * cs };
    return { x: L.ox + (c + 0.5 + DX[d] * 0.5) * cs, y: L.oy + (r + 0.5 + DY[d] * 0.5) * cs };
  }

  function drawSpills(ctx) {
    const cs = S.L.cs;
    S.spills.forEach((sp) => {
      const p = edgePoint(sp.c, sp.r, sp.d);
      const rad = cs * (0.16 + Math.min(0.12, sp.flow * 0.03)) * (reduced ? 1 : 1 + 0.12 * Math.sin(S.t * 9 + sp.c));
      ctx.beginPath(); ctx.ellipse(p.x, p.y, rad * 1.3, rad, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(40,204,255,0.35)'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(p.x, p.y, rad * 0.7, rad * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(40,204,255,0.8)'; ctx.fill();
    });
  }

  function spawnEffects(dt) {
    if (reduced) return;
    const cs = S.L.cs;
    S.spills.forEach((sp) => {
      if (Math.random() < Math.min(1, sp.flow * dt * 5)) {
        const p = edgePoint(sp.c, sp.r, sp.d);
        const dir = sp.c === -1 ? 1 : sp.d;
        S.particles.push({ type: 'drop', x: p.x, y: p.y, vx: (DX[dir] * 0.8 + (Math.random() - 0.5)) * cs, vy: (DY[dir] * 0.8 - 0.6 - Math.random() * 0.4) * cs, g: cs * 3, life: 0.6, max: 0.6, s: cs * 0.05 });
      }
    });
    (S.leakCells || []).forEach((lc) => {
      if (Math.random() < lc.w * dt * 6) {
        const c = lc.k % S.N, r = (lc.k / S.N) | 0;
        const x = S.L.ox + (c + 0.5) * cs + (Math.random() - 0.5) * cs * 0.2, y = S.L.oy + (r + 0.5) * cs;
        S.particles.push({ type: 'drop', x, y, vx: (Math.random() - 0.5) * cs * 0.4, vy: -cs * 0.3, g: cs * 3, life: 0.55, max: 0.55, s: cs * 0.045 });
      }
    });
    if (S.particles.length > 160) S.particles.splice(0, S.particles.length - 160);
  }

  function updateParticles(dt) {
    const ps = S.particles;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life -= dt;
      if (p.life <= 0) { ps.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy += p.g * dt;
    }
  }
  function drawParticles(ctx) {
    if (reduced) return;
    S.particles.forEach((p) => {
      if (p.type === 'pound') {
        ctx.globalAlpha = Math.min(0.55, p.life * 2);
        ctx.fillStyle = '#fff'; ctx.font = '700 ' + Math.round(p.s) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('£', p.x, p.y);
      } else {
        ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
        ctx.fillStyle = COLORS.cyan; ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1.5, p.s), 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  }

  function drawLabels(ctx) {
    const L = S.L, cs = L.cs, fs = labelFont(cs);
    if (S.bottleneck && S.bottleneckIdx >= 0) {
      const c = S.bottleneckIdx % S.N, r = (S.bottleneckIdx / S.N) | 0;
      const x = L.ox + (c + 0.5) * cs, y = L.oy + r * cs - fs * 0.6;
      const a = reduced ? 1 : 0.8 + 0.2 * Math.sin(S.t * 5);
      ctx.globalAlpha = a;
      pill(ctx, CONFIG.copy.bottleneck, x, y, fs, COLORS.lavender, COLORS.navy);
      ctx.globalAlpha = 1;
      // squeeze marks either side of the narrow pipe
      ctx.strokeStyle = COLORS.lavender; ctx.lineWidth = 2; ctx.lineCap = 'round';
      const cy = L.oy + (r + 0.5) * cs;
      ctx.beginPath();
      ctx.moveTo(x - cs * 0.28, cy - cs * 0.24); ctx.lineTo(x - cs * 0.12, cy - cs * 0.12);
      ctx.moveTo(x - cs * 0.28, cy + cs * 0.24); ctx.lineTo(x - cs * 0.12, cy + cs * 0.12);
      ctx.stroke();
    }
    if (S.floatLabel) {
      const f = S.floatLabel;
      const x = L.ox + (f.c + 0.5) * cs, y = L.oy + f.r * cs - fs * 1.2 - (reduced ? 0 : Math.min(1, (S.t - (f.until - 4.5)) * 2) * cs * 0.15);
      pill(ctx, f.text, x, y, fs, COLORS.violet, '#fff', L.ox + S.N * cs);
    }
  }

  function drawCursor(ctx) {
    const L = S.L, cs = L.cs;
    const target = S.kbd ? S.cursor : S.hover;
    if (!target || S.phase === 'done') return;
    const { c, r } = target;
    const cell = getCell(c, r);
    if (!cell) return;
    const x = L.ox + c * cs, y = L.oy + r * cs;
    if (cell.kind === 'empty' && PIECES[S.tool]) {
      drawPipe(ctx, x + cs / 2, y + cs / 2, rotMask(PIECES[S.tool], S.rot), null, STYLE.ghost);
    } else if (cell.kind === 'empty' && S.tool === 'bourn' && S.bournUnlocked && S.bournLeft > 0) {
      drawPipe(ctx, x + cs / 2, y + cs / 2, rotMask(PIECES.straight, S.rot & 1), null, { outer: 0.36, inner: 0.25, water: 0.18, shell: 'rgba(57,25,247,0.6)' });
    }
    if (S.kbd) {
      rr(ctx, x + 1, y + 1, cs - 2, cs - 2, cs * 0.18);
      ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = 3; ctx.stroke();
      rr(ctx, x - 2, y - 2, cs + 4, cs + 4, cs * 0.2);
      ctx.strokeStyle = 'rgba(40,204,255,0.35)'; ctx.lineWidth = 3; ctx.stroke();
    } else {
      rr(ctx, x + 2, y + 2, cs - 4, cs - 4, cs * 0.16);
      ctx.strokeStyle = 'rgba(220,214,255,0.5)'; ctx.lineWidth = 2; ctx.stroke();
    }
  }

  /* =====================================================================
     HUD AND TRAY
     ===================================================================== */
  function setText(id, val) {
    if (S.hud[id] === val) return;
    S.hud[id] = val;
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function updateLevelTitle() {
    setText('hud-level-num', 'Level ' + (S.levelIndex + 1) + ' of ' + CONFIG.levels.length);
    setText('hud-level-name', S.level.name);
  }

  function buildGaugeMarkers() {
    const box = $('#gauge-markers');
    box.innerHTML = '';
    CONFIG.copy.markers.forEach((name, i) => {
      const m = document.createElement('div');
      m.className = 'gauge-marker';
      m.style.left = (CONFIG.copy.markerAt[i] * 100) + '%';
      const sp = document.createElement('span'); sp.textContent = name;
      m.appendChild(sp); box.appendChild(m);
    });
  }

  function updateHUD() {
    const lv = S.level;
    if (!lv) return;
    const timerEl = $('#hud-timer');
    let left;
    if (S.phase === 'build') {
      setText('hud-timer-label', CONFIG.copy.waterStarts);
      left = Math.max(0, Math.ceil(lv.buildTime - S.t));
      setText('hud-timer-value', left + 's');
    } else {
      setText('hud-timer-label', CONFIG.copy.timeLeft);
      left = Math.max(0, Math.ceil(lv.levelTime - (S.t - S.flowStart)));
      setText('hud-timer-value', Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'));
    }
    const urgent = left <= 5;
    if (S.hud.urgent !== urgent) { S.hud.urgent = urgent; timerEl.classList.toggle('urgent', urgent); }
    const flowBtn = $('#btn-flow-now');
    const showBtn = S.phase === 'build';
    if (S.hud.flowBtn !== showBtn) { S.hud.flowBtn = showBtn; flowBtn.hidden = !showBtn; }

    const p = clamp(S.gauge / lv.gauge.target, 0, 1);
    const pr = Math.round(p * 1000) / 1000;
    if (S.hud.p !== pr) {
      S.hud.p = pr;
      $('#gauge-fill').style.transform = 'scaleX(' + pr + ')';
      const pct = Math.round(p * 100);
      $('#gauge').setAttribute('aria-valuenow', String(pct));
      const marks = document.querySelectorAll('.gauge-marker');
      let next = null;
      CONFIG.copy.markerAt.forEach((m, i) => {
        const reached = p >= m - 1e-6;
        marks[i] && marks[i].classList.toggle('reached', reached);
        if (!reached && next === null) next = CONFIG.copy.markers[i];
      });
      setText('gauge-status', next ? CONFIG.copy.nextMarker + next : CONFIG.copy.allMarkers);
    }
    const spilling = S.phase === 'flow' && S.spillFlow + S.leakFlow > 0.05;
    if (S.hud.spilling !== spilling) { S.hud.spilling = spilling; $('#gauge').classList.toggle('spilling', spilling); }
  }

  function pieceSVG(kind, rot) {
    const paths = {
      straight: 'M20 2V38',
      corner: 'M20 2A18 18 0 0 0 38 20',
      tee: 'M20 2V38M20 20H38'
    };
    const d = paths[kind];
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="rotate(' + (rot * 90) + ' 20 20)">' +
      '<path d="' + d + '" fill="none" stroke="#DCD6FF" stroke-width="13"/>' +
      '<path d="' + d + '" fill="none" stroke="#0B0B40" stroke-width="7"/></g></svg>';
  }
  function bournSVG(rot) {
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="rotate(' + ((rot & 1) * 90) + ' 20 20)">' +
      '<path d="M20 2V38" stroke="#7B6FE8" stroke-opacity=".6" stroke-width="20"/><path d="M20 2V38" stroke="#fff" stroke-width="14"/>' +
      '<path d="M20 2V38" stroke="#28CCFF" stroke-width="7"/></g>' +
      '<circle cx="31" cy="9" r="7" fill="#fff"/><path d="M28 12l6-6m-4 0h4v4" fill="none" stroke="#3919F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function buildTray(fresh) {
    const tray = $('#tray');
    const lv = S.level;
    const focusedTool = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.tool : null;
    tray.innerHTML = '';
    const mk = (tool, label, svg, key, cls) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tool ' + (cls || ''); b.dataset.tool = tool;
      b.innerHTML = '<span class="key" aria-hidden="true">' + key + '</span>' + svg + '<span class="lbl"></span>';
      b.querySelector('.lbl').textContent = label;
      if (tool !== 'rotate') b.setAttribute('aria-pressed', String(S.tool === tool));
      tray.appendChild(b);
      return b;
    };
    ['straight', 'corner', 'tee'].forEach((p, i) => {
      const b = mk(p, PIECE_NAMES[p], pieceSVG(p, S.rot), String(i + 1));
      b.setAttribute('aria-label', PIECE_NAMES[p] + ' pipe, turned ' + (S.rot * 90) + ' degrees');
    });
    if (lv && lv.bourn.count > 0) {
      const b = mk('bourn', CONFIG.copy.bournTool, bournSVG(S.rot), '4', 'tool-bourn' + (S.bournUnlocked ? '' : ' locked') + (fresh ? ' fresh' : ''));
      const cnt = document.createElement('span'); cnt.className = 'count'; cnt.textContent = 'x' + S.bournLeft; b.appendChild(cnt);
      if (!S.bournUnlocked) { const sub = document.createElement('span'); sub.className = 'sub'; sub.textContent = 'Locked'; b.appendChild(sub); }
      b.setAttribute('aria-label', CONFIG.copy.bournTool + ', ' + S.bournLeft + ' left' + (S.bournUnlocked ? '. Limit grows with your invoices.' : ', locked'));
      if (S.bournLeft <= 0) b.disabled = true;
    }
    mk('remove', 'Remove', '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M12 12l16 16M28 12L12 28" stroke="#DCD6FF" stroke-width="4" stroke-linecap="round"/></svg>', '5');
    const rb = mk('rotate', 'Rotate', '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M30 20a10 10 0 1 1-3-7" fill="none" stroke="#28CCFF" stroke-width="4" stroke-linecap="round"/><path d="M29 6v8h-8" fill="none" stroke="#28CCFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>', 'R');
    rb.setAttribute('aria-label', 'Rotate the selected pipe');
    if (focusedTool) { const el = tray.querySelector('[data-tool="' + focusedTool + '"]'); if (el) el.focus(); }
  }

  let toastTimer = 0;
  function toast(text, kind, ms) {
    const el = $('#toast');
    el.textContent = text;
    el.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'toast' + (kind ? ' ' + kind : ''); }, ms || 2600);
  }
  function announce(text) {
    const el = $('#sr-live');
    el.textContent = '';
    setTimeout(() => { el.textContent = text; }, 30);
  }

  /* =====================================================================
     INPUT
     ===================================================================== */
  function cellFromEvent(e) {
    const rect = S.canvas.getBoundingClientRect(), L = S.L;
    if (!L) return null;
    const x = (e.clientX - rect.left) * (L.w / rect.width), y = (e.clientY - rect.top) * (L.h / rect.height);
    const c = Math.floor((x - L.ox) / L.cs), r = Math.floor((y - L.oy) / L.cs);
    if (c < 0 || r < 0 || c >= S.N || r >= S.N) return null;
    return { c, r };
  }

  function bindInput() {
    const cv = S.canvas;
    let down = null, pressTimer = 0;
    cv.addEventListener('pointerdown', (e) => {
      if (e.button === 2) return;
      Sound.ensure();
      const cell = cellFromEvent(e);
      down = cell ? { c: cell.c, r: cell.r, id: e.pointerId, long: false } : null;
      S.kbd = false;
      clearTimeout(pressTimer);
      if (down && e.pointerType !== 'mouse') {
        pressTimer = setTimeout(() => { if (down) { down.long = true; removeAt(down.c, down.r); } }, 550);
      }
    });
    cv.addEventListener('pointerup', (e) => {
      clearTimeout(pressTimer);
      if (!down || e.button === 2) return;
      const cell = cellFromEvent(e);
      if (cell && cell.c === down.c && cell.r === down.r && !down.long) {
        S.cursor = { c: cell.c, r: cell.r };
        actAt(cell.c, cell.r);
      }
      down = null;
    });
    cv.addEventListener('pointercancel', () => { clearTimeout(pressTimer); down = null; });
    cv.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse') S.hover = cellFromEvent(e);
      if (down) { const cell = cellFromEvent(e); if (!cell || cell.c !== down.c || cell.r !== down.r) clearTimeout(pressTimer); }
    });
    cv.addEventListener('pointerleave', () => { S.hover = null; });
    cv.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const cell = cellFromEvent(e);
      if (cell) removeAt(cell.c, cell.r);
    });
    cv.addEventListener('focus', () => { if (!S.hover) S.kbd = true; });
    cv.addEventListener('blur', () => { S.kbd = false; });

    $('#tray').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-tool]');
      if (!b || b.disabled) return;
      Sound.ensure();
      const tool = b.dataset.tool;
      if (tool === 'rotate') rotateTray(); else selectTool(tool);
    });

    document.addEventListener('keydown', (e) => {
      if (S.screen !== 'game') {
        if (e.key === 'Escape' && S.screen === 'pause') { e.preventDefault(); resume(); }
        return;
      }
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const onBoard = document.activeElement === S.canvas;
      const k = e.key;
      const moves = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      if (moves[k]) {
        e.preventDefault();
        if (!onBoard) S.canvas.focus();
        S.kbd = true; S.hover = null;
        S.cursor.c = clamp(S.cursor.c + moves[k][0], 0, S.N - 1);
        S.cursor.r = clamp(S.cursor.r + moves[k][1], 0, S.N - 1);
        announceCell();
        return;
      }
      if (k === 'Escape' || k === 'p' || k === 'P') { e.preventDefault(); pause(); return; }
      if (k === 'r' || k === 'R') {
        e.preventDefault();
        const cell = onBoard ? getCell(S.cursor.c, S.cursor.r) : null;
        if (cell && (cell.kind === 'pipe' || (cell.kind === 'bourn' && !cell.locked))) rotateCell(cell); else rotateTray();
        return;
      }
      if (k >= '1' && k <= '5') {
        e.preventDefault();
        const tools = ['straight', 'corner', 'tee', 'bourn', 'remove'];
        selectTool(tools[+k - 1]);
        return;
      }
      if (k === 'f' || k === 'F') { e.preventDefault(); startFlow(true); return; }
      if (!onBoard) return;
      if (k === 'Enter' || k === ' ') { e.preventDefault(); Sound.ensure(); actAt(S.cursor.c, S.cursor.r); announceCell(); return; }
      if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); removeAt(S.cursor.c, S.cursor.r); return; }
    });
  }

  function describeCell(cell) {
    const m = shapeMask(cell);
    const open = DIR_NAMES.filter((_, d) => m & (1 << d)).join(' and ');
    switch (cell.kind) {
      case 'empty': return 'empty';
      case 'wall': return 'blocked';
      case 'pipe': return PIECE_NAMES[cell.piece] + ' pipe open ' + open + (cell.fill >= 1 ? ', full of water' : '');
      case 'fixed': return 'overdraft pipe, fixed limit, open ' + open;
      case 'bourn': return 'Bourn pipe, limit grows with your invoices, open ' + open;
      case 'gate': return 'annual review gate, ' + gateState(cell);
      case 'wait': return S.t >= cell.opensAt ? '60-day wait, now open ' + open : '60-day wait, closed';
      case 'leak': return 'leaking upload pipe, ' + Math.round(cell.leak * 100) + ' percent leak, press Enter to patch';
    }
    return '';
  }
  function announceCell() {
    const cell = getCell(S.cursor.c, S.cursor.r);
    if (cell) announce('Row ' + (S.cursor.r + 1) + ', column ' + (S.cursor.c + 1) + ': ' + describeCell(cell));
  }

  /* =====================================================================
     SCREENS
     ===================================================================== */
  const OVERLAYS = ['intro', 'complete', 'over', 'pause'];
  function showScreen(name) {
    S.screen = name;
    document.querySelectorAll('.screen').forEach((el) => { el.hidden = el.dataset.screen !== name; });
    $('#game').hidden = !(name === 'game' || OVERLAYS.includes(name));
    if (name === 'game') { requestAnimationFrame(() => { layout(); S.canvas.focus({ preventScroll: true }); S.kbd = false; }); }
    else {
      const scr = document.querySelector('.screen[data-screen="' + name + '"]');
      const first = scr && scr.querySelector('.btn-primary, button, a');
      if (first) setTimeout(() => first.focus({ preventScroll: true }), 30);
    }
  }

  function showIntro(i) {
    setupLevel(i);
    const lv = CONFIG.levels[i];
    $('#intro-num').textContent = 'Level ' + (i + 1) + ' of ' + CONFIG.levels.length;
    $('#intro-title').textContent = lv.name;
    $('#intro-line').textContent = lv.intro;
    const nw = $('#intro-new');
    if (lv.newThing) { nw.innerHTML = lv.newThing; nw.hidden = false; } else nw.hidden = true;
    $('#intro-hint').textContent = lv.hint || '';
    showScreen('intro');
  }

  function beginLevel() {
    S.paused = false;
    showScreen('game');
    if (S.level.hint) setTimeout(() => { if (S.screen === 'game' && S.phase === 'build') toast(S.level.hint, null, 4000); }, 300);
  }

  function starsSVG(n, total, dark) {
    let out = '';
    const onCol = dark ? '#28CCFF' : '#3919F7', offCol = dark ? '#DCD6FF' : '#7B6FE8';
    for (let i = 0; i < total; i++) {
      const on = i < n;
      out += '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="' +
        (on ? onCol : 'none') + '" stroke="' + (on ? onCol : offCol) + '" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    }
    return out;
  }

  function showComplete() {
    const r = S.result, i = S.levelIndex;
    $('#complete-num').textContent = 'Level ' + (i + 1) + ': ' + S.level.name;
    const st = $('#complete-stars');
    st.innerHTML = starsSVG(r.stars, 3);
    st.setAttribute('role', 'img'); st.setAttribute('aria-label', r.stars + ' out of 3 stars');
    const rows = [['Time left bonus', '+' + r.pTime], ['Flow delivered', '+' + r.pFlow], ['Spilled', '-' + r.pSpill]];
    if (r.skip) rows.push(['Early start bonus', '+' + r.skip]);
    rows.push(['Level score', String(r.score)]);
    const dl = $('#complete-breakdown'); dl.innerHTML = '';
    rows.forEach(([a, b], k) => {
      const dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = a; dd.textContent = b;
      if (k === rows.length - 1) { dt.className = 'total'; dd.className = 'total'; }
      dl.appendChild(dt); dl.appendChild(dd);
    });
    let msg = CONFIG.copy.complete[Math.min(r.stars, 3) - 1];
    if (S.level.fixedPipe && S.bournUsed) msg += ' ' + CONFIG.copy.bournReplaced + '.';
    $('#complete-msg').textContent = msg;
    $('#btn-next').textContent = i === CONFIG.levels.length - 1 ? 'See your results' : 'Next level';
    showScreen('complete');
  }

  function showOver() {
    const lv = S.level;
    $('#over-num').textContent = 'Level ' + (S.levelIndex + 1) + ': ' + lv.name;
    $('#over-reason').textContent = CONFIG.copy.over[S.result.reason] || CONFIG.copy.over.time;
    let tip = CONFIG.copy.tips.general;
    if (lv.fixedPipe && !S.bournUsed && S.bottleneckTime > 2) tip = CONFIG.copy.tips.bourn;
    else if ((lv.leaks || []).length && S.spilled > S.delivered * 0.4) tip = CONFIG.copy.tips.leak;
    else if (S.spilled > S.delivered * 0.4) tip = CONFIG.copy.tips.spill;
    else if ((lv.gates || []).length) tip = CONFIG.copy.tips.gate;
    const t = $('#over-tip'); t.textContent = tip; t.hidden = false;
    showScreen('over');
  }

  function showFinal() {
    const total = S.run.scores.reduce((a, b) => a + (b || 0), 0);
    const stars = S.run.stars.reduce((a, b) => a + (b || 0), 0);
    $('#final-score').textContent = String(total);
    const fs = $('#final-stars');
    fs.innerHTML = starsSVG(stars, CONFIG.levels.length * 3, true);
    fs.setAttribute('role', 'img'); fs.setAttribute('aria-label', stars + ' out of ' + (CONFIG.levels.length * 3) + ' stars');
    S.finalTotal = total; S.finalStars = stars; S.savedId = null;
    const form = $('#lb-form');
    form.reset();
    Array.from(form.elements).forEach((el) => { el.disabled = false; });
    setMsg('', false);
    renderLeaderboard();
    showScreen('final');
  }

  function pause() {
    if (S.screen !== 'game' || S.phase === 'done') return;
    S.paused = true;
    showScreen('pause');
  }
  function resume() {
    S.paused = false;
    showScreen('game');
  }

  /* ---------- Leaderboard ---------- */
  function renderLeaderboard() {
    const list = $('#lb-list');
    const rows = store.get(CONFIG.storageKeys.leaderboard, []);
    list.innerHTML = '';
    if (!Array.isArray(rows) || !rows.length) {
      const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'No scores yet. Be the first.'; list.appendChild(li);
      return;
    }
    rows.slice(0, 10).forEach((row) => {
      const li = document.createElement('li');
      if (row.id && row.id === S.savedId) li.className = 'me';
      const n = document.createElement('span'); n.className = 'n'; n.textContent = String(row.name || 'Player');
      const s = document.createElement('span'); s.className = 's'; s.textContent = String(row.score | 0);
      li.appendChild(n); li.appendChild(s); list.appendChild(li);
    });
  }
  function setMsg(text, isError) {
    const m = $('#lb-msg');
    m.textContent = text;
    m.classList.toggle('error', !!isError);
  }
  function onSaveScore(e) {
    e.preventDefault();
    const name = $('#lb-name').value.trim().replace(/\s+/g, ' ').slice(0, 20);
    const email = $('#lb-email').value.trim();
    const consent = $('#lb-consent').checked;
    if (!name) { setMsg('Add a display name to save your score.', true); $('#lb-name').focus(); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMsg('That email address doesn\'t look right.', true); $('#lb-email').focus(); return; }
    if (email && !consent) { setMsg('Tick the box if you\'d like your Flow Check results by email, or clear the email field.', true); $('#lb-consent').focus(); return; }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const rows = store.get(CONFIG.storageKeys.leaderboard, []);
    const list = Array.isArray(rows) ? rows : [];
    list.push({ id, name, score: S.finalTotal, stars: S.finalStars, date: new Date().toISOString() });
    list.sort((a, b) => b.score - a.score);
    const okBoard = store.set(CONFIG.storageKeys.leaderboard, list.slice(0, 50));
    S.savedId = id;

    let msg = okBoard ? 'Score saved on this device.' : 'Your browser blocked local storage, so the score could not be saved.';
    if (email && consent) {
      const lead = { name, email, consent: true, score: S.finalTotal, stars: S.finalStars, createdAt: new Date().toISOString(), source: 'keep-it-flowing' };
      const leads = store.get(CONFIG.storageKeys.leads, []);
      const ll = Array.isArray(leads) ? leads : [];
      ll.push(lead);
      store.set(CONFIG.storageKeys.leads, ll);
      submitLead(lead).catch(() => {});
      msg += ' Your email is stored on this device only for now.';
    }
    setMsg(msg, !okBoard);
    Array.from($('#lb-form').elements).forEach((el) => { el.disabled = true; });
    renderLeaderboard();
  }

  /* ---------- Sound toggle ---------- */
  function setSound(on) {
    Sound.on = !!on;
    document.querySelectorAll('[data-sound-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(Sound.on)));
    document.querySelectorAll('[data-sound-label]').forEach((s) => { s.textContent = Sound.on ? 'Sound on' : 'Sound off'; });
    store.set(CONFIG.storageKeys.settings, { sound: Sound.on });
    if (Sound.on) Sound.blip(660, 0.08, 'sine', 0.06);
  }

  /* =====================================================================
     BOOT
     ===================================================================== */
  function renderLogos() {
    document.querySelectorAll('[data-logo]').forEach((slot) => {
      slot.innerHTML = '';
      if (LOGO_SRC) {
        const img = document.createElement('img');
        img.src = LOGO_SRC; img.alt = 'Bourn';
        img.onerror = () => { slot.innerHTML = ''; slot.appendChild(wordmark()); };
        slot.appendChild(img);
      } else slot.appendChild(wordmark());
    });
    function wordmark() { const s = document.createElement('span'); s.className = 'wordmark'; s.textContent = 'bourn'; s.setAttribute('aria-label', 'Bourn'); s.setAttribute('role', 'img'); return s; }
  }

  function fillCopy() {
    document.querySelectorAll('[data-copy]').forEach((el) => { const v = CONFIG.copy[el.dataset.copy]; if (typeof v === 'string') el.textContent = v; });
    $('#cta-link').href = CONFIG.urls.flowCheck;
    const steps = $('#howto-steps');
    steps.innerHTML = '';
    CONFIG.copy.howTo.forEach((s) => {
      const li = document.createElement('li');
      const img = document.createElement('img'); img.src = s.img; img.alt = ''; img.width = 240; img.height = 150;
      const div = document.createElement('div');
      const strong = document.createElement('strong'); strong.textContent = s.title;
      const p = document.createElement('p'); p.textContent = s.text;
      div.appendChild(strong); div.appendChild(p); li.appendChild(img); li.appendChild(div); steps.appendChild(li);
    });
  }

  function newRun() {
    S.run = { scores: [], stars: [] };
    showIntro(0);
  }

  function boot() {
    S.canvas = $('#board');
    S.ctx = S.canvas.getContext('2d');
    renderLogos();
    fillCopy();
    bindInput();
    const settings = store.get(CONFIG.storageKeys.settings, {});
    setSound(false);
    if (settings && settings.sound) { Sound.on = true; setSound(true); }

    $('#btn-play').addEventListener('click', newRun);
    $('#btn-howto').addEventListener('click', () => showScreen('howto'));
    $('#btn-howto-play').addEventListener('click', newRun);
    $('#btn-intro-go').addEventListener('click', beginLevel);
    $('#btn-next').addEventListener('click', () => {
      if (S.levelIndex >= CONFIG.levels.length - 1) showFinal(); else showIntro(S.levelIndex + 1);
    });
    $('#btn-replay').addEventListener('click', () => showIntro(S.levelIndex));
    $('#btn-retry').addEventListener('click', () => showIntro(S.levelIndex));
    $('#btn-again').addEventListener('click', newRun);
    $('#btn-resume').addEventListener('click', resume);
    $('#btn-restart').addEventListener('click', () => showIntro(S.levelIndex));
    $('#btn-pause').addEventListener('click', pause);
    $('#btn-flow-now').addEventListener('click', () => { startFlow(true); S.canvas.focus({ preventScroll: true }); });
    document.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => { S.paused = false; showScreen(b.dataset.goto); }));
    document.querySelectorAll('[data-sound-toggle]').forEach((b) => b.addEventListener('click', () => setSound(!Sound.on)));
    $('#lb-form').addEventListener('submit', onSaveScore);

    document.addEventListener('visibilitychange', () => { if (document.hidden && S.screen === 'game' && S.phase !== 'done') pause(); });
    if (window.ResizeObserver) new ResizeObserver(() => { if (S.level) layout(); }).observe($('#board-wrap'));
    window.addEventListener('resize', () => { if (S.level) layout(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (S.level) buildBackground(); }).catch(() => {});

    showScreen('start');
    let last = performance.now();
    function frame(now) {
      let dt = Math.min(0.05, Math.max(0, (now - last) / 1000)) * TIME_SCALE;
      last = now;
      if (S.screen === 'game' && !S.paused && S.phase !== 'done' && S.level) {
        while (dt > 0) { const step = Math.min(dt, 0.05); update(step); dt -= step; }
        updateHUD();
      } else if (S.phase === 'done' && S.screen === 'game') {
        updateParticles(dt);
      }
      if (!$('#game').hidden && S.level) render();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // Read-only hook for automated testing.
    window.__KIF = {
      state: S, config: CONFIG,
      cellCenter(c, r) {
        const rect = S.canvas.getBoundingClientRect(), L = S.L;
        return { x: rect.left + (L.ox + (c + 0.5) * L.cs) * (rect.width / L.w), y: rect.top + (L.oy + (r + 0.5) * L.cs) * (rect.height / L.h) };
      },
      mask(c, r) { const cell = getCell(c, r); return cell ? shapeMask(cell) : 0; }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
