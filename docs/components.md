# lumux components

`import { … } from "lumux/react"`. React 19. Peers: `react`, `react-dom`,
`lucide-react`, `@radix-ui/react-slot`, `@radix-ui/react-dialog`, `@radix-ui/react-tooltip`,
`@radix-ui/react-dropdown-menu`, `@radix-ui/react-popover`, `@radix-ui/react-select` (the barrel imports all of them).
`theme.css` carries `@source "./react"`, so Tailwind sees the classes the components use with no
path in your CSS. Only an app that copies `dist/react` elsewhere adds its own `@source`.


Every component here passes the harness (`npm run e2e`):
- zero axe violations in the resting state (hover and pressed pairs are covered by
  `check-contrast`, which checks every legal pair, not by axe);
- no horizontal overflow and every target ≥44×44, in all six themes, default and dense,
  at 1280px, 320px and 200% zoom;
- a 2px solid focus outline on every focusable element, including under forced colors.

Appearance is a prop. `className` adds layout only (margin, width, grid placement); it
never changes colour, size or radius. `check-ui-className.mjs` fails a build that tries
([gates.md](./gates.md)).

Each section below gives the API, the anatomy (what renders, in DOM order) and the keyboard
map. Keyboard behaviour that is the browser's own (Tab, Space on a native input) is not repeated.

## Setup

```tsx
<ThemeProvider legacy={/* optional */}>
  <IconProvider>
    <TooltipProvider>
      <ToastProvider>
        <AppShell header={…} sidebar={…}>{routes}</AppShell>
      </ToastProvider>
    </TooltipProvider>
  </IconProvider>
</ThemeProvider>
```

Without `TooltipProvider`, `Tooltip` throws on render (Radix needs it). Without `ToastProvider`,
`useToast()` and `useToastLog()` throw. Plus the inline `theme-init.js` in `<head>`: see
[getting-started.md](./getting-started.md) for the Vite recipe and the CSP hash.

## ThemeProvider · useTheme · ThemeSwitcher

- `ThemeProvider` wraps `lumux/theme`. It keeps following the OS live while the
  choice is `system`, and keeps `<meta name="theme-color">` in step.
- `legacy` migrates a pre-lumux key once. If the old names are already lumux names,
  `{ key: "app-theme" }` is enough. A `map` translates another vocabulary:
  `{ key: "old-theme", map: { light: "day", dark: "night" } }`. The old key is removed; a
  stored `lumux-theme` wins.
- `useTheme()` returns `{ theme, resolved, scheme, setTheme }`. `resolved` is the theme on
  screen (the default pair when `theme` is `system`); `scheme` is `light` / `dark`.
- `ThemeSwitcher` is a row of labelled toggles with `aria-pressed`, inside `role="group"`.
  - `themes` lists what the app offers, default the pair `["day", "night"]`. Pass
    `THEME_NAMES` for all six. The row wraps. Below `sm` the labels are hidden only when every
    theme has its own icon (one light, one dark); with repeated icons they stay drawn.
  - `system={false}` removes "follow the OS" for an app that pins its themes.
  - A stored theme that is not in `themes` still applies (the CSS carries all six) but no
    toggle reads as pressed. List every theme the app ever offered, or migrate the key.
  - Below `sm` the labels become screen-reader only, because labelled toggles don't fit at
    320px. Each toggle keeps a sun or moon icon by scheme.
  - `labels` translates the visible labels and the group name.

## AppShell · SkipLink · useDocumentTitle

- `AppShell` renders, in order:
  1. a `SkipLink` (2.4.1);
  2. the `<header>` landmark (sticky, `min-h-header`, safe-area top);
  3. the sidebar column, from `lg` up;
  4. `<main id="main" tabIndex={-1}>`.
- While a header exists, the shell sets `scroll-padding-top` so a focused element never
  scrolls under the header (2.4.11).
- Below `lg` the sidebar is not rendered. The app reaches its nav through a `Drawer`.
- `useDocumentTitle("Contacts", "Acme")` sets `Contacts · Acme` (2.4.2).

Anatomy: `a.skip-link` (visible on focus) → `header` → `aside` (from `lg`) → `main#main`.

| Key | Does |
|---|---|
| Tab (first) | Lands on the skip link |
| Enter on it | Moves focus to `main`, past header and sidebar |

## Button · IconButton · LinkButton

| Prop | Values |
|---|---|
| `variant` | `primary`, `secondary`, `ghost`, `danger`, `danger-outline`, `link` |
| `size` | `md` (44px), `lg` (48px). No `sm`: density comes from `data-density="dense"`. |
| `icon` / `trailingIcon` | Leading by default; trailing only for chevrons and external links |
| `badge` | A slot after the label (e.g. a cost badge) |
| `loading` | The spinner replaces the leading icon; the label stays as the accessible name; `aria-busy`; the width does not change |
| `disabled` + `disabledReason` | `aria-disabled`, not the native attribute, so it stays focusable. Clicks are swallowed. The reason is announced through `aria-describedby`. It keeps a 7:1 pair rather than fading. |

- `IconButton` requires `aria-label` and is square: 44×44 for `md`, 48×48 for `lg`. Its
  variant defaults to `ghost`.
- `LinkButton` is for anything that navigates; it is never a button that calls
  `navigate()`. `asChild` renders a router `Link` with the button look.
- Never set `title` on any of them. The lint rule rejects it.

Anatomy: `button` (or `a`) → optional leading icon or `Spinner` → label → optional `badge` →
optional trailing icon → `span.sr-only` with the `disabledReason`.

| Key | Does |
|---|---|
| Enter / Space | Activates. Swallowed while `disabled` or `loading`; the element stays in the tab order |
| Tab | Moves on. A disabled button is still a stop, so its reason is announced |

## Spinner · IconProvider

- `Spinner` is decorative (`aria-hidden`). Under reduced motion it stands still, because
  `--lumux-spin` becomes `none`.
- `IconProvider` sets lucide defaults: 16px, stroke 1.75.
  - Sizes come from classes: `size-3.5` for dense rows, `size-4` by default, `size-5`
    for chrome, `size-8` for an empty-state glyph.
  - Decorative icons get `aria-hidden="true"`.

## Lint

```js
// eslint.config.js
import lumuxA11y from "lumux/eslint";
export default [...lumuxA11y /*, your config */];
```

This is `eslint-plugin-jsx-a11y` strict, plus a ban on `title` on interactive elements.

## Field · Input · Textarea · Select · Combobox · NativeSelect

```tsx
<Field label="Email" hint="We only use it for sign-in links." error={errors.email} required>
  <Input type="email" autoComplete="email" {...register("email")} />
</Field>
```

- `Field` lays out, top to bottom: the label, the control, the hint, then the error.
- `Field` wires the control it wraps: `id`, `aria-describedby` (error first, then hint),
  `aria-invalid` while `error` is set, and `required`. A field can't be half-connected.
  An explicit prop on the control still wins, and the label follows a control's own `id`
  (the hint and error ids stay derived from the `Field` id). Prefer `id` on `Field`.
- "Required" is a word in the label (`requiredLabel` translates it), never an asterisk
  alone.
- The error is an icon plus text, with `role="alert"`, so it is announced when it appears.
  Write what is wrong and what fixes it, in ≤90 characters (docs/copy.md).
- Validation stays with the app (RHF, zod or none). Timing: on submit, then on change for
  fields that have already errored. Never validate on the first blur of an untouched
  field.
- `Input` takes an optional decorative `icon`. `Textarea` resizes vertically.
- `Select` is a Radix Select, so the popup is drawn by lumux in every browser and follows the
  theme (the native popup follows the OS in Safari). It takes `options`
  (`{ value, label, disabled? }`, `value` non-empty), `value` / `defaultValue` /
  `onValueChange`, `placeholder`, `name`, `disabled` and `required`; inside a `Field` it gets
  `id`, `aria-describedby`, `aria-invalid` and `required` like `Input`, and the label focuses
  the trigger (it moves focus, it does not open the popup). `value=""` clears a controlled
  `Select` back to the placeholder; `undefined` would switch it to uncontrolled. The popup is anchored to the trigger (`position="popper"`) and as wide as it.
  Items are 44px tall, dense included, like `Menu` items; the selected one shows a check and is
  painted `Highlight` in forced colors; the keyboard position carries the global focus ring, inset. No search, multi-select or virtualised lists: those
  are a separate component.
- `Combobox` is that separate component: an editable async typeahead. It takes `options`
  (`{ value, label, disabled? }`), controlled `value` / `onChange`, `loading`,
  `onQueryChange`, `emptyMessage`, `renderOption`, and optionally `createLabel` plus
  `onCreate(query)`. The default filter matches labels case-insensitively; pass
  `filterOptions` when results come from a server. `renderOption(option, state)` can render
  an avatar, primary label and secondary detail. Its input is the Field control and exposes
  `role="combobox"`, `aria-expanded`, `aria-controls` and `aria-activedescendant`; results
  are `role="option"` rows, each at least 44px. On a coarse pointer it opens in a modal
  bottom sheet: the input is pinned above the scrolling list and the page scroll is locked.
  Arrow keys move the virtual cursor, Home/End jump, Enter chooses (or creates), Escape
  closes, and Tab closes then moves on without choosing. Typing reopens it.
- `NativeSelect` is the previous `Select`: a native `<select>` with `<option>` children, for
  forms that want the platform picker on phones. Its popup follows the page's `color-scheme`
  (set on `:root` and per theme in `tokens.css`) in Chrome; Safari and mobile pickers follow
  the OS appearance and that is accepted, because the platform picker is the point.
- Pass `autoComplete` whenever the field has a known purpose (1.3.5), and never ask again
  for something the session knows (3.3.7).
- Disabled and read-only fields use `surface-raised` with a 7:1 text pair. An invalid
  field gets a `danger` edge, and the error text says so too.

Anatomy: `label[for]` (with the required word) → control → `p#hint` → `p#error[role=alert]`
with its icon. `Input` with an `icon` wraps the control in a relative `div`; the icon is
`aria-hidden`.

Keyboard: the browser's own. Tab reaches every control, including disabled ones' labels through
the error and hint that `aria-describedby` points at.

`Select` anatomy: `button[role=combobox]` (value or placeholder, chevron) → `div[role=listbox]` →
`div[role=option]` per option (text, check when selected). Keys on the trigger: Enter, Space or
↓ opens; once open: ↑ ↓ move, Home / End jump, a letter type-aheads, Enter or Space selects and
closes, Escape closes. Focus returns to the trigger. Tab does nothing while the popup is open
(Radix keeps focus in the list, like a native picker); close it first.

## Checkbox · Switch · RadioGroup · SegmentedControl

| Component | Use it for | Notes |
|---|---|---|
| `Checkbox` | A choice that is submitted with a form | A native input inside its label; the label row is the 44px target. Takes `hint` / `error`. The box is drawn with tokens, not by the browser: a 2px `border-strong` edge (`danger` when invalid), filled `accent` with an `accent-foreground` check when checked, a dash when the input is `indeterminate` (set it through a `ref`). |
| `Switch` | One setting that applies immediately | `role="switch"`, with a visible label that is also its name, so the whole row is the target. `disabled` uses `aria-disabled`, so it stays focusable. The off knob is `foreground-muted` (10:1). |
| `RadioGroup` | One of several, each needing a full label | Native radios in a `fieldset` / `legend`: arrow keys, one tab stop. Takes `hint`, `error` and `required`. The circle is drawn with tokens: a 2px `border-strong` edge (`danger` when the group has an error), an `accent` ring and dot when checked. |
| `SegmentedControl` | One of 2–5 short options, all visible (view modes, filters) | Native radios, visually hidden; the label draws the segment and the focus ring. The selected segment is filled `accent` (7:1 against the track); a tint would fail 1.4.11. In forced colors it is painted `Highlight`. |

Anatomy. `Checkbox`: `label` row (the 44px target) → `input[type=checkbox]` with its drawn mark → text → hint
→ error. `Switch`: `label` row → `button[role=switch][aria-checked]` with the track and knob →
text. `RadioGroup`: `fieldset` → `legend` (with the required word) → one `label` row per option
→ hint → error. `SegmentedControl`: `div[role=radiogroup]` → one `label` per segment wrapping a
visually hidden `input[type=radio]`.

| Key | Checkbox | Switch | RadioGroup / SegmentedControl |
|---|---|---|---|
| Tab | Each box is a stop | The switch is a stop, disabled too | The group is one stop (the checked option) |
| Space | Toggles | Toggles | Selects the focused option |
| Enter | — | Toggles | — |
| ← ↑ / → ↓ | — | — | Moves and selects, wrapping |

## Dialog · Sheet · Drawer

All three are Radix `Dialog` underneath: focus
trapped, page `aria-hidden`, body scroll locked, Escape closes, focus returns to the opener.

```tsx
<Dialog
  open={open}
  onOpenChange={setOpen}
  title="Edit profile"
  description="Changes apply to every workspace."
  size="md"
  dismissOnOverlay={!dirty}
  footer={
    <>
      <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
      <Button onClick={save}>Save</Button>
    </>
  }
>
  …fields…
</Dialog>
```

| | `Dialog` | `Sheet` | `Drawer` |
|---|---|---|---|
| Use it for | A task that interrupts: confirm, edit one record, a short form | A record or detail panel beside the page, work continues around it | The app's navigation below `lg`, where `AppShell` drops the sidebar |
| Where | Centred; below `sm` every size is a full-screen sheet from the bottom | Right (or `side="left"`), `--sheet-width`, full width below `sm` | Left, always modal, wraps a `<nav>` named by `title` |
| Sizes | `sm` 400 · `md` 560 · `lg` 800 · `full` | one | one |
| Modal | always | `modal` prop. `false` keeps the page operable (e.g. a live console) and only takes effect from `lg` up | always |
| Several | one level of nesting: the second sits at `z-modal-top`; a third throws outside production | one open at a time: opening a sheet closes the others | — |

- `title` is required and visible: it is the accessible name. `description` is wired as
  `aria-describedby`.
- The header carries the one close button (`closeLabel`, default "Close", 20px glyph in a
  44px target). The body is the only scroller. `footer` takes buttons in DOM order, cancel
  first, primary last: that is row order on fine pointers and stacked, primary on top, on
  coarse ones (`pointer-coarse:`).
- `dismissOnOverlay={false}` while the dialog holds unsaved input: the scrim click is
  swallowed, Escape and the close button still work.
- Focus returns to whatever had focus when `open` turned true, so an imperative open from a
  row or a shortcut still returns correctly. `DialogTrigger` / `SheetTrigger` exist for the
  declarative case.
- A destructive primary uses `variant="danger"`; the dialog never changes colour.

Anatomy, all three: `Overlay` (scrim, `z-modal`) → `Content` panel → header (`h2` title,
`p` description, close `IconButton`) → body (the one scroller) → optional footer. `Drawer`
wraps its children in a `nav` named by `title`.

| Key | Does |
|---|---|
| Tab / Shift+Tab | Cycles inside the panel; the page behind is `aria-hidden` and inert |
| Escape | Closes (always, even with `dismissOnOverlay={false}`) and returns focus to the opener |
| Enter on the close button | Same as Escape |
| Open | Focus moves into the panel: an `autoFocus` child wins, otherwise the first focusable element, which is the close button |

## Tooltip · Menu · Popover

| | Use it for | Not for |
|---|---|---|
| `Tooltip` | A few words that add to an already-named control: "Copy the link" on an icon button | The only name of a control; anything the user must read; anything interactive |
| `Menu` | A list of actions on one object: rename, duplicate, delete | Navigation (links), choosing a value (`Select`, `SegmentedControl`) |
| `Popover` | Anchored content that is more than a menu and less than a task: a filter form, a legend | A confirmation (use `Dialog`); hover-only content |

- Mount `<TooltipProvider>` once at the root. `Tooltip` opens on hover, on focus and on a
  500 ms long press; it closes on blur, pointer leave, release and Escape. The trigger
  gets `aria-describedby`. `title` attributes stay banned.
- `Menu` takes `items`: `{ label, icon?, onSelect, destructive?, disabled?, disabledReason? }`
  plus `{ type: "separator" }` and `{ type: "label" }`. Items are 44px tall; destructive
  items are `danger`; disabled items stay focusable, carry their reason through
  `aria-describedby`, and swallow selection. Arrow keys, type-ahead, Escape and focus return
  come from Radix. The menu is non-modal so the page stays in the accessibility tree.
  `label` names the menu when the trigger's own label doesn't.
- `Popover` has a visible `title` (its accessible name) and a close button. Focus moves in on
  open and back to the trigger on close. Controlled with `open` / `onOpenChange` when the app
  must close it after a submit.

Anatomy. `Tooltip`: trigger (yours, `aria-describedby` added) → `div[role=tooltip]` with an
arrow, `z-tooltip`. `Menu`: trigger → `div[role=menu]` → `div[role=menuitem]` per action, each
44px, destructive ones `danger`, disabled ones with an `sr-only` reason → separators and labels.
`Popover`: trigger → `div[role=dialog]` panel → `h2` title + close `IconButton` → children.

| Key | Tooltip | Menu | Popover |
|---|---|---|---|
| Focus / hover / long press | Opens | — | — |
| Enter / Space / ↓ on the trigger | — | Opens, focus on the first item | Opens, focus moves into the panel |
| ↑ ↓ | — | Moves between items, wrapping | — |
| Home / End | — | First / last item | — |
| A letter | — | Type-ahead to the next matching label | — |
| Enter / Space on an item | — | Runs `onSelect` and closes; swallowed when disabled | — |
| Escape | Closes | Closes, focus back to the trigger | Closes, focus back to the trigger |
| Tab | Closes | Closes (a menu is not a tab stop list) | Moves through the panel's controls |

## Card · Badge · EmptyState · ConfirmInline

| Component | Use it for | Notes |
|---|---|---|
| `Card` | A surface lifted off the canvas: one record, one panel | `surface`, 1px `border`, `rounded-card`, `p-card` (16, dense 12). `elevation="raised"` only when it floats. `rail` colours the left edge (`accent` or a status); the meaning is in the content. `title` + `action` make a header (`title` is an `h3`; `headingLevel` 2-6 fits the page outline), `footer` a footer; `pad="none"` for a divided list. `as` picks `li` / `article` / `section`. |
| `Badge` | A status word: Paid, Overdue, Scheduled | A dot plus the word, never the dot alone (1.4.1). `tone` neutral / accent / status; `filled` adds the `-soft` tint. Square corners: a pill reads as pressable. No `title`. |
| `EmptyState` | A list or screen with nothing in it, or that failed to load | Title ≤5 words, one line ≤90 characters saying what would fill it, at most one action. `tone="error"` is `role="alert"`, otherwise `role="status"`. |
| `ConfirmInline` | The confirm before a destructive row action | Replaces `window.confirm`: a group with the question, the destructive verb (`danger`) and Keep. Focus lands on Keep on mount, so a stray Enter keeps; Escape backs out. It replaces its trigger, so on `onCancel` the caller re-renders the trigger and focuses it (2.4.3). After `onConfirm` the component unmounts with focus inside it and focus falls to `<body>`: the caller moves it to the next row or the list's heading. |

Anatomy. `Card`: `div` (or `as`) with the rail as its left border → header (`title`, `action`)
→ body → footer. `Badge`: `span` → `span.dot[aria-hidden]` → word. `EmptyState`:
`div[role=status|alert]` → glyph (`aria-hidden`, 32px) → `p` title (subheading role; the page
keeps its own heading) → `p` line → one action.
`ConfirmInline`: `span[role=group][aria-label]` (the `question` when it is a string, else
`confirmLabel`) → question → `Button variant="danger"` → `Button variant="ghost"` Keep.

| Key | ConfirmInline |
|---|---|
| Mount | Focus on Keep |
| Enter / Space | Activates the focused button (Keep by default) |
| Escape | Same as Keep: `onCancel`, the caller restores and focuses the trigger |
| Tab | Keep ↔ the destructive verb |

```tsx
onConfirm={() => {
  remove(id);
  nextRowRef.current?.focus(); // or the list heading, which needs tabIndex={-1}
}}
```

`Card`, `Badge` and `EmptyState` are not interactive; the action inside an `EmptyState` is a
plain `Button` or `LinkButton`.

## Toast

lumux ships its own provider: no sonner.

```tsx
<ToastProvider>…</ToastProvider>

const { toast } = useToast();
toast('Entry saved.', { type: 'success' });
toast('Could not save the entry.', { type: 'error' });
toast('Entry deleted.', { action: { label: 'Undo', run: restore } });
```

- `error` and `warning` are announced assertively and **never auto-dismiss** (2.2.3). `info` and
  `success` are announced politely and go after 4 s. A toast with an `action` never auto-dismisses
  either: it closes on Dismiss, Dismiss all or running the action. A merge restarts the clock.
  Nothing closes while the pointer or focus is in the toast region.
- The same (message, type) arriving again merges into one toast with ×N and is re-announced
  (`Saved ×2`). A toast with an action never merges.
- Announcements go through two persistent, visually hidden live regions that `ToastProvider`
  renders from mount (`role="status"` polite, `role="alert"` assertive). Their text is cleared and
  re-set per toast so a repeat is read again, and emptied 5 s after the last toast of that kind
  is gone, so nobody browsing later meets a stale message. A toast with an action is announced
  with a hint, "Entry deleted. Undo available." (`labels.actionHint(label)` translates it). The
  visible toasts carry no live role.
- At most 4 on screen; a fifth pushes out the oldest toast without an action, or the oldest
  one when all four have an action. "Dismiss all" appears from 2 up.
- Every toast is also kept in a log (last 50), so it is never the only record of an outcome:
  `useToastLog()` or the ready-made `<ToastLog />` for a settings or help page.
- Phone: top of the screen under the safe area. Desktop: bottom-right.
- One sentence, ≤90 characters. `labels` translates Dismiss / Dismiss all / the region name / the action hint.

Anatomy: `section[aria-label=region]` → optional Dismiss all `Button` → one `div` per toast
with its rail → type icon (`aria-hidden`) → `span` holding the message and the ×N count →
optional action `Button` → Dismiss `IconButton`. After the section, two `sr-only` live regions
(`role=status` polite, `role=alert` assertive). `ToastLog` is an `ol` of `li`.

| Key | Does |
|---|---|
| Tab | Reaches Dismiss all, then each toast's action and Dismiss, in time order |
| Enter / Space on Dismiss | Removes that toast |
| Enter / Space on the action | Runs it and dismisses |
| Focus in the region | Pauses every timer until focus leaves |

No global shortcut: a toast never steals focus, and F6-style region hopping is the screen
reader's own.
