let ELEMENTS = [
  { key: "water",  name: "WATER",  color: "#4fb3ff" },
  { key: "forest", name: "FOREST", color: "#1fa64d" },
  { key: "desert", name: "DESERT", color: "#e6c56a" },
  { key: "rock",   name: "ROCK",   color: "#7f93a8" },
  { key: "mud",    name: "MUD",    color: "#7a5a3a" },
  { key: "ice",    name: "ICE",    color: "#b9f0ff" },
  { key: "lava",   name: "LAVA",   color: "#ff5b3a" }
];

const UI = {
  sliders: document.getElementById("sliders"),
  selectedName: document.getElementById("selectedName"),
  selectedVal: document.getElementById("selectedVal"),
  seedInput: document.getElementById("seedInput"),
  reroll: document.getElementById("reroll"),
  canvas: document.getElementById("planet"),
  rotSpeed: document.getElementById("rotSpeed"),
  captureBtn: document.getElementById("captureBtn"),
  planetPanel: document.querySelector(".planet-panel"),
  controlsPanel: document.querySelector(".controls"),
  undoBtn: document.getElementById("undoBtn"),
  redoBtn: document.getElementById("redoBtn")
};

// --- HISTORY STATE MANAGEMENT ---
let undoStack = [];
let redoStack = [];
let isRestoringState = false; // Flag to ignore events during undo/redo

function getCurrentState() {
  return {
    seed: planetSeed,
    // Deep copy elements array because order changes
    elements: JSON.parse(JSON.stringify(ELEMENTS)),
    // Deep copy values object
    values: { ...values }
  };
}

function saveState() {
  if (isRestoringState) return;

  const state = getCurrentState();
  
  // If stack is not empty, check if state actually changed to avoid duplicates
  if (undoStack.length > 0) {
    const last = undoStack[undoStack.length - 1];
    if (JSON.stringify(last) === JSON.stringify(state)) return;
  }

  undoStack.push(state);
  redoStack = []; // Clear redo stack on new action
  updateUndoRedoUI();
}

function restoreState(state) {
  isRestoringState = true;

  // Restore Seed
  planetSeed = state.seed;
  UI.seedInput.value = planetSeed; // Update Input UI

  // Restore Elements Order
  ELEMENTS = JSON.parse(JSON.stringify(state.elements));

  // Restore Values
  values = { ...state.values };

  // Rebuild UI
  buildSliders(); // This will respect the new order in ELEMENTS
  refreshUIValues();
  rebuildTileFromValuesFast();

  isRestoringState = false;
}

function performUndo() {
  if (undoStack.length === 0) return;

  // Save current state to redo stack before undoing
  redoStack.push(getCurrentState());

  const prevState = undoStack.pop();
  restoreState(prevState);
  updateUndoRedoUI();
}

function performRedo() {
  if (redoStack.length === 0) return;

  // Save current state to undo stack before redoing
  undoStack.push(getCurrentState());

  const nextState = redoStack.pop();
  restoreState(nextState);
  updateUndoRedoUI();
}

function updateUndoRedoUI() {
  UI.undoBtn.disabled = undoStack.length === 0;
  UI.redoBtn.disabled = redoStack.length === 0;
}

// --- INTERACTION SETTINGS ---
document.addEventListener('contextmenu', event => {
  if (event.target !== UI.seedInput) {
    event.preventDefault();
  }
});

document.body.style.userSelect = "none";
document.body.style.webkitUserSelect = "none";
document.body.style.msUserSelect = "none";
UI.seedInput.style.userSelect = "text";
UI.seedInput.style.webkitUserSelect = "text";

const cssW = UI.canvas.width;
const cssH = UI.canvas.height;
const dpr = Math.max(1, Math.ceil(window.devicePixelRatio || 1));
UI.canvas.width = cssW * dpr;
UI.canvas.height = cssH * dpr;
UI.canvas.style.width = cssW + "px";
UI.canvas.style.height = cssH + "px";

const ctx = UI.canvas.getContext("2d", { alpha: true });
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

// SETTINGS
const TILE_W = 512;
const TILE_H = 512;
const TILE_N = TILE_W * TILE_H;

const ROT_MIN = 0.5;
const ROT_MAX = 1.25;
let rotationSpeed = 0.9;
const ROT_ANGLE = 12 * Math.PI / 180;
let offX = 0;

let planetSeed = 0;
let values = {};
let selectedIndex = 0;

let biomeMap = new Uint8Array(TILE_N);

const tileCanvas = document.createElement("canvas");
tileCanvas.width = TILE_W;
tileCanvas.height = TILE_H;
const tileCtx = tileCanvas.getContext("2d", { willReadFrequently: true });
let tileImage = tileCtx.createImageData(TILE_W, TILE_H);
let tilePattern = null;

const BAND_W = 2048;
const BAND_H = 2048;
const bandCanvas = document.createElement("canvas");
bandCanvas.width = BAND_W;
bandCanvas.height = BAND_H;
const bandCtx = bandCanvas.getContext("2d");

const shadeCanvas = document.createElement("canvas");
shadeCanvas.width = 256;
shadeCanvas.height = 256;
const shadeCtx = shadeCanvas.getContext("2d");

let cachedSeed = null;
let cachedNoise = null;
let cachedSorted = null;

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function round1(n){ return Math.round(n * 10) / 10; }
function hexToRgb(hex){
  const h = hex.replace("#","");
  const num = parseInt(h,16);
  return { r:(num>>16)&255, g:(num>>8)&255, b:num&255 };
}

function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

function sanitizeSeedTyping(raw, maxLen){
  let out = "";
  let digitsCount = 0;
  for (let i=0; i<raw.length; i++){
    const ch = raw[i];
    if (i === 0 && (ch === "-" || ch === "+")) { out += ch; continue; }
    if (ch >= "0" && ch <= "9") {
      if (digitsCount < 8) { out += ch; digitsCount++; }
    }
    if (out.length >= 9) break;
  }
  return out;
}

function sanitizeSeedFinal(raw){
  if (raw === "" || raw === "-" || raw === "+") return "0";
  let sign = "";
  let digits = raw;
  if (raw[0] === "-" || raw[0] === "+") { sign = raw[0]; digits = raw.slice(1); }
  digits = digits.replace(/^0+/, "");
  if (digits === "") digits = "0";
  if (digits === "0") return "0";
  if (sign === "-") return "-" + digits;
  return digits;
}

const SEED_MAX = 99999999;
function cryptoU32(){
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] >>> 0;
}
function randomIntInclusive(min, max){
  const range = (max - min + 1) >>> 0;
  const limit = Math.floor(0x100000000 / range) * range;
  let r;
  do { r = cryptoU32(); } while (r >= limit);
  return min + (r % range);
}
function randomSeedStringUniform(){
  const n = randomIntInclusive(-SEED_MAX, SEED_MAX);
  return String(n);
}

function randomStartValues(){
  const rng = mulberry32(planetSeed + 12345);
  const w = ELEMENTS.map(() => rng());
  const sum = w.reduce((a,b)=>a+b,0);
  values = {};
  for (let i=0;i<ELEMENTS.length;i++) values[ELEMENTS[i].key] = (w[i] / sum) * 100;
  let total = 0;
  for (const e of ELEMENTS){
    values[e.key] = Math.max(0, Math.round(values[e.key] * 10) / 10);
    total += values[e.key];
  }
  const diff = Math.round((100 - total) * 10) / 10;
  values[ELEMENTS[0].key] = Math.max(0, Math.round((values[ELEMENTS[0].key] + diff) * 10) / 10);
  refreshUIValues();
}

function applyChangeLive(changedKey, newValue){
  newValue = clamp(newValue, 0, 100);
  values[changedKey] = newValue;
  const otherKeys = ELEMENTS.map(e => e.key).filter(k => k !== changedKey);
  const remaining = 100 - newValue;
  let othersSum = 0;
  for (const k of otherKeys) othersSum += Math.max(0, values[k] || 0);
  if (othersSum <= 0){
    const per = remaining / otherKeys.length;
    for (const k of otherKeys) values[k] = per;
  } else {
    const scale = remaining / othersSum;
    for (const k of otherKeys) values[k] = (values[k] || 0) * scale;
  }
  let total = 0;
  for (const e of ELEMENTS){
    values[e.key] = Math.max(0, Math.round(values[e.key] * 10) / 10);
    total += values[e.key];
  }
  const diff = Math.round((100 - total) * 10) / 10;
  values[changedKey] = clamp(Math.round((values[changedKey] + diff) * 10) / 10, 0, 100);
  refreshSelectedUI();
  refreshUIValues();
  rebuildTileFromValuesFast();
}

function valueNoise2D(x, y, seed, period){
  const xi0 = Math.floor(x);
  const yi0 = Math.floor(y);
  const xf = x - xi0;
  const yf = y - yi0;
  const xi1 = xi0 + 1;
  const yi1 = yi0 + 1;
  function mod(n, m){ return ((n % m) + m) % m; }
  function hash(ix, iy){
    const px = mod(ix, period);
    const py = mod(iy, period);
    const s = (seed | 0);
    let h = (px * 374761393 + py * 668265263) ^ ((s >>> 0) * 2654435761);
    h = (h ^ (h >> 13)) >>> 0;
    h = (h * 1274126177) >>> 0;
    return ((h ^ (h >> 16)) >>> 0) / 4294967296;
  }
  const v00 = hash(xi0, yi0);
  const v10 = hash(xi1, yi0);
  const v01 = hash(xi0, yi1);
  const v11 = hash(xi1, yi1);
  const sx = xf * xf * (3 - 2 * xf);
  const sy = yf * yf * (3 - 2 * yf);
  const ix0 = v00 + (v10 - v00) * sx;
  const ix1 = v01 + (v11 - v01) * sx;
  return ix0 + (ix1 - ix0) * sy;
}

function buildSeedCache(){
  if (cachedSeed === planetSeed && cachedNoise && cachedSorted) return;
  cachedSeed = planetSeed;
  cachedNoise = new Float32Array(TILE_N);
  const period1 = 8;
  const period2 = 16;
  const f1 = period1 / TILE_W;
  const f2 = period2 / TILE_W;
  for (let y=0;y<TILE_H;y++){
    for (let x=0;x<TILE_W;x++){
      const n1 = valueNoise2D(x*f1, y*f1, planetSeed, period1);
      const n2 = valueNoise2D(x*f2 + 77, y*f2 + 77, planetSeed, period2);
      cachedNoise[y*TILE_W + x] = (n1*0.75 + n2*0.25);
    }
  }
  const idx = new Array(TILE_N);
  for (let i=0;i<TILE_N;i++) idx[i] = i;
  idx.sort((a,b)=> cachedNoise[a] - cachedNoise[b]);
  cachedSorted = new Uint32Array(TILE_N);
  for (let i=0;i<TILE_N;i++) cachedSorted[i] = idx[i];
}

function computeExactCounts(){
  const exact = ELEMENTS.map(e => (Math.max(0, values[e.key] || 0) / 100) * TILE_N);
  const counts = exact.map(v => Math.floor(v));
  let used = counts.reduce((a,b)=>a+b,0);
  let rem = TILE_N - used;
  const fracs = exact.map((v,i)=>({i, frac: v - Math.floor(v)}));
  fracs.sort((a,b)=>b.frac-a.frac);
  for (let k=0;k<rem;k++) counts[fracs[k % fracs.length].i]++;
  let total = counts.reduce((a,b)=>a+b,0);
  if (total !== TILE_N) counts[0] += (TILE_N - total);
  return counts;
}

function despeckle(map, passes=1){
  for (let p=0;p<passes;p++){
    const copy = new Uint8Array(map);
    for (let y=0;y<TILE_H;y++){
      const ym1 = (y-1+TILE_H)%TILE_H;
      const yp1 = (y+1)%TILE_H;
      for (let x=0;x<TILE_W;x++){
        const xm1 = (x-1+TILE_W)%TILE_W;
        const xp1 = (x+1)%TILE_W;
        const i = y*TILE_W+x;
        const t = copy[i];
        const n1 = copy[y*TILE_W+xm1];
        const n2 = copy[y*TILE_W+xp1];
        const n3 = copy[ym1*TILE_W+x];
        const n4 = copy[yp1*TILE_W+x];
        let same=0;
        if (n1===t) same++;
        if (n2===t) same++;
        if (n3===t) same++;
        if (n4===t) same++;
        if (same<=1){
          const m = new Map();
          for (const n of [n1,n2,n3,n4]) m.set(n, (m.get(n)||0)+1);
          let best=t, bestC=-1;
          for (const [k,v] of m.entries()){
            if (v>bestC){ bestC=v; best=k; }
          }
          map[i]=best;
        }
      }
    }
  }
}

function rebuildTileFromValuesFast(){
  buildSeedCache();
  const counts = computeExactCounts();
  let cursor = 0;
  for (let biomeIndex=0; biomeIndex<ELEMENTS.length; biomeIndex++){
    const take = counts[biomeIndex];
    for (let k=0;k<take;k++){
      biomeMap[cachedSorted[cursor++]] = biomeIndex;
    }
  }
  despeckle(biomeMap, 1);
  const data = tileImage.data;
  for (let i=0;i<TILE_N;i++){
    const bIndex = biomeMap[i];
    const colorHex = ELEMENTS[bIndex].color;
    const c = hexToRgb(colorHex);
    const p = i*4;
    data[p]=c.r; data[p+1]=c.g; data[p+2]=c.b; data[p+3]=255;
  }
  tileCtx.putImageData(tileImage, 0, 0);
  tilePattern = bandCtx.createPattern(tileCanvas, "repeat");
}

function rebuildBand(){
  if (!tilePattern) return;
  bandCtx.setTransform(1,0,0,1,0,0);
  bandCtx.clearRect(0,0,BAND_W,BAND_H);
  bandCtx.imageSmoothingEnabled = false;
  const dx = (offX | 0);
  bandCtx.translate(-dx, 0);
  bandCtx.fillStyle = tilePattern;
  bandCtx.fillRect(0, 0, BAND_W + TILE_W, BAND_H);
  bandCtx.setTransform(1,0,0,1,0,0);
}

function rebuildShading(){
  const w = shadeCanvas.width, h = shadeCanvas.height;
  shadeCtx.clearRect(0,0,w,h);
  const g = shadeCtx.createRadialGradient(
    w/2, h/2, 0,
    w/2, h/2, Math.min(w,h) * 0.62
  );
  g.addColorStop(0.00, "rgba(0,0,0,0)");
  g.addColorStop(0.35, "rgba(0,0,0,0.12)");
  g.addColorStop(0.70, "rgba(0,0,0,0.30)");
  g.addColorStop(1.00, "rgba(0,0,0,0.45)");
  shadeCtx.fillStyle = g;
  shadeCtx.fillRect(0,0,w,h);
}

function drawPlanet(){
  const w = cssW, h = cssH;
  ctx.clearRect(0,0,w,h);
  const cx = w/2, cy = h/2;
  const radius = Math.min(w,h) * 0.40;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius+14, 0, Math.PI*2);
  ctx.fillStyle = "rgba(0,0,0,.22)";
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI*2);
  ctx.clip();
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ROT_ANGLE);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bandCanvas, -BAND_W/2, -BAND_H/2);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(shadeCanvas, cx-radius, cy-radius, radius*2, radius*2);
  ctx.restore();
  ctx.restore();
}

// --- LAYOUT SYNC (FORCE LEFT TO MATCH RIGHT) ---
function syncHeights() {
  UI.planetPanel.style.height = 'auto';
  const rightH = UI.controlsPanel.offsetHeight;
  UI.planetPanel.style.height = rightH + 'px';
  drawPlanet();
}

// --- CUSTOM DRAG & DROP SYSTEM (No HTML5 Drag) ---
let draggedItem = null;
let draggedEl = null;
let ghostEl = null;
let dragOffsetY = 0;
let dragStartX = 0;
let dragStartY = 0;
let isDragging = false;

function onRowMouseDown(e) {
  // STRICT CHECK: IGNORE if clicking Input (Track or Thumb)
  if (e.target.tagName === 'INPUT') return;

  e.preventDefault(); 
  
  draggedEl = e.currentTarget;
  const idx = parseInt(draggedEl.dataset.index);
  draggedItem = ELEMENTS[idx];
  
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  
  const rect = draggedEl.getBoundingClientRect();
  dragOffsetY = e.clientY - rect.top;

  window.addEventListener('mousemove', onWindowMouseMove);
  window.addEventListener('mouseup', onWindowMouseUp);
}

function onWindowMouseMove(e) {
  if (!isDragging) {
    if (Math.abs(e.clientY - dragStartY) > 3) {
      // START DRAG: Save Undo State Here!
      saveState(); 
      startDrag();
    }
  }
  
  if (isDragging && ghostEl) {
    ghostEl.style.top = (e.clientY - dragOffsetY) + 'px';
    ghostEl.style.left = draggedEl.getBoundingClientRect().left + 'px';
    
    checkSwap(e.clientY);
  }
}

function startDrag() {
  isDragging = true;
  ghostEl = draggedEl.cloneNode(true);
  ghostEl.classList.add('drag-ghost');
  ghostEl.style.width = draggedEl.offsetWidth + 'px';
  document.body.appendChild(ghostEl);
  draggedEl.classList.add('invisible');
}

function checkSwap(mouseY) {
  const siblings = Array.from(UI.sliders.children);
  const draggedIdx = siblings.indexOf(draggedEl);
  
  let targetEl = null;
  
  for (let i = 0; i < siblings.length; i++) {
    const el = siblings[i];
    if (el === draggedEl) continue;
    
    const rect = el.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    
    // CENTER CROSSING LOGIC
    if (i > draggedIdx) {
        if (mouseY > mid) {
            targetEl = el;
            break; 
        }
    } 
    else if (i < draggedIdx) {
        if (mouseY < mid) {
            targetEl = el;
        }
    }
  }

  if (targetEl) {
      const targetIdx = siblings.indexOf(targetEl);
      if (Math.abs(targetIdx - draggedIdx) === 1) {
          swapRows(draggedIdx, targetIdx);
      }
  }
}

function swapRows(fromIdx, toIdx) {
  // Data Swap
  const movedItem = ELEMENTS.splice(fromIdx, 1)[0];
  ELEMENTS.splice(toIdx, 0, movedItem);
  
  // FLIP Animation Prep
  const container = UI.sliders;
  const children = Array.from(container.children);
  const positions = new Map();
  children.forEach(c => positions.set(c, c.getBoundingClientRect().top));
  
  // DOM Swap
  const fromEl = children[fromIdx];
  const toEl = children[toIdx];
  
  if (fromIdx < toIdx) {
    container.insertBefore(fromEl, toEl.nextSibling);
  } else {
    container.insertBefore(fromEl, toEl);
  }
  
  // Texture Update
  rebuildTileFromValuesFast();
  
  // FLIP Animation Play
  Array.from(container.children).forEach(child => {
    if (child.classList.contains('invisible')) return;
    
    const oldTop = positions.get(child);
    const newTop = child.getBoundingClientRect().top;
    const delta = oldTop - newTop;
    
    if (delta !== 0) {
      child.style.transform = `translateY(${delta}px)`;
      child.style.transition = 'none';
      
      requestAnimationFrame(() => {
        child.style.transition = ''; 
        child.style.transform = '';
      });
    }
  });
}

function onWindowMouseUp(e) {
  window.removeEventListener('mousemove', onWindowMouseMove);
  window.removeEventListener('mouseup', onWindowMouseUp);
  
  if (isDragging) {
    if (ghostEl) ghostEl.remove();
    if (draggedEl) draggedEl.classList.remove('invisible');
  }
  
  isDragging = false;
  ghostEl = null;
  draggedEl = null;
  draggedItem = null;
}

function buildSliders(){
  UI.sliders.innerHTML = "";

  ELEMENTS.forEach((el, idx) => {
    const row = document.createElement("div");
    row.className = "row";
    row.dataset.index = String(idx);
    
    // Attach custom drag handler
    row.addEventListener('mousedown', onRowMouseDown);

    const label = document.createElement("div");
    label.className = "label";

    const badge = document.createElement("div");
    badge.className = "badge";

    const sw = document.createElement("span");
    sw.className = "swatch";
    sw.style.background = el.color;

    const nm = document.createElement("span");
    nm.textContent = el.name;

    badge.appendChild(sw);
    badge.appendChild(nm);

    const val = document.createElement("div");
    val.className = "value";
    val.id = `val_${el.key}`;
    val.textContent = `${round1(values[el.key] || 0)}%`;

    label.appendChild(badge);
    label.appendChild(val);

    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = "100";
    input.step = "0.1";
    input.value = String(values[el.key] || 0);
    input.id = `rng_${el.key}`;
    
    // Stop event so row drag doesn't start
    input.addEventListener("mousedown", (e) => {
        e.stopPropagation();
    });
    input.addEventListener("touchstart", (e) => e.stopPropagation(), {passive: true});

    // --- UNDO LOGIC FOR SLIDERS ---
    // Save state BEFORE starting to slide (mousedown) doesn't work well because 
    // we don't know if they will actually change it.
    // Better: Save state on 'change' which fires when user RELEASES the handle.
    // However, since we need to undo TO the value before the drag, 
    // we actually need to save state on mousedown but only if it wasn't just saved.
    // Simplest approach: Use 'change' event to save the NEW state? 
    // No, standard undo is: I changed 10->20. Undo should go back to 10.
    // So we need to push the *previous* state right before the change happens.
    // But 'input' fires continuously.
    // Solution: We save the state on 'mousedown' (start of interaction) into a temp var,
    // then on 'change' (end of interaction), we push that temp var to the stack.
    let tempState = null;
    
    input.addEventListener("mousedown", () => {
        tempState = getCurrentState();
    });
    
    input.addEventListener("change", () => {
        if(tempState) {
            // We manually push the PREVIOUS state to the undo stack
            // But wait, our system pushes the CURRENT state to undo stack before making a change?
            // No, usually 'undo' stack contains previous states.
            // If I am at State A. I drag to State B. Undo stack should have A.
            // Our saveState() function saves the CURRENT state to the stack.
            // So we should call saveState() *before* the value changes?
            // But 'input' updates live. 
            // Correct Logic: 
            // 1. MouseDown: Capture State A (temp).
            // 2. Input: Updates visual to B (live).
            // 3. Change (MouseUp): Commit. 
            // We need to push State A to the Undo Stack.
            // Our saveState() helper pushes the *current* application state.
            // So we can't use saveState() directly here because the app state is already B (live update).
            // We need to manually push the 'tempState' we captured at mousedown.
            
            if (undoStack.length === 0 || JSON.stringify(undoStack[undoStack.length-1]) !== JSON.stringify(tempState)) {
                undoStack.push(tempState);
                redoStack = [];
                updateUndoRedoUI();
            }
            tempState = null;
        }
    });

    input.addEventListener("input", () => {
      selectedIndex = ELEMENTS.indexOf(el); 
      applyChangeLive(el.key, parseFloat(input.value));
    });

    row.addEventListener("click", () => {
      selectedIndex = ELEMENTS.indexOf(el); 
      refreshSelectedUI();
    });

    row.appendChild(label);
    row.appendChild(input);
    UI.sliders.appendChild(row);
  });

  refreshSelectedUI();
  refreshUIValues();
  syncHeights();
}

function refreshUIValues(){
  for (const el of ELEMENTS){
    const v = round1(values[el.key] || 0);
    const valEl = document.getElementById(`val_${el.key}`);
    const rngEl = document.getElementById(`rng_${el.key}`);
    if (valEl) valEl.textContent = `${v}%`;
    if (rngEl) rngEl.value = String(v);
  }
}

function refreshSelectedUI(){
  const el = ELEMENTS[selectedIndex];
  if (el) {
    if(UI.selectedName) UI.selectedName.textContent = el.name;
    if(UI.selectedVal) UI.selectedVal.textContent = `${round1(values[el.key] || 0)}%`;
  }
}

// seed
function randomSeedOnStart(){
  const s = randomSeedStringUniform();
  UI.seedInput.value = s;
  planetSeed = parseInt(s, 10) || 0;
  cachedSeed = null;
  randomStartValues(); 
}

function setSeedFromInputFinalize(){
  saveState(); // Save old state before changing
  const final = sanitizeSeedFinal(UI.seedInput.value);
  UI.seedInput.value = final;
  const n = parseInt(final, 10);
  planetSeed = Number.isFinite(n) ? n : 0;
  cachedSeed = null;
  rebuildTileFromValuesFast();
}

function rerollSeed(){
  saveState(); // Save old state before changing
  const s = randomSeedStringUniform();
  UI.seedInput.value = s;
  planetSeed = parseInt(s, 10) || 0;
  cachedSeed = null;
  rebuildTileFromValuesFast();
}

function roundRect(ctx2, x, y, w, h, r, fill, stroke){
  const rr = Math.min(r, w/2, h/2);
  ctx2.beginPath();
  ctx2.moveTo(x+rr, y);
  ctx2.arcTo(x+w, y, x+w, y+h, rr);
  ctx2.arcTo(x+w, y+h, x, y+h, rr);
  ctx2.arcTo(x, y+h, x, y, rr);
  ctx2.arcTo(x, y, x+w, y, rr);
  ctx2.closePath();
  if (fill) ctx2.fill();
  if (stroke) ctx2.stroke();
}

function capturePoster(){
  const active = ELEMENTS
    .map(e => ({ ...e, v: round1(values[e.key] || 0) }))
    .filter(e => e.v > 0);
  const W = 900;
  const planetSize = 720;
  const py = 160;
  const CUT = 33;
  const legendPadTop = 90;
  const rowH = 56;
  const legendBottomPad = Math.max(10, 60 - CUT);
  const legendInnerH = legendPadTop + (active.length * rowH) + legendBottomPad;
  const footerPad = 70;
  const H = py + planetSize + 60 + legendInnerH + footerPad;
  const poster = document.createElement("canvas");
  poster.width = W;
  poster.height = H;
  const pctx = poster.getContext("2d");
  pctx.fillStyle = "#0b0f1a";
  pctx.fillRect(0,0,W,H);
  pctx.fillStyle = "#eaf2ff";
  pctx.font = "bold 44px ui-monospace, Menlo, Consolas, monospace";
  pctx.fillText("CREATE YOUR WORLD", 60, 80);
  pctx.fillStyle = "rgba(234,242,255,0.7)";
  pctx.font = "22px ui-monospace, Menlo, Consolas, monospace";
  pctx.fillText(`Seed: ${planetSeed}`, 60, 118);
  const px = Math.floor((W - planetSize)/2);
  pctx.imageSmoothingEnabled = true;
  pctx.drawImage(UI.canvas, px, py, planetSize, planetSize);
  const legendY = py + planetSize + 60;
  const boxX = 60;
  const boxW = W - 120;
  const boxH = legendInnerH;
  pctx.fillStyle = "rgba(16,26,42,0.88)";
  roundRect(pctx, boxX, legendY, boxW, boxH, 24, true, false);
  pctx.fillStyle = "#eaf2ff";
  pctx.font = "bold 30px ui-monospace, Menlo, Consolas, monospace";
  pctx.fillText("ELEMENTS", boxX + 34, legendY + 58);
  const rowStartY = legendY + legendPadTop;
  pctx.font = "24px ui-monospace, Menlo, Consolas, monospace";
  for (let i=0;i<active.length;i++){
    const e = active[i];
    const y = rowStartY + i*rowH;
    pctx.fillStyle = e.color;
    roundRect(pctx, boxX + 34, y + 12, 32, 32, 8, true, false);
    pctx.fillStyle = "#eaf2ff";
    pctx.fillText(e.name, boxX + 80, y + 38);
    const pct = `${e.v.toFixed(1)}%`;
    pctx.fillStyle = "rgba(234,242,255,0.85)";
    const tw = pctx.measureText(pct).width;
    pctx.fillText(pct, boxX + boxW - 34 - tw, y + 38);
  }
  pctx.fillStyle = "rgba(234,242,255,0.65)";
  pctx.font = "20px ui-monospace, Menlo, Consolas, monospace";
  const url = "elblasy.com/create-your-world";
  const tw2 = pctx.measureText(url).width;
  pctx.fillText(url, W - 60 - tw2, H - 35);
  poster.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `planet_${planetSeed}.png`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 0);
  }, "image/png");
}

let lastT = performance.now();
function tick(t){
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;
  const speed = 85 * rotationSpeed;
  offX = (offX + speed * dt) % TILE_W;
  rebuildBand();
  drawPlanet();
  requestAnimationFrame(tick);
}

function init(){
  UI.rotSpeed.min = String(ROT_MIN);
  UI.rotSpeed.max = String(ROT_MAX);
  UI.rotSpeed.step = "0.01";
  UI.seedInput.maxLength = 9;

  UI.rotSpeed.addEventListener("mousedown", (e) => e.stopPropagation());

  // Init listeners for Undo/Redo
  UI.undoBtn.addEventListener("click", performUndo);
  UI.redoBtn.addEventListener("click", performRedo);
  
  // Initial UI check
  updateUndoRedoUI();

  randomSeedOnStart(); 
  buildSliders();
  rebuildShading();
  rebuildTileFromValuesFast();
  rebuildBand();

  UI.seedInput.addEventListener("input", () => {
    UI.seedInput.value = sanitizeSeedTyping(UI.seedInput.value, 9);
  });
  UI.seedInput.addEventListener("change", setSeedFromInputFinalize);
  UI.seedInput.addEventListener("blur", setSeedFromInputFinalize);
  UI.seedInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter"){ UI.seedInput.blur(); }
  });

  UI.reroll.addEventListener("click", rerollSeed);

  UI.rotSpeed.addEventListener("input", () => {
    rotationSpeed = clamp(parseFloat(UI.rotSpeed.value) || 0.9, ROT_MIN, ROT_MAX);
  });
  rotationSpeed = clamp(parseFloat(UI.rotSpeed.value) || 0.9, ROT_MIN, ROT_MAX);

  UI.captureBtn.addEventListener("click", capturePoster);
  
  window.addEventListener('resize', syncHeights);

  requestAnimationFrame(tick);
}

init();