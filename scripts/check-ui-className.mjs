#!/usr/bin/env node
/**
 * lumux gate: appearance-as-prop, drift ratchets, 44px targets, icon scale.
 * Parameterized by `lumux-gates.json` in the current directory (or `$LUMUX_GATES`).
 *
 * Part one — className (blocking). A primitive's own classes and a className
 * override have EQUAL specificity, so the winner is decided by stylesheet
 * order and the loser disappears with no error. Appearance comes from a prop
 * (`variant`, `tone`, `size`); className places the component (margin, width,
 * grid). Checked per primitive, per property it actually sets.
 *
 * Part two — drift (ratchets). Raw palette classes, arbitrary values, motion
 * literals, outline-none without focus-visible, raw controls, on-screen prose.
 * Each file is measured against a committed baseline and the build fails only
 * when a count goes UP. A count that reaches zero stays there for free.
 *
 * Part three — touch targets (blocking). No height step under 44px in the
 * primitives directory (`ui` in the config). shadcn's defaults are all under
 * 44, so this is the mistake that happens by default.
 *
 * Part four — icons (blocking). One weight, four sizes: 14 / 16 / 20 / 32.
 * Plus: no opacity on a text colour (any alpha on foreground-muted drops
 * under 4.5:1).
 *
 * Usage:
 *   node scripts/check-ui-className.mjs                    exit 1 on any violation
 *   node scripts/check-ui-className.mjs --update-baseline  rewrite the baseline
 *
 * Config (`lumux-gates.json`), every key optional:
 *   src          string[]  trees scanned for call sites and drift      ["src"]
 *   ui           string    the app's own primitives directory          (none)
 *   shared       string[]  .ts data files scanned for prose, one level ([])
 *   owns         object    extra primitives: { Chip: ["bg", "fg"] }    ({})
 *   allow        array     ratchet exceptions { rule, file, snippet, why }
 *   touchAllow   array     target exceptions { file, snippet, why }
 *   baseline     string    path of the frozen counts   "lumux-gates.baseline.json"
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, normalize } from 'node:path';

const CONFIG_PATH = process.env.LUMUX_GATES ?? 'lumux-gates.json';
const config = existsSync(CONFIG_PATH) ? JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) : {};
const SRC = config.src ?? ['src'];
// Normalized so `./src/ui/` and `src/ui` both match the paths walk() yields.
const UI_DIR = config.ui ? normalize(config.ui).replace(/\/+$/, '') : null;
const SHARED = config.shared ?? [];
const BASELINE_PATH = config.baseline ?? 'lumux-gates.baseline.json';
const ALLOW = config.allow ?? [];
const TOUCH_ALLOW = config.touchAllow ?? [];

/* ─── Part one: appearance utilities in a primitive's className ─────────── */

/** Which properties each lumux primitive sets for itself (src/react). */
const CONTROL = ['bg', 'fg', 'edge', 'type', 'radius', 'height', 'pad'];
const OWNS = {
  Button: CONTROL,
  IconButton: CONTROL,
  LinkButton: CONTROL,
  Input: CONTROL,
  Select: CONTROL,
  Combobox: CONTROL,
  NativeSelect: CONTROL,
  Textarea: CONTROL,
  Field: ['rhythm'],
  Checkbox: ['rhythm'],
  Switch: ['rhythm'],
  RadioGroup: ['rhythm'],
  SegmentedControl: ['bg', 'radius', 'pad', 'rhythm'],
  ThemeSwitcher: ['bg', 'radius', 'pad', 'rhythm'],
  AppShell: ['bg', 'fg', 'type'],
  Card: ['bg', 'fg', 'edge', 'radius', 'shadow', 'pad'],
  Badge: ['bg', 'fg', 'type', 'radius', 'pad', 'rhythm'],
  EmptyState: ['fg', 'type', 'pad', 'rhythm'],
  ConfirmInline: ['rhythm'],
  ToastLog: ['fg', 'type', 'rhythm'],
  Spinner: ['height'],
  ...(config.owns ?? {}),
};
const PRIMITIVES = Object.keys(OWNS);

/** Utilities that decide how a component LOOKS. These belong to a prop. */
const FORBIDDEN = [
  ['bg', /(?<![\w:-])bg-(?!transparent\b|current\b)[a-z][\w/-]*/, 'background colour'],
  ['fg', /(?<![\w:-])text-(?:foreground|background|accent|danger|success|warning|info|white|black|current)[\w/-]*/, 'text colour'],
  // `border-l-accent` as well as `border-accent`: the directional form reads
  // as adding an edge and is the same collision (border-left-color against
  // the primitive's border-color shorthand).
  [
    'edge',
    /(?<![\w:-])border-(?:[trblxy]-)?(?:border|foreground|accent|danger|success|warning|info|white|transparent|current)[\w/-]*/,
    'border colour',
  ],
  ['edge', /(?<![\w:-])border(?:-[trblxy])?-\d/, 'border width'],
  [
    'type',
    /(?<![\w:-])text-(?:display|title|heading|subheading|body|body-sm|label|caption|micro|data|xs|sm|base|lg|xl|\dxl)\b/,
    'type role',
  ],
  ['radius', /(?<![\w:-])rounded[\w-]*/, 'radius'],
  ['shadow', /(?<![\w:-])shadow-[\w-]*/, 'elevation'],
  ['height', /(?<![\w:-])(?:(?:min|max)-)?(?:h|size)-(?:target|header|\d)[\w.]*/, 'control height'],
  ['pad', /(?<![\w:-])p[xy]?-(?:\d[\d.]*|card)/, 'internal padding'],
  ['rhythm', /(?<![\w:-])(?:space-y|gap)-\d[\d.]*/, 'internal rhythm'],
];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (p.endsWith('.tsx') || p.endsWith('.jsx')) out.push(p);
  }
  return out;
}

const isTest = (f) => /\.(?:test|spec)\.[jt]sx?$/.test(f) || /(?:^|\/)(?:tests?|e2e|__tests__)\//.test(f);

/** Find the opening tag for a primitive and return its raw text. */
function openingTag(src, from) {
  let i = from;
  let depth = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '>' && depth === 0) return src.slice(from, i);
    i++;
  }
  return src.slice(from);
}

/**
 * Every className value in `src`, as { value, index }, brace-balanced. A regex
 * stops at the first `}`, which in `className={`a ${x ? 'b' : 'c'} d`}` is the
 * interpolation's, not the attribute's.
 */
function* classNames(src, ownOnly = false) {
  const re = /className=/g;
  let m;
  let depth0 = 0;
  let seen = 0;
  while ((m = re.exec(src))) {
    // ownOnly: skip a className nested inside a `{…}` prop value. A
    // `title={<h2 className="…">}` on Card is the h2's className, not Card's.
    if (ownOnly) {
      for (; seen < m.index; seen++) {
        if (src[seen] === '{') depth0++;
        else if (src[seen] === '}') depth0--;
      }
      if (depth0 > 0) continue;
    }
    let i = m.index + m[0].length;
    if (src[i] === '"' || src[i] === "'") {
      const q = src[i];
      const end = src.indexOf(q, i + 1);
      if (end === -1) continue;
      yield { value: src.slice(i, end + 1), index: m.index };
      re.lastIndex = end + 1;
    } else if (src[i] === '{') {
      let depth = 0;
      const start = i;
      for (; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}' && --depth === 0) break;
      }
      yield { value: src.slice(start, i + 1), index: m.index };
      re.lastIndex = i + 1;
    }
  }
}

const lineAt = (src, i) => src.slice(0, i).split('\n').length;

const allFiles = [...new Set([...SRC.flatMap((d) => walk(d)), ...(UI_DIR ? walk(UI_DIR) : [])])].filter(
  (f) => !isTest(f)
);

const violations = [];
const primitiveRe = new RegExp(`<(${PRIMITIVES.join('|')})\\b`, 'g');
for (const file of allFiles) {
  const src = readFileSync(file, 'utf8');
  let m;
  primitiveRe.lastIndex = 0;
  while ((m = primitiveRe.exec(src))) {
    const tag = openingTag(src, primitiveRe.lastIndex);
    for (const cn of classNames(tag, true)) {
      for (const [prop, rx, what] of FORBIDDEN) {
        if (!OWNS[m[1]].includes(prop)) continue;
        const hit = cn.value.match(rx);
        if (hit) violations.push({ file, line: lineAt(src, m.index), component: m[1], what, snippet: hit[0] });
      }
    }
  }
}

let failed = false;

if (violations.length === 0) {
  console.log(`ui/className: clean — ${allFiles.length} files, no appearance utilities on primitives`);
} else {
  failed = true;
  console.error(`\nui/className: ${violations.length} violation(s)\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  <${v.component}>  ${v.what} "${v.snippet}" in className`);
  }
  console.error(`\nA primitive's own classes and a className override have equal specificity, so the`);
  console.error(`winner is decided by stylesheet order and the loser disappears without an error.`);
  console.error(`Use a variant / tone / size prop instead; className is for layout only.\n`);
}

/* ─── Part two: drift ratchets ─────────────────────────────────────────── */

const COLOUR_UTIL =
  '(?:bg|text|border|ring|ring-offset|divide|from|via|to|fill|stroke|placeholder|decoration|outline|caret|shadow|accent)';
const UTIL_INFIX = '(?:-[trblxy])?';
const PALETTE =
  '(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)';

const PROSE_MAX = 90;
const PROSE_CLASS = /text-foreground-muted|text-foreground-subtle|text-caption|text-label/;
const PROSE_PROP = /(?<![\w-])(?:description|hint|help|subtitle)=\{?\s*(['"])([\s\S]*?)\1/g;
const PROSE_FIELD = /(?<![\w-])(?:what|description|hint|subtitle)\s*:\s*(['"])([\s\S]*?)\1/g;

function tagEnd(src, lt) {
  let depth = 0;
  for (let i = lt; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '>' && depth === 0) return i;
  }
  return -1;
}

function closingTag(src, name, from) {
  const re = new RegExp(`</?${name}(?![\\w.-])`, 'g');
  re.lastIndex = from;
  let depth = 1;
  let m;
  while ((m = re.exec(src))) {
    if (m[0][1] === '/') {
      if (--depth === 0) return m.index;
    } else {
      const end = tagEnd(src, m.index);
      if (end === -1) return src.length;
      if (src[end - 1] !== '/') depth++;
      re.lastIndex = end + 1;
    }
  }
  return src.length;
}

/** The literal text of a JSX subtree: tags and `{…}` dropped, whitespace collapsed. */
function jsxText(s) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    if (s[i] === '{') {
      let depth = 0;
      for (; i < s.length; i++) {
        if (s[i] === '{') depth++;
        else if (s[i] === '}' && --depth === 0) {
          i++;
          break;
        }
      }
    } else if (s[i] === '<') {
      const end = tagEnd(s, i);
      i = end === -1 ? s.length : end + 1;
    } else {
      out += s[i++];
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

function* proseHits(src) {
  for (const cn of classNames(src)) {
    if (!PROSE_CLASS.test(cn.value)) continue;
    const lt = src.lastIndexOf('<', cn.index);
    if (lt === -1) continue;
    const name = /^<([A-Za-z][\w.]*)/.exec(src.slice(lt, cn.index + 1));
    if (!name) continue;
    const end = tagEnd(src, lt);
    if (end === -1 || src[end - 1] === '/') continue;
    const text = jsxText(src.slice(end + 1, closingTag(src, name[1], end + 1)));
    if (text.length > PROSE_MAX) yield { index: lt, text };
  }
  for (const m of src.matchAll(PROSE_PROP)) {
    if (m[2].length > PROSE_MAX) yield { index: m.index, text: m[2] };
  }
}

const inUi = (file) => UI_DIR !== null && (file === UI_DIR || file.startsWith(`${UI_DIR}/`));

const DRIFT = [
  {
    key: 'palette',
    title: 'raw palette',
    rx: new RegExp(`${COLOUR_UTIL}${UTIL_INFIX}-${PALETTE}-(?:50|\\d00|950)\\b`, 'g'),
    fix: 'use a semantic token (foreground, surface, border, accent, danger…) or a /* content color */',
  },
  {
    key: 'arbitrary',
    title: 'arbitrary value',
    // `text-[13px]`, `z-[60]`, `w-[18px]`: a decision made once, in one file,
    // that no other file can find.
    rx: /(?<![\w-])[a-z]+(?:-[a-z]+)*-\[[^\]]+\]/g,
    fix: 'use a scale step (z-overlay, text-body-sm, w-sheet…) or add a token in lumux if the value is genuinely new',
  },
  {
    key: 'motion',
    title: 'motion literal',
    // `duration-200`, `ease-in-out`: lumux motion is `duration-fast|base|slow`
    // and `ease-lumux`, so reduced motion can switch them off in one place.
    rx: /(?<![\w-])(?:duration-\d+|ease-(?:in|out|in-out|linear))(?![\w-])/g,
    fix: 'use duration-fast / duration-base / duration-slow and ease-lumux',
  },
  {
    key: 'outline-none',
    title: 'outline-hidden / outline-none with no focus-visible',
    className: (cn) => /(?<![\w-])outline-(?:hidden|none)(?![\w-])/.test(cn) && !/focus-visible/.test(cn),
    fix: 'pair it with a focus-visible outline, or drop it and let the default ring show',
  },
  {
    key: 'raw-control',
    title: 'raw control outside the primitives',
    // A freezer, not a migration with an end: a raw <button> is right for a
    // disclosure row or a clickable card surface. It exists so a migration
    // measures against a number that is standing still.
    rx: /<(?:button|input|select|textarea)[\s/>]/g,
    skip: inUi,
    fix: 'use Button / IconButton / Input / Select / Textarea from lumux/react',
  },
  {
    key: 'prose',
    title: 'explanatory prose on screen',
    // Not expected to reach zero: a confirmation and an empty state each get
    // one sentence. What it stops is the count going back up.
    prose: true,
    fix: 'move it to the help panel or docs; a row keeps a clause (≤90 chars), a screen keeps a title',
  },
];

const allowed = (rule, file, snippet) =>
  ALLOW.some((a) => a.rule === rule && a.file === file && a.snippet === snippet);

/** { [rule]: { [file]: { count, hits: [] } } } */
const found = Object.fromEntries(DRIFT.map((r) => [r.key, {}]));

const note = (key, file, where, what) => {
  const bucket = (found[key][file] ??= { count: 0, hits: [] });
  bucket.count++;
  if (bucket.hits.length < 8) bucket.hits.push(`${file}:${where}  ${what}`);
};

const brief = (text) => (text.length > 72 ? `${text.slice(0, 69)}…` : text);

for (const file of allFiles) {
  const src = readFileSync(file, 'utf8');
  for (const rule of DRIFT) {
    if (rule.skip?.(file)) continue;
    if (rule.prose) {
      for (const h of proseHits(src)) {
        if (allowed(rule.key, file, h.text)) continue;
        note(rule.key, file, lineAt(src, h.index), `${h.text.length} chars — "${brief(h.text)}"`);
      }
    } else if (rule.rx) {
      for (const m of src.matchAll(rule.rx)) {
        if (allowed(rule.key, file, m[0])) continue;
        note(rule.key, file, lineAt(src, m.index), m[0]);
      }
    } else {
      for (const cn of classNames(src)) {
        if (!rule.className(cn.value)) continue;
        if (allowed(rule.key, file, 'outline-none')) continue;
        note(rule.key, file, lineAt(src, cn.index), 'outline-none');
      }
    }
  }
}

// Prose that lives in a data file and reaches the screen as `{flag.what}`:
// one level of object literal in the configured `shared` directories.
for (const dir of SHARED) {
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.ts')) continue;
    const file = join(dir, name);
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(PROSE_FIELD)) {
      if (m[2].length <= PROSE_MAX) continue;
      if (allowed('prose', file, m[2])) continue;
      note('prose', file, lineAt(src, m.index), `${m[2].length} chars — "${brief(m[2])}"`);
    }
  }
}

const totals = Object.fromEntries(
  DRIFT.map((r) => [r.key, Object.values(found[r.key]).reduce((s, b) => s + b.count, 0)])
);

if (process.argv.includes('--update-baseline')) {
  const next = Object.fromEntries(
    DRIFT.map((r) => [
      r.key,
      Object.fromEntries(
        Object.entries(found[r.key])
          .map(([f, b]) => [f, b.count])
          .sort(([a], [b]) => a.localeCompare(b))
      ),
    ])
  );
  writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`ui/drift: baseline written to ${BASELINE_PATH} — ${JSON.stringify(totals)}`);
}

// Per FILE, not one number per rule: the failure names the file that grew. A
// file with no entry is measured against zero.
const baseline = existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) : null;

console.log(`\nui/drift: ${allFiles.length} files`);
if (!baseline) {
  failed = true;
  console.error(`  no baseline at ${BASELINE_PATH} — run with --update-baseline once and commit it`);
}
for (const rule of baseline ? DRIFT : []) {
  const was = baseline[rule.key] ?? {};
  const grew = Object.entries(found[rule.key]).filter(([f, b]) => b.count > (was[f] ?? 0));
  const total = totals[rule.key];
  const before = Object.values(was).reduce((s, n) => s + n, 0);

  if (grew.length) {
    failed = true;
    console.error(`\n  ✗ ${rule.title}: ${total}, baseline ${before}\n`);
    for (const [f, b] of grew) {
      const had = was[f] ?? 0;
      console.error(`      ${f}  ${had} → ${b.count}${had === 0 ? '  (file not in baseline)' : ''}`);
      for (const h of b.hits) console.error(`        ${h}`);
    }
    console.error(`\n    ${rule.fix}`);
  } else if (total < before) {
    // Not a failure and deliberately loud: a baseline left high after a
    // migration is how a ratchet quietly stops ratcheting.
    console.log(`  ↓ ${rule.title}: ${total}, baseline ${before} — rerun with --update-baseline`);
  } else {
    console.log(`  = ${rule.title}: ${total}`);
  }
}

if (failed) {
  console.error(`\nThese are ratchets, not style opinions: each count may fall and never rise.`);
}

/* ─── Part three: no control under 44px in the primitives directory ────── */

/** The four Tailwind steps below 44: 24, 32, 36, 40. */
const TOUCH_STEPS = ['6', '8', '9', '10'];
const TOUCH_PREFIXES = ['min-h', 'max-h', 'size', 'h'];
const TOUCH_DENY = TOUCH_PREFIXES.flatMap((p) => TOUCH_STEPS.map((n) => `${p}-${n}`));
const TOUCH_RX = new RegExp(`(?<![\\w-])(${TOUCH_DENY.join('|')})(?![\\w-])`, 'g');
// `h-[36px]` is not a different kind of thing from `h-9`. px only: a unit that
// cannot be resolved without layout is not a violation that can be proved.
const TOUCH_PX_RX = /(?<![\w-])((?:min-h|max-h|size|h)-\[(\d+(?:\.\d+)?)px\])/g;

if (UI_DIR) {
  // The WHOLE file, not className values: in a primitives directory a size
  // lives in a SIZES map, never in the JSX.
  let undersized = [];
  for (const file of walk(UI_DIR).filter((f) => !isTest(f))) {
    const src = readFileSync(file, 'utf8');
    for (const hit of src.matchAll(TOUCH_RX)) undersized.push({ file, line: lineAt(src, hit.index), snippet: hit[1] });
    for (const hit of src.matchAll(TOUCH_PX_RX)) {
      if (Number(hit[2]) >= 44) continue;
      undersized.push({ file, line: lineAt(src, hit.index), snippet: hit[1] });
    }
  }

  // An exception excuses ONE occurrence: first hit excused, second reported.
  // An entry that no longer matches anything is an error, not a quiet pass.
  const budget = new Map(TOUCH_ALLOW.map((a) => [`${a.file} ${a.snippet}`, 1]));
  const staleAllows = TOUCH_ALLOW.filter(
    (a) => !undersized.some((u) => u.file === a.file && u.snippet === a.snippet)
  );
  let excused = 0;
  undersized = undersized.filter((u) => {
    const key = `${u.file} ${u.snippet}`;
    const left = budget.get(key) ?? 0;
    if (left === 0) return true;
    budget.set(key, left - 1);
    excused++;
    return false;
  });

  if (staleAllows.length > 0) {
    failed = true;
    console.error(`\nui/touch-target: ${staleAllows.length} exception(s) no longer needed\n`);
    for (const a of staleAllows) console.error(`  ${a.file}  "${a.snippet}" — not found; delete this touchAllow entry`);
  }

  if (undersized.length > 0) {
    failed = true;
    console.error(`\nui/touch-target: ${undersized.length} control(s) below 44px in ${UI_DIR}\n`);
    for (const u of undersized) console.error(`  ${u.file}:${u.line}  "${u.snippet}"`);
    console.error(`\n44px is WCAG 2.5.5 (AAA) and lumux's base size, every pointer, dense included.`);
    console.error(`Use min-h-target / size-target, or add a touchAllow entry with a why for a non-control.\n`);
  } else {
    console.log(
      `ui/touch-target: clean — no control below 44px in ${UI_DIR}${excused > 0 ? ` (${excused} named exception(s))` : ''}`
    );
  }
}

/* ─── Part four: one icon weight, four icon sizes ──────────────────────── */

// IconProvider sets 16px and stroke 1.75. Sizes come from classes:
// size-3.5 (14) dense · size-4 (16) default · size-5 (20) chrome · size-8 (32)
// above an EmptyState title. A `size={20}` literal prop on the four steps is
// the same decision written differently and passes; any other size, or a
// strokeWidth, does not.
const ICON_STEPS = new Set(['3.5', '4', '5', '8']);
const ICON_PX = new Set(['14', '16', '20', '32']);
const ICON_SIZE_RX = /(?<![\w.-])(?:[\w[\]():@-]+:)?(?:h|w|size)-([\d.]+|\[[^\]]+\])(?![\w.-])/g;
const ICON_PROP_RX = /(?<![\w-])(size|strokeWidth|absoluteStrokeWidth)(?:\s*=\s*(?:\{\s*(\d+)\s*\}|"(\d+)"))?(?=[\s=/]|$)/g;

/** `Icon` plus every local name this file imports from lucide-react. */
function iconNames(src) {
  const names = new Set(['Icon']);
  for (const m of src.matchAll(/import\s*(?:type\s+)?\{([^}]*)\}\s*from\s*['"]lucide-react['"]/g)) {
    for (const part of m[1].split(',')) {
      const local = part.trim().split(/\s+as\s+/).pop();
      if (local && !/^type\s/.test(part.trim())) names.add(local);
    }
  }
  return names;
}

const iconHits = [];
for (const file of allFiles) {
  const src = readFileSync(file, 'utf8');
  const names = iconNames(src);
  for (const m of src.matchAll(/<([A-Z][\w.]*|[a-z]\w*\.icon)\b/g)) {
    if (m[1] === 'IconProvider' || m[1] === 'LucideProvider' || (!names.has(m[1]) && !m[1].endsWith('.icon'))) continue;
    const tag = openingTag(src, m.index + m[0].length);
    const line = lineAt(src, m.index);
    for (const p of tag.matchAll(ICON_PROP_RX)) {
      const px = p[2] ?? p[3];
      if (p[1] === 'size' && px && ICON_PX.has(px)) continue;
      iconHits.push({ file, line, what: `<${m[1]} ${p[1]}=…>` });
    }
    for (const cn of classNames(tag)) {
      for (const s of cn.value.matchAll(ICON_SIZE_RX)) {
        if (!ICON_STEPS.has(s[1])) iconHits.push({ file, line, what: `<${m[1]}> ${s[0]}` });
      }
    }
  }
}

if (iconHits.length > 0) {
  failed = true;
  console.error(`\nui/icons: ${iconHits.length} glyph(s) off the icon scale\n`);
  for (const h of iconHits) console.error(`  ${h.file}:${h.line}  ${h.what}`);
  console.error(`\nIcons take size-3.5 (14), size-4 (16), size-5 (20) or, above an EmptyState, size-8 (32).`);
  console.error(`No strokeWidth prop: IconProvider sets the weight.\n`);
} else {
  console.log('ui/icons: clean — every lucide glyph on the 14/16/20/32 scale at one weight');
}

/* ─── ui/muted-alpha: no opacity on a text colour ──────────────────────── */

const MUTED_ALPHA_RX = /(?<![\w-])text-foreground(?:-muted|-subtle)?\/\d+/;
// Exempt, as WCAG 1.4.3 does not cover them: a disabled control, an
// `aria-hidden` glyph, and a lucide icon (1.4.11's question). Only an icon:
// any capitalised tag would also exempt `<Link className="text-foreground/60">`.
const MUTED_ALPHA_EXEMPT = /cursor-default|cursor-not-allowed|disabled|aria-hidden/;
const ICON_TAG_RX = /<([A-Z][\w.]*|[a-z]\w*\.icon)\b[^>]*className=/g;

const alphaHits = [];
for (const file of allFiles) {
  const src = readFileSync(file, 'utf8');
  const names = iconNames(src);
  const onIcon = (text) => [...text.matchAll(ICON_TAG_RX)].some((m) => names.has(m[1]) || m[1].endsWith('.icon'));
  src
    .split('\n')
    .forEach((text, i) => {
      if (MUTED_ALPHA_RX.test(text) && !MUTED_ALPHA_EXEMPT.test(text) && !onIcon(text)) {
        alphaHits.push({ file, line: i + 1, what: text.match(MUTED_ALPHA_RX)[0] });
      }
    });
}

if (alphaHits.length > 0) {
  failed = true;
  console.error(`\nui/muted-alpha: ${alphaHits.length} text colour(s) with opacity\n`);
  for (const h of alphaHits) console.error(`  ${h.file}:${h.line}  ${h.what}`);
  console.error(`\nUse text-foreground-muted without an alpha: foreground-muted is 10:1, any opacity breaks the pair.\n`);
} else {
  console.log('ui/muted-alpha: clean — no opacity on text colour');
}

process.exit(failed ? 1 : 0);
