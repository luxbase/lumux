# Changelog

Every tag, newest first. Install a tag with `npm i github:danieloceno/lumux#vX.Y.Z`. Breaking changes are token renames and removals and component API breaks; removed tokens are kept as hand-written deprecated aliases for one minor first. GitHub Releases carry the same notes, generated from merged PR titles. Every PR adds its bullet under `[Unreleased]`; `scripts/release.sh` folds them into the new tag's section.

## [Unreleased]

Breaking: `Select` is now a Radix Select with an `options` prop, not a native `<select>` with `<option>` children. Forms that want the platform control rename it to `NativeSelect`, which is the previous component unchanged. `@radix-ui/react-select` joins the optional peers (`^2`): the `lumux/react` barrel imports it, so a React consumer must `npm i @radix-ui/react-select` when it moves to this release, Select user or not, or its build fails to resolve it.

- feat(react): `Combobox` typeahead with async loading, custom renderOption slot, create row and coarse-pointer bottom sheet (#9)
- feat(react): `Select` on `@radix-ui/react-select`: the same themed popup in every browser (Safari's native popup followed the OS), items styled like `Menu` (44px, tokens, check on the selected one, `forced-selected` in forced colors), chevron trigger, `Field` wiring through the same props as `Input` so the label focuses the trigger; the native control stays as `NativeSelect`
- chore(ci): `consumer-smoke` job (`npm run smoke:consumer`, also run by `scripts/release.sh` before tagging) packs the package, installs the tarball into a Vite + React 19 + Tailwind 4 app (`tests/consumer`) and fails on a missing `exports` target, types that do not resolve under `moduleResolution: bundler`, component classes Tailwind does not find, or an SSR `renderToString` of any exported component that breaks
- docs: README accuracy pass for v0.5.0
- docs: getting-started covers the `git` a Docker builder stage needs for the GitHub pin, `ThemeProvider` wrapping unauthenticated pages, the byte-exact `theme-init.sha256` (trailing newline, no `trim()`), and monorepo installs that nest lumux under the workspace
- chore(release): `scripts/release.sh` folds `[Unreleased]` into a dated `[X.Y.Z]` section with its release link (`scripts/fold-changelog.sh`), opens a fresh `[Unreleased]`, commits `CHANGELOG.md` on the release commit and fails when `[Unreleased]` has no bullets

## [0.5.0] - 2026-10-14

- fix(react): `Checkbox` and `RadioGroup` draw their box, circle and checked mark with tokens (`border-strong` edge, `danger` when invalid, `accent` / `accent-foreground` when checked, a dash for `indeterminate`) instead of the browser's `accent-color` rendering, and `check:contrast` derives control edges (`border-*`) at 3:1, so 1.4.11 is verified in all six themes
- fix(react): the `danger-outline` `Button` hover uses `danger-on-soft` on `danger-soft` (7.06:1 in `midnight`, was 6.69:1); `check:contrast` now derives the fg/bg pairs components render, per state, from their class strings and fails on any pair `PAIRS` does not list
- fix(tokens): `forced-selected` wins over `bg-*` / `text-*` in forced colors, so the selected `SegmentedControl` segment and `ThemeSwitcher` button are painted `Highlight` / `HighlightText` as documented (Chromium kept `bg-accent`)
- chore(test): `E2E_PORT` moves the Playwright server off 5179, so a second worktree tests its own code
- fix(react): `Dialog`, `Sheet` and `Drawer` return focus to the clicked opener in Safari, which does not focus a clicked button, by falling back to the pointer target when nothing was focused at open
- fix(tooling): `install-gates.sh` rejects a `--src` / `--ui` value that starts with `--`, so `--src --ui x` is a usage error
- fix(react): a `Menu` item `id` with whitespace no longer breaks the disabled reason's `aria-describedby`; the reason's element id is built from the item index
- chore(ci): workflow action SHA pin comments name the exact version (checkout and setup-node v4.4.0, upload-pages-artifact v3.0.1, deploy-pages v4.0.5)
- docs: reconcile docs with code: `ConfirmInline` anatomy and focus after `onConfirm`, axe covers resting states only, the token alias policy is a rule for authors, not a build feature
- fix(react): a `Toast` with an `action` no longer auto-dismisses (an Undo is a function with a time limit, WCAG 2.2.1 / 2.2.3); it is announced with an action hint ("Entry deleted. Undo available.", `ToastLabels.actionHint` is optional); the polite and assertive live regions are emptied 5 s after the last toast of their kind is gone; `ToastItem.seq` is marked `@internal`; a full stack pushes out the oldest toast without an action before an Undo

## [0.4.0] - 2026-10-14

Breaking: `ToastItem` (returned by `useToastLog()`) gained a required `seq: number`. Code that builds `ToastItem` values by hand, such as test fixtures, must add it; `ToastProvider` sets it. It is internal and is marked so from the next release.

- docs(react): document that the native `Select` popup follows the page `color-scheme` in Chrome and the OS in Safari and mobile pickers, and test the scheme without `data-theme`
- feat(react): add `headingLevel` (2-6, default 3) to `Card` so its title fits the page heading outline
- fix(react): `Field` labels the control by its own `id` when it has one, so `<Field label="Email"><Input id="email" /></Field>` keeps its accessible name
- fix(react): a third nested `Dialog` logs a dev-only `console.error` instead of throwing, so production bundles never unmount the tree
- fix(react): `ToastProvider` renders persistent polite and assertive live regions and writes each toast into them, so success and info toasts are announced reliably; the visible toast no longer carries a live role
- fix(tokens): `theme.css` ships `@source "./react"`, so consumers no longer add a `node_modules` path to their CSS and overlays cannot render unstyled from a wrong path
- docs: document the full provider stack (`TooltipProvider`, `ToastProvider`), a Vite recipe that injects `theme-init.js`, a new product checklist; ship `dist/theme-init.sha256` (`lumux/theme-init.sha256`) as the CSP hash
- chore(tooling): `install-gates.sh` reports a missing `--src` / `--ui` value, surfaces the gate's error when the baseline cannot be written, and says when `--src` / `--ui` are ignored; `ThemeProvider` follows theme changes from other tabs; `Menu` items accept an optional `id` key; add `sideEffects` to `package.json`
- chore(ci): least-privilege `permissions`, `concurrency` and commit-SHA-pinned actions in the workflows; add grouped Dependabot updates (npm weekly, github-actions monthly); run the overlay e2e specs on WebKit as well as Chromium; the focus-return specs open their dialog by keyboard because WebKit does not focus a clicked button

## [0.3.0] - 2026-10-08

Phase 2 complete: overlays, content and feedback components, own `ToastProvider` (no sonner), three installable gates via `scripts/install-gates.sh`.

- feat(gates): installable gates and component docs
- feat(react): content and feedback: Card, Badge, EmptyState, ConfirmInline, Toast
- chore(demo): publish the playground to GitHub Pages from main
- feat(react): overlays: Dialog, Sheet, Drawer, Tooltip, Menu, Popover
- Sync community files, `ARCHITECTURE.md` and the README License / Roadmap sections; `scripts/release.sh` can now cut a tag at the current `package.json` version.
- Add MIT `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md` and this changelog; add package metadata (`license`, `repository`, `homepage`, `bugs`, `description`, `keywords`).
- Remove internal analysis prompts and private product inventories from the repository and from `ARCHITECTURE.md`; the install no longer mentions private-repo access.
- Add `CODEOWNERS`, a pull request template and bug / feature issue templates.
- chore(release): sync the install pin and release notes on release

## 0.2.0 - 2026-10-08

Six named themes (core day/night + extended dawn/midnight/forest/ocean) at AAA, Phase 2a foundation and 2b forms, `/eslint` config, `tokens.host.css`.

- docs(tokens): sync README and docs with the six-theme system
- feat(tokens): six themes: core pair + extended four at AAA
- feat(react): forms
- feat(tokens): square radius: control 4, inset 2, card 8, no pill chips
- feat(react): React foundation, Button family, a11y harness
- feat(tokens): add `tokens.host.css` for shadow-root consumers

## 0.1.0 - 2026-10-04

Phase 1: core day/night tokens at AAA, generated `tokens.css` / `theme.css` / `tokens.embed.css`, contrast gate.

- feat(tokens): core tokens, generated CSS, AAA contrast gate
- docs(tokens): adopt core day/night as the only palette at AAA
- docs: README with Mermaid, badges and decision index

[Unreleased]: https://github.com/danieloceno/lumux/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/danieloceno/lumux/releases/tag/v0.5.0
[0.4.0]: https://github.com/danieloceno/lumux/releases/tag/v0.4.0
[0.3.0]: https://github.com/danieloceno/lumux/releases/tag/v0.3.0
