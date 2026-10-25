// Theme selection and persistence. One attribute, `data-theme`, on
// <html>. No attribute means "follow the OS": tokens.css resolves it to the
// default pair with prefers-color-scheme, so a live OS change needs no listener.
import { isThemeName, schemeOf, SYSTEM_THEME } from "../tokens/themes.js";
export { SYSTEM_THEME, THEME_META, THEME_NAMES, isThemeName, schemeOf } from "../tokens/themes.js";
export const THEME_STORAGE_KEY = 'lumux-theme';
function stored() {
    try {
        const v = localStorage.getItem(THEME_STORAGE_KEY);
        return isThemeName(v) ? v : null;
    }
    catch {
        return null;
    }
}
export function readTheme() {
    return stored() ?? 'system';
}
export function systemScheme() {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
export function resolvedTheme(choice = readTheme()) {
    if (choice !== 'system')
        return choice;
    return SYSTEM_THEME[systemScheme()];
}
export function resolvedScheme(choice = readTheme()) {
    return schemeOf(resolvedTheme(choice));
}
export function applyTheme({ theme, persist = true }) {
    const root = document.documentElement;
    if (theme === 'system')
        root.removeAttribute('data-theme');
    else
        root.setAttribute('data-theme', theme);
    if (persist) {
        try {
            if (theme === 'system')
                localStorage.removeItem(THEME_STORAGE_KEY);
            else
                localStorage.setItem(THEME_STORAGE_KEY, theme);
        }
        catch {
            // Storage blocked: the theme still applies for this page view.
        }
    }
    syncThemeColor(theme);
}
// The browser chrome follows the in-app choice, not only the OS: surface in
// a light theme, background in a dark one. Takes the applied choice: with
// `persist: false` storage still holds the previous one.
export function syncThemeColor(choice = readTheme()) {
    const dark = resolvedScheme(choice) === 'dark';
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(dark ? '--lumux-background' : '--lumux-surface')
        .trim();
    if (!value)
        return;
    // Media-scoped tags would win over an unscoped one, so every tag gets the value.
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    if (!metas.length) {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = value;
        document.head.append(meta);
    }
    metas.forEach((meta) => (meta.content = value));
}
