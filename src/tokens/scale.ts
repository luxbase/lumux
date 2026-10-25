// Non-colour tokens. Mobile-first: these are the touch
// values, in rem so they follow the user's font size and 200% zoom. `dense`
// overrides type and padding only, never colour, radius or target size.

type TypeRole = { size: string; lineHeight: string; weight: number };

export const TYPE: Record<string, { base: TypeRole; dense: TypeRole }> = {
  display: { base: { size: '1.875rem', lineHeight: '2.25rem', weight: 700 }, dense: { size: '1.875rem', lineHeight: '2.25rem', weight: 700 } },
  title: { base: { size: '1.5rem', lineHeight: '2rem', weight: 700 }, dense: { size: '1.25rem', lineHeight: '1.75rem', weight: 700 } },
  heading: { base: { size: '1.25rem', lineHeight: '1.75rem', weight: 600 }, dense: { size: '1rem', lineHeight: '1.5rem', weight: 600 } },
  subheading: { base: { size: '1rem', lineHeight: '1.5rem', weight: 600 }, dense: { size: '0.875rem', lineHeight: '1.25rem', weight: 600 } },
  body: { base: { size: '1rem', lineHeight: '1.5rem', weight: 400 }, dense: { size: '0.875rem', lineHeight: '1.25rem', weight: 400 } },
  'body-sm': { base: { size: '0.875rem', lineHeight: '1.25rem', weight: 400 }, dense: { size: '0.8125rem', lineHeight: '1.125rem', weight: 400 } },
  caption: { base: { size: '0.8125rem', lineHeight: '1.125rem', weight: 400 }, dense: { size: '0.75rem', lineHeight: '1rem', weight: 400 } },
  label: { base: { size: '0.75rem', lineHeight: '1rem', weight: 500 }, dense: { size: '0.6875rem', lineHeight: '0.875rem', weight: 500 } },
  data: { base: { size: '0.8125rem', lineHeight: '1.125rem', weight: 400 }, dense: { size: '0.71875rem', lineHeight: '0.875rem', weight: 400 } },
  // Dense only. Outside `dense` it resolves to `label`, so a stray use never renders at 10px.
  micro: { base: { size: '0.75rem', lineHeight: '1rem', weight: 500 }, dense: { size: '0.625rem', lineHeight: '0.75rem', weight: 500 } },
};

export const FONT = {
  sans: '"Inter Variable", system-ui, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
};

// An embed snippet never ships a webfont.
export const FONT_SANS_EMBED = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

// Spacing is Tailwind's 4px base and is not redefined. Allowed steps, as a gate
// rule: 1 2 3 4 5 6 8 12 16 (4 8 12 16 20 24 32 48 64px).

export const SIZE = {
  'target-min': '2.75rem', // 44px, every pointer
  'header-height': '3.5rem', // 56
  'sidebar-width': '15rem', // 240
  'sidebar-rail': '3.5rem', // 56
  'sheet-width': '36rem',
  // Dialog panels: 400 / 560 / 800. `full` has no token.
  'dialog-sm': '25rem',
  'dialog-md': '35rem',
  'dialog-lg': '50rem',
  'menu-min-width': '12rem',
  // Bottom-sheet typeahead: comfortably short on a phone, without exceeding its viewport.
  'combobox-sheet-height': 'min(32rem, 85dvh)',
  // Card padding: 16, dense 12. The one spacing value dense changes by token.
  'card-padding': '1rem',
};

export const SIZE_DENSE = { 'card-padding': '0.75rem' };

// Square, barely rounded. `inset` is a control nested
// in a 2px-padded track (segmented controls): 4px outer minus 2px padding.
// `pill` is for switch tracks, progress bars and avatars only, never a badge,
// chip or tag.
export const RADIUS = { control: '0.25rem', inset: '0.125rem', card: '0.5rem', panel: '0.5rem', pill: '9999px' };

export const BORDER_WIDTH = { default: '1px', emphasis: '2px' };

export const SHADOW = {
  flat: 'none',
  raised: '0 1px 2px 0 rgb(10 29 42 / 0.06)',
  overlay: '0 10px 15px -3px rgb(10 29 42 / 0.12), 0 4px 6px -4px rgb(10 29 42 / 0.12)',
};

export const Z = {
  base: 0,
  sticky: 10,
  sidebar: 30,
  overlay: 40,
  modal: 50,
  'modal-top': 60,
  toast: 70,
  tooltip: 80,
};

// All durations collapse to 0.01ms under reduced motion: non-zero, so
// `animationend` and `transitionend` still fire.
export const MOTION = {
  fast: '120ms',
  base: '180ms',
  panel: '240ms',
  ease: 'cubic-bezier(.2,.8,.2,1)',
};

export const FOCUS = { width: '2px', offset: '2px' };
