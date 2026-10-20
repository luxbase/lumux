<h1 align="center">lumux</h1>

<p align="center">
  <strong>Accessible themes and components, with contrast enforced at build time.</strong><br>
  Six WCAG 2.2 AAA themes, one semantic token vocabulary, one React component set.
</p>

<p align="center">
  <a href="https://danieloceno.github.io/lumux/"><strong>Live demo</strong></a> ·
  <a href="./docs/getting-started.md">Getting started</a> ·
  <a href="./docs/tokens.md">Tokens</a> ·
  <a href="./docs/components.md">Components</a> ·
  <a href="./docs/gates.md">Gates</a>
</p>

<p align="center">
  <a href="https://github.com/danieloceno/lumux/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/danieloceno/lumux/ci.yml?branch=main&style=flat-square&label=ci"></a>
  <a href="https://danieloceno.github.io/lumux/"><img alt="Demo" src="https://img.shields.io/github/actions/workflow/status/danieloceno/lumux/demo.yml?branch=main&style=flat-square&label=demo"></a>
  <a href="#status"><img alt="Status: pre-release" src="https://img.shields.io/badge/status-pre--release-orange?style=flat-square"></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-555?style=flat-square"></a>
</p>

<p align="center">
  <a href="#accessibility"><img alt="WCAG 2.2 AAA" src="https://img.shields.io/badge/WCAG_2.2-AAA-1f6f43?style=flat-square"></a>
  <a href="#accessibility"><img alt="Text contrast 7:1" src="https://img.shields.io/badge/text_contrast-7%3A1-1f6f43?style=flat-square"></a>
  <a href="#accessibility"><img alt="Touch targets 44px" src="https://img.shields.io/badge/touch_targets-44px-1f6f43?style=flat-square"></a>
  <a href="#themes"><img alt="Six themes" src="https://img.shields.io/badge/themes-6-005778?style=flat-square"></a>
  <a href="#themes"><img alt="378 pairs checked" src="https://img.shields.io/badge/contrast_pairs-378_checked-005778?style=flat-square"></a>
</p>

<p align="center">
  <a href="#stack"><img alt="React 19" src="https://img.shields.io/badge/React-19-20232a?style=flat-square&logo=react&logoColor=61dafb"></a>
  <a href="#stack"><img alt="Tailwind v4" src="https://img.shields.io/badge/Tailwind-v4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white"></a>
  <a href="#stack"><img alt="TypeScript strict" src="https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript&logoColor=white"></a>
  <a href="#stack"><img alt="Radix primitives" src="https://img.shields.io/badge/Radix-primitives-161618?style=flat-square&logo=radixui&logoColor=white"></a>
  <a href="#versioning"><img alt="Semver via git tags" src="https://img.shields.io/badge/versioning-semver_via_git_tags-555?style=flat-square"></a>
</p>

---

## Table of contents

- [Why lumux](#why-lumux)
- [Status](#status)
- [Consumers](#consumers)
- [Quick start](#quick-start)
- [How it fits together](#how-it-fits-together)
- [Themes](#themes)
- [Accessibility](#accessibility)
- [Components](#components)
- [Gates](#gates)
- [Principles](#principles)
- [Stack](#stack)
- [Package contents](#package-contents)
- [Repo layout](#repo-layout)
- [Development](#development)
- [Versioning](#versioning)
- [Release](#release)
- [Contributing](#contributing)
- [Documents](#documents)
- [Roadmap](#roadmap)
- [License](#license)

---

## Why lumux

lumux is a design system: themes, tokens and React components where accessibility is enforced by the build, not by eye. Six WCAG 2.2 AAA themes, 44px touch targets, every color pair checked on each commit.


Accessibility is usually a review step. In lumux it is a property of the system. A colour pair that fails contrast breaks the build. A control smaller than 44px cannot be built. A dark theme is authored, not inverted.

Every app that adopts lumux uses the same semantic tokens, mounts the same components and runs the same gates. Changing the palette means changing one file, and moving between apps means relearning nothing.

- **AAA tokens.** One semantic vocabulary; every legal text pair is held to 7:1 and verified in all themes.
- **Six themes.** Two families, each authored on its own, not inverted.
- **Installable gates.** `install-gates.sh` puts the same UI checks, with a frozen baseline, into any consumer.
- **Git-tag install.** `npm i github:danieloceno/lumux#vX.Y.Z`; no registry, and nothing upgrades until you change the tag.

## Status

| Area | Scope | State |
|---|---|---|
| Tokens & themes | Token source of truth, six AAA themes, contrast gate, focus and motion primitives | ✅ Shipped · [`docs/tokens.md`](./docs/tokens.md) |
| Components | React 19 set on Radix: actions, forms, overlays, content, toasts | ✅ Shipped · [`docs/components.md`](./docs/components.md) |
| Gates | className, disabled-title and nested-scroller checks, installable into any consumer | ✅ Shipped · [`docs/gates.md`](./docs/gates.md) |
| `1.0.0` | API freeze | ⏳ Planned |

Pre-release: expect breaking changes before `1.0.0`. Pin an exact tag.

## Consumers

| Consumer | What it is | lumux | Constraint |
|---|---|---|---|

## Quick start

```sh
npm i github:danieloceno/lumux#v0.5.0
```

```css
/* app.css */
@import "tailwindcss";
@import "lumux/tokens.css";
@import "lumux/theme.css";   /* also @source's the component classes; no node_modules path needed */
```

Inline the pre-paint script in `<head>`, before any CSS, so a stored dark theme never flashes light (a Vite plugin that injects the shipped file, and the CSP hash in `lumux/theme-init.sha256`, are in [`docs/getting-started.md`](./docs/getting-started.md)):

```html
<script>try{var t=localStorage.getItem("lumux-theme");if(["day","night","dawn","midnight","forest","ocean"].indexOf(t)>-1)document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
```

```tsx
import { AppShell, Button, ThemeProvider, ThemeSwitcher, THEME_NAMES } from "lumux/react";

export function App() {
  return (
    <ThemeProvider>
      <AppShell header={<ThemeSwitcher themes={THEME_NAMES} className="ml-auto" />}>
        <Button onClick={save}>Save</Button>
      </AppShell>
    </ThemeProvider>
  );
}
```

No React? `import { applyTheme } from "lumux/theme"` handles theme selection and persistence without a framework. The full walkthrough is in [docs/getting-started.md](./docs/getting-started.md).

## How it fits together

```mermaid
flowchart LR
  subgraph lumux["lumux"]
    direction TB
    V["vocabulary.ts<br/>token names + legal fg/bg pairs"]
    T["themes.ts<br/>six names + scheme"]
    S["sets/<br/>core · extended"]
    SC["scale.ts<br/>type · spacing · radius · motion · z · targets"]
    B["build-tokens.ts"]
    TS["tsc<br/>tsconfig.build.json"]
    C["check-contrast.ts<br/>six themes × every pairing"]
    R["src/react/<br/>components + ThemeProvider"]
    D["dist/<br/>tokens.css · tokens.host.css<br/>tokens.embed.css · theme.css · theme-init.js"]
    DR["dist/react · dist/theme<br/>JS + .d.ts"]
    G["check:gates<br/>className · disabled-title · nested-scrollers"]
    V --> B
    T --> B
    S --> B
    SC --> B
    B --> D
    R --> TS
    TS --> DR
    G -. "fails the build" .-> R
    V --> C
    S --> C
    C -. "exit 1 on any failure" .-> D
  end

  D -- "theme.css (@theme)" --> A["Tailwind v4 apps"]
  D -- "tokens.host.css" --> SR["Shadow-root UIs"]
  D -- "tokens.embed.css<br/>(16 tokens, no Tailwind)" --> E["Embeds"]
  DR --> A
```

`npm run build` runs `build-tokens.ts` (CSS and `theme-init.js` into `dist/`) and then `tsc` (`dist/react`, `dist/theme`). `npm run check` runs contrast, gates and build together. CSS custom properties are the contract. Tailwind v4 reads them through `theme.css`. Embeds and shadow roots use them directly, without Tailwind.

## Themes

Six themes in two families, all on one vocabulary, all at AAA.

- **core** (`day` / `night`): the default pair. `system` resolves to it.
- **extended** (`dawn` / `midnight` / `forest` / `ocean`): each keeps its source palette's hue and saturation. Only lightness moved, until every pair passed.

| `data-theme` | Scheme | Background / surface | Accent |
|---|---|---|---|
| `day` | light | `#f6f8fa` / `#ffffff` | `#005778` |
| `night` | dark | `#0a1d2a` / `#112634` | `#00cde0` |
| `dawn` | light | `#fdfcfb` / `#ffffff` | `#4326d5` |
| `midnight` | dark | `#0e0e11` / `#17171c` | `#b69ffa` |
| `forest` | light | `#f3f6f5` / `#ffffff` | `#1a5a3a` |
| `ocean` | dark | `#0f131a` / `#171d26` | `#24c0f3` |

`npm run check:contrast` checks 378 legal pairs, 63 per theme: text at 7:1, and boundaries, focus rings and chart marks at 3:1. Full values are in [docs/tokens.md](./docs/tokens.md). [`src/tokens/sets/extended.ts`](./src/tokens/sets/extended.ts) has the derivation notes.

```mermaid
flowchart TD
  A["First paint<br/>(inline theme-init.js)"] --> B{"localStorage<br/>lumux-theme?"}
  B -- yes --> C["apply stored theme"]
  B -- no --> G{"prefers-color-scheme"}
  G -- dark --> H["theme = night"]
  G -- light --> I["theme = day"]
  C --> J["&lt;html data-theme=…&gt;"]
  H --> J
  I --> J
  J --> K["ThemeProvider · switcher writes<br/>the value back to lumux-theme"]
```

- One `<html>` attribute selects the theme: `data-theme`.
- The choice persists in `localStorage["lumux-theme"]`. Embeds never persist it.
- The CSS always ships all six themes. An app offers a subset through `<ThemeSwitcher themes={…}>`.

## Accessibility

WCAG 2.2 **AAA wherever achievable, AA as the floor**. Each rule is enforced, not left to reviewers.

| Criterion | lumux rule | Enforced by |
|---|---|---|
| 1.4.6 Contrast (Enhanced) | Every text pair 7:1 in all six themes, with no large-text discount | `check-contrast.ts` in CI (exit 1 on failure), axe in the e2e harness |
| 1.4.11 Non-text contrast | Control edges, focus rings and chart marks 3:1 on every surface | `check-contrast.ts` |
| 2.5.5 Target size (Enhanced) | 44 × 44px minimum for every pointer, dense layouts included | e2e measures every target in every theme, density and viewport |
| 2.4.13 Focus appearance | 2px solid outline, never obscured, one definition, forced-colors safe | Focus primitive, per-element focus-visible diff in e2e |
| 2.1.3 Keyboard (no exception) | Everything works without a pointer; nothing depends on hover | Component contracts, manual screen-reader pass |
| 2.2.3 No timing | No time limits; error, warning and action toasts never auto-dismiss | `ToastProvider`, `role=alert`, a reachable toast log |
| 2.3.3 Animation from interactions | Motion tokens collapse under `prefers-reduced-motion` | Motion primitive |
| 2.4.1 Bypass blocks | Skip link in every app shell | `AppShell`, e2e |
| 1.3.5 / 3.3.x Forms | `autocomplete` on every field; errors as icon + text with `role=alert` and `aria-invalid` | `Field`, `eslint-plugin-jsx-a11y` strict config |

The trade-offs were accepted up front: there is no `sm` button size, dark accents read paler than their 4:1 originals, and brand colours that cannot reach 7:1 are kept for brand marks only.

UI code cannot gate content-level criteria such as reading level (3.1.5). They live in [docs/copy.md](./docs/copy.md) as guidance, not as claims.

## Components

Imported from `lumux/react`. Each one documents the accessibility behaviour it guarantees in [docs/components.md](./docs/components.md).

| Group | Components |
|---|---|
| Shell & theme | `AppShell`, `SkipLink`, `useDocumentTitle`, `ThemeProvider`, `useTheme`, `ThemeSwitcher`, `IconProvider` |
| Actions | `Button`, `IconButton`, `LinkButton`, `ConfirmInline`, `Spinner` |
| Forms | `Field`, `Input`, `Select`, `Textarea`, `Checkbox`, `RadioGroup`, `Switch`, `SegmentedControl` |
| Overlays | `Dialog`, `DialogTrigger`, `DialogClose`, `Sheet`, `SheetTrigger`, `SheetClose`, `Drawer`, `Menu`, `Popover`, `Tooltip`, `TooltipProvider` (wrap the app once) |
| Content | `Card`, `Badge`, `EmptyState` |
| Feedback | `ToastProvider`, `useToast`, `ToastLog`, `useToastLog` |

The [live demo](https://danieloceno.github.io/lumux/) shows every component in every state, in all six themes. The e2e suite runs against that same page.

## Gates

Three scripts that fail the build on UI defects that reviews miss. lumux runs them on itself, and `install-gates.sh` installs them into any consumer with a frozen baseline.

| Gate | Catches |
|---|---|
| `check-ui-className.mjs` | Appearance overrides on primitives, raw palette classes, arbitrary values, controls under 44px, off-scale icons, opacity on text, prose over 90 characters |
| `check-disabled-title.sh` | A disabled control whose only reason is a `title` |
| `check-nested-scrollers.sh` | An `overflow-*` with no written reason |

```sh
bash node_modules/lumux/scripts/install-gates.sh --src src
```

Config, ratchets and blind spots are in [docs/gates.md](./docs/gates.md).

## Principles

**Semantic tokens, never raw values.** Apps reference `background`, `foreground`, `accent`, `danger`. Never a hex, a pixel or a per-component colour.

**Every theme is authored.** A dark theme is not an inverted light one. Each of the six is designed and verified on its own.

**Identical everywhere.** Same component, same behaviour, same measurements, same copy conventions. A deviation is a documented variant with a stated reason.

**Mobile-first.** The scale enforces touch targets, thumb reach and safe areas. Layouts hold at 200% zoom and at 320px.

**Say less.** Redundant helper text is a defect. Labels, errors, state announcements and accessible names always stay. Helper text is capped at 90 characters.

**Maintainable by a small team.** No Storybook, no visual-regression SaaS, no token toolchain. One playground, one test suite, plain TypeScript.

## Stack

| Layer | Choice |
|---|---|
| Token contract | CSS custom properties, generated from TypeScript sources |
| Utility layer | Tailwind v4 `@theme` |
| Components | React 19 on Radix primitives |
| Toasts | Own `ToastProvider`: errors sticky, success auto-dismisses |
| Type | Inter Variable + Geist Mono, self-hosted by the app |
| Icons | lucide-react 1.x |
| Testing | `node --test`, Playwright + axe-core |

## Package contents

| Subpath | Contents |
|---|---|
| `lumux/tokens.css` | All six themes, density, focus, motion, base rules |
| `lumux/theme.css` | Tailwind v4 `@theme` mapping |
| `lumux/tokens.embed.css` | 16-token `:host` subset for embeds, minified, no Tailwind |
| `lumux/tokens.host.css` | Every token on `:host`, for UI inside shadow roots |
| `lumux/theme-init.js` | Pre-paint script, to inline |
| `lumux/theme-init.sha256` | CSP hash of `theme-init.js` |
| `lumux/theme` | `applyTheme`, `readTheme`, `resolvedTheme`, `resolvedScheme`, `THEME_NAMES` |
| `lumux/react` | Components, `ThemeProvider`, `ThemeSwitcher` |
| `lumux/eslint` | `eslint-plugin-jsx-a11y` strict config |
| `scripts/install-gates.sh` | Installs the three gates and a frozen baseline into a consumer |

## Repo layout

```
lumux/
├── src/
│   ├── tokens/
│   │   ├── vocabulary.ts     token names + legal fg/bg pairings
│   │   ├── themes.ts         the six theme names and their light/dark scheme
│   │   ├── sets/             core.ts (day, night) · extended.ts (dawn, midnight, forest, ocean)
│   │   └── scale.ts          type · spacing · radius · motion · z · targets
│   ├── theme/                applyTheme · readTheme · resolvedTheme, framework-free
│   └── react/                one file per component, barrel index
├── scripts/
│   ├── build-tokens.ts       → dist/
│   ├── check-contrast.ts     six themes × every pairing, exit 1 on failure
│   ├── component-pairs.ts    fg/bg pairs the components render, read by check-contrast
│   ├── check-*.{mjs,sh}      the three gates
│   ├── install-gates.sh      copies the gates and a frozen baseline into a consumer
│   └── release.sh            builds dist/, commits it, tags vX.Y.Z
├── eslint/a11y.js            jsx-a11y strict config, exported as lumux/eslint
├── playground/               the demo page, also driven by the e2e harness
├── tests/                    unit (node --test) · e2e (Playwright + axe)
├── docs/                     getting-started · tokens · components · gates · copy
└── lumux-gates.json          the gates' config, with a frozen baseline beside it
```

## Development

```sh
npm ci
npm run check        # typecheck, lint, contrast, gates, build, unit
npm run e2e          # axe, 44px targets, focus, 320px / 200% zoom, every theme
npm run playground   # the demo page on localhost:5179
```

CI runs both suites on every PR. Every push to `main` publishes the demo to GitHub Pages. A red gate is never bypassed.

## Versioning

lumux is pre-release (`0.x`): breaking changes can land in a minor, and each one is called out in [`CHANGELOG.md`](./CHANGELOG.md). Breaking means token renames and removals and component API breaks. Semantic versioning on git tags, with `dist/` committed on the tag commit only. A removed token stays as a deprecated alias for one minor before deletion. The alias is hand-written by the author (`build-tokens.ts` has no alias mechanism yet). Pin an exact tag and upgrade on purpose; updates never arrive silently.

## Release

Maintainers cut a tag from a clean, up-to-date `main`:

```sh
npm run release -- X.Y.Z   # scripts/release.sh
```

The script bumps the version and the install snippets in this README and `docs/getting-started.md`, runs `npm run check`, and commits `dist/` on a `release/` branch. It tags that commit `vX.Y.Z`, then untracks `dist/` in a second commit, so `main` never carries build output. It pushes the branch and the tag, opens the release PR and publishes a GitHub release. A minor also needs the manual screen-reader pass (VoiceOver + NVDA). `dist/` exists only on tag commits, which is what a `github:danieloceno/lumux#vX.Y.Z` install fetches. The script uses the maintainers' `git smart` tool, so outside contributors do not run it. The entry for the tag goes in [`CHANGELOG.md`](./CHANGELOG.md).

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). In short: the decisions in [`ARCHITECTURE.md`](./ARCHITECTURE.md) are settled (reopen one with a written case, not a PR); a new token or component needs a real use in at least two consumer apps; every PR passes `npm run check` and `npm run e2e`; commits follow [Conventional Commits](https://www.conventionalcommits.org/). Security reports: [`SECURITY.md`](./SECURITY.md).

## Documents

| Document | Purpose |
|---|---|
| [docs/getting-started.md](./docs/getting-started.md) | Adopting lumux: install, CSS, `<head>`, React root, lint, CI, shadow roots |
| [docs/tokens.md](./docs/tokens.md) | Token reference: the six themes, every colour, type, spacing, motion, focus |
| [docs/components.md](./docs/components.md) | Component contracts, props and the a11y behaviour each one guarantees |
| [docs/gates.md](./docs/gates.md) | The three gates: what each catches, install, config, ratchets, blind spots |
| [docs/copy.md](./docs/copy.md) | UI copy rules and what is never removed |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | The standard and decisions D1-D23 |
| [CHANGELOG.md](./CHANGELOG.md) | Every tag, newest first |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution rules, installing a tag, how releases are cut |
| [SECURITY.md](./SECURITY.md) | How to report a vulnerability |

## Roadmap

Then `1.0.0`, the API freeze. Bugs and requests from outside go in this repo's [issues](https://github.com/danieloceno/lumux/issues).

Kill criteria are explicit and live in [`ARCHITECTURE.md §10`](./ARCHITECTURE.md#10-kill-criteria). The most likely to fire: a hue that cannot reach 7:1 in two authoring rounds moves a step darker (light theme) or lighter (dark theme), never relaxed.

## License

MIT. See [`LICENSE`](./LICENSE).

---

<p align="center"><sub>lumux · accessibility as a property of the system, not a review step</sub></p>
