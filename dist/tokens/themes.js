// The theme registry: every value `data-theme` accepts and whether it is a
// light or a dark scheme. Names only, no colours, so the runtime (`/theme`)
// stays tiny. The colours live in sets/ and are joined in sets/index.ts.
//
// Two families:
//   core     day / night         the default pair: ink and deep blue
//   extended dawn / midnight     warm paper + violet; deep dark + violet
//            forest / ocean      green on paper; navy with cyan
// `system` resolves to the default pair. Every theme passes the same AAA gate.
export const THEME_META = {
    day: { scheme: 'light', family: 'core' },
    night: { scheme: 'dark', family: 'core' },
    dawn: { scheme: 'light', family: 'extended' },
    midnight: { scheme: 'dark', family: 'extended' },
    forest: { scheme: 'light', family: 'extended' },
    ocean: { scheme: 'dark', family: 'extended' },
};
export const THEME_NAMES = Object.keys(THEME_META);
export const SYSTEM_THEME = { light: 'day', dark: 'night' };
export function isThemeName(v) {
    return typeof v === 'string' && Object.hasOwn(THEME_META, v);
}
export function schemeOf(theme) {
    return THEME_META[theme].scheme;
}
