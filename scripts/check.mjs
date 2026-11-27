// Checks every pack in packs/ and index.json against FORMAT.md.
// Run: node scripts/check.mjs   (no dependencies)
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ID = /^[a-z0-9][a-z0-9-]{0,30}[a-z0-9]$/;
const HEX = /^#[0-9a-f]{6}$/i;
const VER = /^\d+\.\d+\.\d+$/;
const COLORS = ['bg', 'surface', 'text', 'accent', 'muted', 'border'];
const EFFECTS = ['particles', 'light', 'overlay', 'glow', 'sheen'];
const GLOW_TARGETS = ['text', 'links', 'cursor'];

let problems = 0, warnings = 0;
const warn = (where, msg) => { warnings++; console.log(`  ! ${where}: ${msg}`); };
// WCAG contrast ratio between two #rrggbb colors
function contrast(a, b) {
  const lum = hex => {
    const [r, g, bl] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
const fail = (where, msg) => { problems++; console.log(`  ✗ ${where}: ${msg}`); };
const inRange = (v, lo, hi) => typeof v === 'number' && v >= lo && v <= hi;

function checkNumbers(where, obj, ranges) {
  for (const [k, [lo, hi]] of Object.entries(ranges)) {
    if (obj[k] !== undefined && !inRange(obj[k], lo, hi)) fail(where, `${k} should be ${lo}–${hi}, is ${JSON.stringify(obj[k])}`);
  }
}
function checkRect(where, r, needsY = true) {
  for (const k of needsY ? ['x', 'y', 'w', 'h'] : ['x', 'w', 'h']) if (!inRange(r[k], 0, 1)) fail(where, `${k} should be 0–1`);
  if (!HEX.test(r.color ?? '')) fail(where, 'color should be #rrggbb');
}

function checkEffect(where, e) {
  if (!EFFECTS.includes(e.type)) { fail(where, `unknown effect type "${e.type}" (apps will skip it)`); return; }
  if (e.switch !== undefined && (typeof e.switch !== 'string' || !e.switch || e.switch.length > 24)) fail(where, 'switch should be a label up to 24 characters');
  if (e.on !== undefined && typeof e.on !== 'boolean') fail(where, 'on should be true or false');
  if (e.type === 'particles') {
    if (e.color !== undefined && !HEX.test(e.color)) fail(where, 'color should be #rrggbb');
    checkNumbers(where, e, { opacity: [0.2, 3], density: [0.2, 3], speed: [0.2, 3], length: [0.2, 3], slant: [-0.5, 0.5] });
    (e.regions ?? []).forEach((r, i) => { checkRect(`${where} region ${i + 1}`, r); if (!inRange(r.chance, 0, 1)) fail(`${where} region ${i + 1}`, 'chance should be 0–1'); });
    if ((e.regions ?? []).length > 8) fail(where, 'at most 8 regions');
  }
  if (e.type === 'light') {
    (e.spots ?? []).forEach((s, i) => { checkRect(`${where} spot ${i + 1}`, s); if (!inRange(s.strength, 0, 0.4)) fail(`${where} spot ${i + 1}`, 'strength should be 0–0.4'); });
    (e.streaks ?? []).forEach((s, i) => { checkRect(`${where} streak ${i + 1}`, s, false); if (!inRange(s.strength, 0, 0.4)) fail(`${where} streak ${i + 1}`, 'strength should be 0–0.4'); });
    if ((e.spots ?? []).length > 6 || (e.streaks ?? []).length > 6) fail(where, 'at most 6 spots and 6 streaks');
    if (!(e.spots ?? []).length && !(e.streaks ?? []).length) fail(where, 'light needs spots or streaks');
  }
  if (e.type === 'overlay') {
    checkNumbers(where, e, { scanlines: [0, 0.5] });
    if (e.vignette) { if (!HEX.test(e.vignette.color ?? '')) fail(where, 'vignette.color should be #rrggbb'); checkNumbers(where, e.vignette, { strength: [0, 0.8] }); }
  }
  if (e.type === 'glow') {
    if (!GLOW_TARGETS.includes(e.target)) fail(where, `target should be one of ${GLOW_TARGETS.join(', ')}`);
    if (!inRange(e.strength, 0, 1)) fail(where, 'strength should be 0–1');
  }
  if (e.type === 'sheen') {
    if (!Array.isArray(e.colors) || e.colors.length < 2 || e.colors.length > 8 || !e.colors.every(c => HEX.test(c))) fail(where, 'colors should be 2–8 #rrggbb colors');
    checkNumbers(where, e, { seconds: [3, 20] });
  }
}

function checkPack(file) {
  const where = file;
  let p;
  try { p = JSON.parse(readFileSync(join(root, 'packs', file), 'utf8')); } catch (err) { fail(where, 'not valid JSON: ' + err.message); return null; }
  if (p.treePack !== 1) fail(where, 'treePack should be 1');
  if (!ID.test(p.id ?? '')) fail(where, 'id should be 2–32 lowercase letters, digits or hyphens');
  if (file !== `${p.id}.tree-pack.json`) fail(where, `file should be named ${p.id}.tree-pack.json`);
  if (typeof p.name !== 'string' || !p.name || p.name.length > 24) fail(where, 'name should be 1–24 characters');
  if (!VER.test(p.version ?? '')) fail(where, 'version should look like 1.0.0');
  if (typeof p.description !== 'string' || !p.description.trim()) fail(where, 'description is missing: one short line, like "Cold steel blue, chrome, molten iron and machine vision."');
  else if (p.description.length > 120) fail(where, 'description should be up to 120 characters');
  else if (p.description.length > 60) warn(where, `description is ${p.description.length} characters; under 60 reads best`);
  if (!Array.isArray(p.themes) || p.themes.length < 1 || p.themes.length > 8) { fail(where, 'themes should be 1–8 themes'); return p; }
  const ids = new Set();
  for (const t of p.themes) {
    const tw = `${where} › ${t.id}`;
    if (!ID.test(t.id ?? '')) fail(tw, 'id should be 2–32 lowercase letters, digits or hyphens');
    if (ids.has(t.id)) fail(tw, 'theme id used twice');
    ids.add(t.id);
    if (typeof t.name !== 'string' || !t.name || t.name.length > 24) fail(tw, 'name should be 1–24 characters');
    if (t.light !== undefined && typeof t.light !== 'boolean') fail(tw, 'light should be true or false');
    for (const c of COLORS) if (!HEX.test(t.colors?.[c] ?? '')) fail(tw, `colors.${c} should be #rrggbb`);
    if (COLORS.every(c => HEX.test(t.colors?.[c] ?? ''))) {
      const tc = contrast(t.colors.text, t.colors.bg), ac = contrast(t.colors.accent, t.colors.bg);
      if (tc < 7) warn(tw, `text on bg is ${tc.toFixed(1)}:1; 7:1 or more reads best for long writing`);
      if (ac < 4.5) warn(tw, `accent on bg is ${ac.toFixed(1)}:1; links need 4.5:1 to read easily`);
    }
    if (t.colors?.selection !== undefined && !HEX.test(t.colors.selection)) fail(tw, 'colors.selection should be #rrggbb');
    if ((t.effects ?? []).length > 6) fail(tw, 'at most 6 effects');
    (t.effects ?? []).forEach((e, i) => checkEffect(`${tw} effect ${i + 1} (${e.type})`, e));
  }
  if (!ids.has(p.everyday)) fail(where, `everyday "${p.everyday}" isn't one of its themes`);
  return p;
}

console.log('packs/');
const packs = {};
for (const file of readdirSync(join(root, 'packs')).filter(f => f.endsWith('.tree-pack.json')).sort()) {
  const before = problems;
  const p = checkPack(file);
  if (p) packs[p.id] = p;
  if (problems === before) console.log(`  ✓ ${file} (${p.themes.length} themes)`);
}

console.log('index.json');
const before = problems;
try {
  const idx = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
  if (idx.treePacks !== 1) fail('index.json', 'treePacks should be 1');
  const listed = new Set();
  for (const e of idx.packs ?? []) {
    listed.add(e.id);
    const p = packs[e.id];
    if (!p) { fail('index.json', `lists "${e.id}" but packs/${e.id}.tree-pack.json is missing or broken`); continue; }
    if (e.file !== `packs/${e.id}.tree-pack.json`) fail(`index.json › ${e.id}`, `file should be packs/${e.id}.tree-pack.json`);
    for (const k of ['name', 'version', 'description']) if (e[k] !== p[k]) fail(`index.json › ${e.id}`, `${k} doesn't match the pack file`);
    const sw = p.themes.map(t => t.colors.bg);
    if (JSON.stringify(e.swatches) !== JSON.stringify(sw)) fail(`index.json › ${e.id}`, `swatches should be ${JSON.stringify(sw)}`);
  }
  for (const id of Object.keys(packs)) if (!listed.has(id)) fail('index.json', `packs/${id}.tree-pack.json isn't listed`);
} catch (err) { fail('index.json', 'not valid JSON: ' + err.message); }
if (problems === before) console.log('  ✓ lists every pack, and matches them');

const w = warnings ? ` ${warnings} warning${warnings > 1 ? 's' : ''} (worth a look, not blocking).` : '';
console.log(problems ? `\n${problems} problem${problems > 1 ? 's' : ''}.${w}` : `\nAll good.${w}`);
process.exit(problems ? 1 : 0);
