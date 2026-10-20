# lumux: Architecture, Standard and Decisions

The standard lumux implements and the reasoning behind it. Section numbers are stable and referenced
from source comments; sections that held private product inventories and per-app migration plans are
not part of this public document, so the numbering has gaps (0-2, 7-9).

Decisions D1-D23 were made by the maintainers and are settled. Where a decision overrides an
alternative, the decision log names the cost. Reopen one with a written case, not a PR.

---

## 3. Hard requirements — how the standard meets them

**Conformance level (D23): WCAG 2.2 AAA wherever achievable, AA as the absolute floor. Accessibility is the company's product; a token, component or pattern that cannot meet AA is a defect, and one that could meet AAA and doesn't is a finding.** This is stricter than AA and overrides every other number below.

| Requirement | Level | Mechanism |
|---|---|---|
| Contrast, text | **AAA 1.4.6: 7:1** body, 4.5:1 large (≥24px, or ≥18.66px bold) | Every legal fg/bg pairing is enumerated in the token source; `scripts/check-contrast.ts` runs all six themes and exits non-zero; every text pair is held to 7:1, with no large-text discount. No exception list. A theme that fails is re-authored (§10, criterion 1), never relaxed. The earlier AA-era core accent `#0079a8` is 4.88:1, so it moves to `#005778` (§4.1). |
| Contrast, non-text | AA 1.4.11: 3:1 for UI boundaries, focus rings, icons | Same script, same run. |
| Visible focus | **AAA 2.4.13**: ≥2px solid, 3:1 against adjacent colors, never obscured (**AA 2.4.11**) | One global `:focus-visible` rule in `tokens.css` (2px solid `--focus-ring`, 2px offset). Components never restyle it. Sticky headers and toasts reserve space so a focused element is never under them. `outline-none` without `focus-visible` in the same class string is a CI failure. |
| Target sizes | **AAA 2.5.5: 44×44 CSS px, every pointer, no exception** | `--target-min: 44px`. Any `h-*`/`size-*`/`min-h-*` under 44 inside lumux components fails CI (the blocking sizing gate, now unconditional). Inline text links are exempt per the SC. |
| Motion | AAA 2.3.3 | All `--motion-*` durations collapse to `0.01ms` under `prefers-reduced-motion` and under `[data-reduce-motion="true"]` (test hook). State never conveyed by animation alone. No parallax, no autoplay. |
| Timing | AAA 2.2.3 / 2.2.4 | No time limits on any task. No auto-dismiss of anything the user must act on; errors are sticky. Status toasts may auto-dismiss (they are not required to act on) but are also logged to a reachable list. |
| Keyboard | AAA 2.1.3: everything, no exceptions | Radix for dialog/popover/menu/tooltip/select; other inputs kept native (`NativeSelect` keeps the platform picker). Hover-only is banned (§5.5). Focus order tested per component. |
| Dragging | AA 2.5.7 | Every drag has a click/keyboard alternative. |
| Location & help | AAA 2.4.8, 3.3.5 | Breadcrumb or `aria-current` on every surface; help reachable from every screen in the same place (header). |
| Redundant entry, auth | AA 3.3.7, **AAA 3.3.9** | Forms never re-ask what the session knows; lumux ships no authentication UI that would need a cognitive test; lumux forms expose autocomplete tokens. |
| Skip links & landmarks | A 2.4.1 | `SkipLink` + `id="main"` are part of the lumux `AppShell`, not opt-in. |
| Audit | — | `@axe-core/playwright` runs on every lumux component at 320px and 200% zoom in lumux CI; consumers run it on every route. Manual screen-reader pass (VoiceOver + NVDA) per component before a minor release. |
| Maintainable by 1–2 devs | — | One package, one token source, generated outputs, seven scripts and one shared module in `scripts/`. No Storybook, no VRT SaaS, no Style Dictionary. |

Not adopted, with reason: AAA 3.1.5 (lower-secondary reading level) is applied to copy rules (§5.6) as guidance, not gated. AAA 1.2.6 (sign language for prerecorded audio) is a content requirement, not a UI-system one; it is the product itself.

---

## 4. Phase 1 — The standard

### 4.1 Color

**Vocabulary** (identical across all sets and modes; a component never knows the set):

| Token | Meaning |
|---|---|
| `background` | app canvas |
| `surface`, `surface-raised` | cards/panels; inputs and hover/active layer |
| `foreground`, `foreground-muted`, `foreground-subtle` | text-1/2/3 |
| `border`, `border-strong` | default; focus/hover/emphasis |
| `accent`, `accent-strong`, `accent-foreground`, `accent-soft`, `accent-on-soft` | brand action color and its states |
| `success`, `warning`, `danger`, `info` — each with `-foreground`, `-soft`, `-on-soft` | status |
| `focus-ring` | usually = accent; separate so a set can pick a ring that passes 3:1 on both surfaces |
| `overlay-scrim` | modal backdrop |

Dropped from shadcn's vocabulary on purpose: `card`, `popover`, `primary`, `secondary`, `input`, `ring`. They are per-component names, and `primary`/`secondary` say nothing about meaning.

**Extension layer.** An app may declare additional tokens in its own file, namespaced (for example `--app-status-responded`). Rules: same naming shape, same day/night authoring, must be added to that app's contrast check. lumux never learns them. This keeps domain colors out of the shared vocabulary.

**Content colors** are not tokens: user-chosen label swatches, chroma-key greens, brand marks. They stay hardcoded with a `/* content color */` marker so the hex gate can skip them.

**Six themes, two families (D19, revised 2026-10-08).** core day and night (the default pair, `system` resolves to it) plus the extended four (dawn, midnight, forest, ocean), each a single named theme with its own light/dark scheme. The 2026-10-04 revision had collapsed to the core pair alone; the maintainers reinstated the extended four on 2026-10-08. No `data-palette`: the theme name is the whole selection. Every theme passes the same AAA gate (378 pairs). The extended themes keep the source hues and move lightness only; `src/tokens/sets/extended.ts` lists each change. The registry is `src/tokens/themes.ts`; the colours join in `src/tokens/sets/index.ts`.

Origin: the CSS custom properties of an existing brand site, chosen by the maintainers. There is no brand guide and no Figma. The hues were first shipped at AA; lumux takes them to AAA. The source scale:

| Ramp | Values |
|---|---|
| ink | 50 `#f6f8fa` · 100 `#eef1f4` · 200 `#e1e6ea` · 300 `#c4ccd3` · 400 `#8a98a3` · 500 `#6b7a85` · 600 `#4a5b68` · 700 `#2c4150` · 800 `#1a2e3a` · 900 `#0a1d2a` |
| primary | `#009fda` (brand) · `#0080b0` (dark) · `#005778` (darker) |
| cyan | bright `#00cde0` · light `#7bf6ff` |
| status | green `#14860b` · orange `#e66f00` · red `#c93312` |

**Final values (Phase 1, 2026-10-04; extended themes added 2026-10-08).** `npm run check:contrast` passes all 378 pairs: 63 per theme × six; every text pair at 7:1; boundaries, focus and chart marks at 3:1. The core source is `src/tokens/sets/core.ts`, the extended source `extended.ts`, and `docs/tokens.md` documents each token and theme.

| Token | Day | Night | Note |
|---|---|---|---|
| `background` / `surface` / `surface-raised` | `#f6f8fa` / `#ffffff` / `#eef1f4` | `#0a1d2a` / `#112634` / `#18303f` | `surface-raised` is the 7:1 floor every text colour is fitted to |
| `foreground` / `-muted` / `-subtle` | `#1a2e3a` / `#2c4150` / `#43535f` | `#eef1f4` / `#c4ccd3` / `#afbbc5` | About 14 / 10 / 7:1 in day. The hierarchy is in the ratio; all three pass. |
| `border` / `border-strong` | `#e1e6ea` / `#6b7a85` | `#22394a` / `#6b7f8d` | `border` is decorative only |
| `accent` / `-strong` / `-foreground` | `#005778` / `#00435d` / `#ffffff` | `#00cde0` / `#4fdcea` / `#0a1d2a` | Day accent = the site's `primary-darker` |
| `accent-soft` / `-on-soft` | `#e8f6fc` / `#005778` | `#0f3446` / `#7bf6ff` | |
| `success` | `#0e5e08`, soft `#eaf5e9` | `#5ed27a`, soft `#123526` | |
| `warning` | `#813e00`, soft `#fdf1e6` | `#f6a95a`, soft `#3a2a16` | |
| `danger` | `#98270e`, soft `#fceeea` | `#ffa28d`, soft `#3d201b` | |
| `info` | = accent, soft `#e8f6fc` | `#7bf6ff`, soft `#0f3446` | |
| `focus-ring` | `#005778` | `#00cde0` | |
| `chart-1..5` | `#0079a8 #a04e00 #6b4de6 #127c0a #b0306a` | `#00a0b0 #cf7a2a #8878e0 #38a456 #cf6396` | Validated for lightness band, CVD separation (≥7.7 ΔE) and 3:1 |

The open item from the AA → AAA pass is closed: lumux has no `control-fill` token. Inputs, hover and wells use `surface-raised`, which is ink-100 in day, and every text colour is fitted to it.

Phase 1 adjustments to this document:
- **Prefix.** CSS custom properties are `--lumux-*`, so adopting lumux next to an app's existing `--background`/`--accent` is additive and collision-free. Tailwind utilities stay unprefixed (`bg-surface`).
- **`foreground-subtle`.** Size buys no contrast discount (§4.2), so `foreground-subtle` cannot be a lighter grey that fails. It is the third step of a hierarchy that passes at every level.
- **Theme runtime.** `applyTheme` / `readTheme` ship framework-free from `lumux/theme` in Phase 1. Phase 2's `<ThemeProvider>` in `/react` wraps them.

`#009fda` (3.0:1 on white) is a brand mark and decorative color only: never text, and never a focus ring on the canvas. The day theme reads more navy than the source brand. AAA requires that, so it is not a bug.

**Selection & persistence.**

```html
<html data-theme="night">
```

- `data-theme` absent = follow `prefers-color-scheme` (the OS decides).
- lumux exports `applyTheme({ theme })`, `readTheme()` and a `<ThemeProvider>`; **lumux persists the value in `localStorage` under the key `lumux-theme`** (D4). An inline script that lumux ships reads it before first paint, so there is no flash. Embedded snippets never persist.
- The token source is one file per family (`src/tokens/sets/core.ts`, `extended.ts`) joined by `sets/index.ts`; a seventh theme is one entry in `themes.ts` plus one `ThemeColors` object. There is no `data-palette`: a theme name is the whole selection.

**The extended four** keep their names, so `ThemeProvider`'s `legacy` option can migrate a pre-lumux `localStorage` key to `lumux-theme` once on first load.

### 4.2 Typography

**Family.** Options:

| Option | Pro | Con |
|---|---|---|
| Inter Variable, self-hosted via `@fontsource-variable/inter` (self-hosted, no CDN) | one file, no Google dependency, works under a strict `default-src 'none'` CSP; Next apps use `next/font/local` with the same file | Apps on another face change it |
| Geist + Geist Mono | designed pair, mono is excellent for telemetry | `next/font/google` only; Vite apps need the npm `geist` package |
| System stack | zero bytes | inconsistent across OS; the "same across products" goal fails on the first screenshot |

**Decided (D7): Inter Variable + Geist Mono, both self-hosted.** `--font-sans: "Inter Variable", system-ui, sans-serif`; `--font-mono: "Geist Mono", ui-monospace, monospace`. Geist Mono is loaded only by apps that use the `data` type role. The embed snippet overrides `--font-sans` to the bare system stack; a webfont will never ship in the snippet.

**Scale** (role-named; size / line-height / weight):

| Role | Default | `dense` variant |
|---|---|---|
| `display` | 30 / 36 / 700 | same |
| `title` | 24 / 32 / 700 | 20 / 28 |
| `heading` | 20 / 28 / 600 | 16 / 24 |
| `subheading` | 16 / 24 / 600 | 14 / 20 |
| `body` | **16 / 24 / 400** | 14 / 20 |
| `body-sm` | 14 / 20 / 400 | 13 / 18 |
| `caption` | 13 / 18 / 400 | 12 / 16 |
| `label` | 12 / 16 / 500, uppercase optional | 11 / 14 |
| `data` | 13 / 18 / 400 mono, `tabular-nums` | 11.5 / 14 |
| `micro` | — | 10 / 12 / 500 **hard floor**, dense only |

Inputs are always ≥16px on `(pointer: coarse)` regardless of variant. Weights: 400/500/600/700 only. Every role, including `micro` at 10px, must hit 7:1 in every theme; size never buys a contrast discount below 24px.

`data-density="dense"` is the single documented density variant. It is set on a container (a dense console frame), not on `<html>`, and is not user-selectable. It changes type and spacing tokens only, never color and **never target size**: controls stay 44px inside the dense variant (D6). Density comes from tighter type and padding around fixed-size controls.

### 4.3 Spacing & sizing

- 4px base. Scale: 4, 8, 12, 16, 20, 24, 32, 48, 64. Dense variant: component paddings step down one (16→12, 12→8).
- `--target-min: 44px`, unconditional. Adjacent targets keep ≥8px gap or a visible boundary.
- `--header-height: 56px` (both apps that have one agree).
- `--sidebar-width: 240px`, `--sidebar-rail: 56px`.
- `--sheet-width: 36rem`.
- Safe area: `--safe-top/--safe-bottom/--safe-left/--safe-right = env(safe-area-inset-*)`, utilities `.safe-*`. Every fixed/sticky element uses them. Apps set `viewport-fit=cover` and never `maximum-scale` / `user-scalable=no`.

### 4.4 Radius, borders, elevation, z-index

- Radius (D10, revised 2026-10-04: "square, barely rounded"): `control` 4, `inset` 2 (a control inside a 2px-padded segmented track), `card` 8, `panel` 8, `pill` 9999. Badges, chips and filter tags use `control`, never `pill`; `pill` is for switch tracks, progress bars and avatars. Dense does not change radius.
- Border: 1px default, 2px emphasis only. Left-rail accents are a prop, never a second `border-*` class.
- Elevation: `flat` (none, default), `raised` (1px soft), `overlay` (floating layers). Nothing else.
- Z-index layers: `base 0`, `sticky 10`, `sidebar 30`, `overlay 40`, `modal 50`, `modal-top 60`, `toast 70`, `tooltip 80`.

### 4.5 Motion

`--motion-fast 120ms`, `--motion-base 180ms`, `--motion-panel 240ms`, `--motion-ease: cubic-bezier(.2,.8,.2,1)`. Under reduced motion all become `0.01ms` (non-zero so `animationend` fires). No blanket `transition: all`.

### 4.6 Embed subset

Delivered as `dist/tokens.embed.css`: a `:host` block with core day values and a `@media (prefers-color-scheme: dark)` override to core night. Contents:

`surface`, `surface-raised`, `foreground`, `foreground-muted`, `border`, `accent`, `accent-foreground`, `focus-ring`, `overlay-scrim`, `radius-control`, `radius-panel`, `radius-pill`, `font-sans`, `motion-base`, `motion-ease`, `target-min`.

Core only, by budget: the snippet has no switcher and the extended themes would cost four more blocks for nothing (D19). A host-facing accent override may map onto `accent`. Estimated cost: 16 declarations × 2 modes ≈ 350 B gz. A consumer's build copies the file from `node_modules/lumux/dist/` into its stylesheet bundle; there is no runtime dependency.

### 4.7 Iconography

lucide-react 1.x, named imports, stroke 1.75, sizes 16 (inline, default) / 20 (chrome) / 14 (dense rows only). Icon-only controls require `aria-label`. Embed snippets keep inlined paths.

### 4.8 Delivery mechanism

| Option | Works for TW4 + Shadow DOM | Update propagation | Maintenance | Verdict |
|---|---|---|---|---|
| A. Published npm package on GitHub Packages | yes | versioned | registry token in every repo + CI | rejected: registry auth is friction for no gain at four consumers |
| B. Tailwind theme file only | no (shadow-DOM embeds) | versioned | low | rejected |
| C. shadcn-style copy-in (registry) | yes | **none** — drift by design; four copies of every fix | low per change, high over time | rejected; this is what exists today |
| D. Monorepo workspace | only if every consumer repo merges | instant | migrating every repo + CI | rejected; not a design-system problem |
| **E. Git-tag install, `dist/` committed** (`npm i github:danieloceno/lumux#v0.3.0`) | yes | versioned by tag; lockfile pins the commit | zero registry setup; a `prepare`-free build step that commits `dist/` on release | **Decided (D2)** |

Package name `lumux`, subpath exports: `/tokens.css`, `/tokens.embed.css`, `/theme.css` (Tailwind v4 `@theme`), `/tokens.host.css` (tokens on `:host`), `/theme-init.js` (inline pre-paint script), `/theme-init.sha256` (its CSP hash), `/theme` (`applyTheme`, `readTheme`), `/react`, `/eslint` (jsx-a11y strict config). Components use Tailwind v4 utilities that resolve through `theme.css`; `theme.css` declares `@source "./react"` itself, so consuming apps add no `@source`. Components are React 19, peer-dep on Radix. A CSS-only consumer imports only CSS and never installs the React peers. pnpm and npm both support git-tag installs; the release script tags and commits `dist/` in the same commit so `git+https` installs need no build.

---

## 5. Shared component specification

Same component, same measurements, same behavior in every app. Deviations are named variants.

### 5.1 Buttons

- Variants: `primary`, `secondary` (outline), `ghost`, `danger`, `danger-outline`, `link`.
- Sizes: `md` 44px; `lg` 48px. **No `sm`.** A "compact" look is padding and type (`dense` variant), never height. Icon-only: 44×44, `aria-label` required.
- Icon placement: leading by default; trailing only for chevrons/external-link.
- Loading: spinner replaces leading icon, label stays, `aria-busy`, width does not change. Disabled: `aria-disabled` + reason via `aria-describedby` when a reason exists. Never `title` as the only channel.

### 5.2 Forms

- Anatomy, top to bottom: label (required marker is text "required" in the label, not an asterisk alone), control, helper (optional, ≤90 chars), error (icon + text, `role=alert` on first appearance, `aria-describedby` wired, `aria-invalid`).
- Label always above. No floating labels, no placeholder-as-label.
- Validation timing: on submit; then on change for fields that have errored (RHF's default). No validation on first blur of an untouched field.
- Library-agnostic: lumux ships `Field`, `Input`, `Textarea`, `Select` (Radix, themed popup), `NativeSelect`, `Checkbox`, `Switch`, `RadioGroup` (native inputs). RHF/zod stay in the app.
- Inputs ≥16px on coarse pointers; control height 44px.
- Autocomplete tokens on every field that maps to a known purpose (1.3.5); no re-entry of known values (3.3.7); no cognitive-test auth (3.3.9).

### 5.3 Cards

- Card: `surface`, 1px `border`, `radius-card`, padding 16 (dense 12), optional header (title `heading`, optional action slot), body, optional footer. Elevation `flat`; `raised` only when it floats. Left-rail accent is a `rail` prop.
- No carousel (D14). If one is ever needed, it is a new proposal with a consumer, not a Phase 2 item.

### 5.4 Modals & sheets

- `Dialog` (Radix): sizes `sm` 400 / `md` 560 / `lg` 800 / `full` (mobile default `<sm` for all sizes — full-screen sheet from the bottom). Header (title `heading`, close button 20px icon top-right), body (scrolls, `overflow-y: auto` is the only scroller), footer.
- Footer order: **secondary/cancel left, primary right** on fine pointers; stacked with primary on top on coarse (`flex-col-reverse`). Destructive primary uses `danger`.
- Dismiss: Escape always; overlay click yes for non-destructive, no when the dialog contains unsaved input (prop `dismissOnOverlay`, default true). Focus trap, focus return to opener (imperative opens supported via `useDialogFocusReturn`), body scroll lock.
- Stacking: one level of nesting allowed (`z-modal-top`); a third throws in dev.
- `Sheet` variant: side panel, `--sheet-width`. `modal` prop: `true` below `lg` always; `modal={false}` above `lg` is a documented variant for pages that must stay operable beside the sheet. One sheet open at a time (coordinator built in).

### 5.5 Interaction rules

- Every pointer interaction has a keyboard path and a touch path. Hover reveals nothing that is not also reachable by focus or tap.
- Tooltip (`Tooltip`, Radix): opens on hover, focus, and long-press; never the only carrier of information. `title` attributes are disallowed on interactive elements in lumux components.
- Drag has a non-drag equivalent (buttons or a menu).
- Nothing auto-dismisses that the user must act on.

### 5.6 UI copy rules

**Boundary, stated first:** text that carries meaning stays. Field labels, error and validation messages, state announcements, live-region text, accessible names, and instructions a user needs to complete a task are never "extra text". Removing them breaks screen-reader and low-vision users. The rules below target redundant and decorative prose only.

| Element | Rule | Budget |
|---|---|---|
| Label | noun phrase naming the value; no trailing colon; no verb | ≤3 words |
| Placeholder | example or format, never the label, never instructions | ≤40 chars |
| Helper text | allowed only if it states a fact the label and layout do not: consequence, format, shortcut, scope, security posture, cross-screen effect. Not allowed: restating the label, restating the section heading, "Enter your…" | ≤90 chars, one per field |
| Error | what is wrong + what fixes it | ≤90 chars |
| Empty state | title (≤5 words) + one line (≤90) + at most one action. The line says what would fill it or how, not "nothing here yet" | |
| Section description | banned unless it states a non-obvious rule (e.g. "Rate changes apply to new entries only") | ≤120 chars |
| Reading level | plain language, one idea per sentence, no jargon a first-time operator wouldn't know (AAA 3.1.5 as guidance) | |
| Toast | one sentence; errors sticky; never the only place an outcome is recorded | ≤90 chars |
| Tooltip | name of an icon-only control, or one keyboard hint | ≤60 chars |

Where explanation goes instead: a help panel fed from a markdown source, a disclosure ("Why?") that opens the help topic, a first-run pass, or a docs link. Never permanently under the control.

Enforcement: the `prose` ratchet (muted/caption/hint text >90 chars) ships in lumux's scripts and is installed in every consumer with a frozen baseline.

### 5.7 Mobile

Full parity on phones is the default: every component works at 320px. Where a product deliberately limits what a phone offers (for example a dense monitoring console), that is a product decision recorded in the product, not a lumux variant. Embeds keep a bottom sheet and use `env(safe-area-inset-bottom)` so notched devices do not clip it.

Verification: every lumux component has a Playwright check at 320px width and at 200% zoom (1280 viewport, CSS zoom 2) asserting no horizontal overflow, all targets ≥44px, and zero axe violations.

---

## 6. Phase 2 — Central repo structure

```
lumux/
  src/tokens/
    vocabulary.ts        token names + legal fg/bg pairings (the contrast script reads this)
    sets/core.ts         day + night values; a second set = a second file
    scale.ts             type, spacing, radius, motion, z, targets
  src/react/             one file per component, barrel index; ThemeProvider + localStorage helper
  scripts/
    build-tokens.ts      → dist/tokens.css, tokens.embed.css, theme.css (TW4 @theme)
    check-contrast.ts    all sets × modes × pairings, exit 1 on any failure
    component-pairs.ts   derives the fg/bg pairs components render; check-contrast fails on any unlisted one
    check-ui-className.mjs, check-disabled-title.sh, check-nested-scrollers.sh   (lifted, parameterized)
    install-gates.sh     copies the three gates + baseline into a consumer repo (lumux-gates.json holds the consumer's roots and exceptions; lumux runs the same gates on itself)
    release.sh           builds dist/, commits it, tags vX.Y.Z
  dist/                  generated, committed on release only (git-tag install, D2)
  docs/tokens.md docs/copy.md docs/components.md
  ARCHITECTURE.md
```

**Consumption.** `npm i github:danieloceno/lumux#vX.Y.Z`, then import `tokens.css` and `@import "lumux/theme.css"` (which carries the `@source`), and mount the components from `/react` with `<ThemeProvider>`. A CSS-only consumer copies or imports `tokens.embed.css` and installs no React peers.

**Versioning.** Semver via git tags; `dist/` committed on the tag commit; the changelog is `CHANGELOG.md`, updated by hand at release. Apps pin exact tags. lumux CI runs contrast + gates + 320px/200% checks on every PR.

**Breaking change.** Major bump (a minor while lumux is `0.x`, called out in the changelog). A token author who renames or removes a token keeps the old name as an alias of the new one (`--lumux-old: var(--lumux-new)`) for one minor before deleting it; there is no alias mechanism in `scripts/build-tokens.ts` yet, so the alias is added by hand. Component API breaks get a one-paragraph migration note in the changelog and, where mechanical, a codemod in `scripts/codemods/`. No app is force-upgraded.

**New app onboards.** Tailwind v4, `npm i github:danieloceno/lumux#vX.Y.Z`, import `tokens.css` + `theme.css`, mount `<ThemeProvider>`, run `install-gates.sh`, add `viewport-fit=cover`.

**Contribution rule.** A new token or component needs a real use in two consumer apps. One-off needs stay in the app's extension layer.

---

## 10. Kill criteria

Stop and re-plan if any of these happens mid-rollout:

1. A core theme cannot pass the contrast script at 7:1 within two authoring rounds → move that hue to the next darker (day) or lighter (night) step until it passes. Never lower to 4.5:1.
2. A dense console cannot fit its control set with 44px controls without a second scroller → it needs an information-architecture pass before a token pass.
3. A dense variant needs a token *value* (not scale) that differs from the shared set → the "one vocabulary" premise is false for consoles; that app keeps its own tokens and consumes components only.
4. An embed's CSS budget cannot fit the subset even day-only → that embed leaves the token system and mirrors the palette by hand.
5. Two apps must pin different lumux majors for more than one release → propagation model is broken; move to copy-in for components and keep only tokens shared.
6. Any consumer forks a lumux component rather than adding a variant → the API is wrong or the "identical everywhere" rule is wrong for that component; decide which before a second fork.
7. A lumux update breaks a production-critical consumer → that consumer upgrades on a release train, never ad hoc.

---

## 11. Decision log

| # | Decision | Alternatives | Why |
|---|---|---|---|
| D1 | Split baseline: one product's token pipeline, another's components and gates | Third product as baseline; greenfield | Highest scores; greenfield discards measured decisions |
| D2 | Delivery = git-tag install with `dist/` committed on the tag; subpath exports (CSS + TW4 theme + React) | GitHub Packages; copy-in; monorepo | Versioned propagation with zero registry setup; a handful of consumers does not justify a registry |
| D3 | CSS custom properties are the contract; Tailwind is a consumer of them | Tailwind-first | Embeds have no Tailwind |
| D4 | One `<html>` attribute, `data-theme` (`data-palette` dropped with D19's revision); **lumux persists it in localStorage** | lumux selects only, apps persist; server-side everywhere | Maintainers' call. Cost: an app that stored theme server-side retires that; theme no longer follows a user across machines |
| D5 | Body 16 mobile-first; one `data-density="dense"` container variant (14 body, 10 floor) | body 14 everywhere; user-selectable density | iOS input zoom; a selectable density was tried and retired |
| D6 | **Target floor 44px everywhere, every pointer** (AAA 2.5.5) | 44 coarse / 32 fine; 24 fine | Maintainers' call under D23. Cost: dense consoles must re-measure their layouts |
| D7 | Inter Variable + Geist Mono, both self-hosted | Geist Sans; system | CSP-safe, one file each, majority; Geist Mono for numeric telemetry |
| D8 | Radix underneath dialogs/popovers/menus/tooltips, and `Select`  | Base UI; hand-rolled | Less code to own. `Select` moved off the native control because Safari draws its popup in the OS appearance, not the page theme |
| D9 | Toast: errors sticky `role=alert`, success auto `role=status`, **lumux-owned `ToastProvider`, no dependency** (revised 2026-10-08; was a sonner wrapper) | sonner via a lumux wrapper | sonner has one `polite` live region, so errors cannot be `role=alert`, and the ×N merge, the cap of 4, "Dismiss all" and the reachable log had to be built on top of it anyway. The provider is ~150 lines |
| D10 | **Radius control 4 / inset 2 / card 8; no pill badges or chips** (revised 2026-10-04; was 6 / 12) | 6 / 12; the source 12 | Maintainers' call: square and barely rounded. Cost: every app's chips and badges lose their pill shape |
| D11 | Elevation flat/raised/overlay | a single shadow | Superset |
| D12 | No bottom tab bar in the standard | add one | Tried and removed in a consumer, with reasons |
| D13 | Sheet non-modal ≥lg is a documented variant | force modal | Live console must stay operable |
| D14 | Carousel out of scope | spec now, build later | Not found in any app; no consumer |
| D15 | Copy rules with explicit boundary; 90-char helper budget; prose ratchet in every app | none | The ratchet already worked in production; boundary prevents "remove text" misreadings |
| D16 | Product-specific; not part of this public document | | |
| D17 | Extension-layer tokens per app (namespaced, contrast-checked, never shared) | fold into lumux | Keeps the vocabulary small; domain colors survive |
| D18 | Rollout: cheapest consumer first, riskiest last | baseline first | Proof on the cheapest app; acceptance on the riskiest |
| D19 | **Six named themes, two families: core day/night + extended dawn/midnight/forest/ocean**, all in every app's CSS, each app offering a subset (revised 2026-10-08; 2026-10-04 had core alone; originally four sets × day/night) | core alone; four sets × day/night with `data-palette` | Maintainers' call: core is the brand and the `system` pair; the extended four are wanted as-is, at AAA. Named themes instead of set × mode because forest/ocean are not a day/night pair. Cost: 378 pairs to verify (automated), +1.3 KB gz in tokens.css, the embed subset still ships core only; midnight's violet is lavender at 7:1 |
| D20 | No Storybook / VRT SaaS / token toolchain | add them | 1–2 maintainers |
| D21 | **Tailwind v4 only**; consumers on v3 upgrade before adopting lumux | ship a v3 preset too | One output to maintain; the upgrade is due anyway. Cost: +1–3 days per app up front |
| D22 | Body 16 / dense variant, radius 4/8 (D10 revised), dialog footer cancel-left, helper text ≤90 chars, no bottom tab bar, cheapest-first rollout | as listed in D5/D10/D12/D15/D18 | Confirmed as recommended |
| D23 | **WCAG 2.2 AAA wherever achievable, AA floor.** Text 7:1, targets 44, focus 2.4.13, no time limits, keyboard 2.1.3, axe in CI + manual SR pass | AA complete; AAA strict | Accessibility is the company's product. AAA-strict rejected because 3.1.5/1.2.6 are content criteria the UI system cannot gate |

