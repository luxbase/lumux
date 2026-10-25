'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { applyTheme, isThemeName, readTheme, resolvedTheme, schemeOf, syncThemeColor, SYSTEM_THEME, THEME_STORAGE_KEY, } from "../theme/index.js";
const ThemeContext = createContext(null);
function migrate(legacy) {
    try {
        const old = localStorage.getItem(legacy.key);
        localStorage.removeItem(legacy.key);
        if (old === null || localStorage.getItem(THEME_STORAGE_KEY) !== null)
            return null;
        const next = legacy.map ? legacy.map[old] : old;
        return isThemeName(next) ? next : null;
    }
    catch {
        return null;
    }
}
export function ThemeProvider({ children, legacy }) {
    // 'system' on the server and the first client render; theme-init.js has
    // already put the stored theme on <html>, so nothing flashes meanwhile.
    const [theme, setThemeState] = useState('system');
    const [resolved, setResolved] = useState(SYSTEM_THEME.light);
    useEffect(() => {
        const migrated = legacy ? migrate(legacy) : null;
        if (migrated)
            applyTheme({ theme: migrated });
        const current = migrated ?? readTheme();
        setThemeState(current);
        setResolved(resolvedTheme(current));
        syncThemeColor();
        // Mount only: the legacy key is read once.
    }, []);
    useEffect(() => {
        if (theme !== 'system')
            return;
        const mq = matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => {
            setResolved(SYSTEM_THEME[mq.matches ? 'dark' : 'light']);
            syncThemeColor();
        };
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [theme]);
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key !== null && e.key !== THEME_STORAGE_KEY)
                return;
            const next = readTheme();
            applyTheme({ theme: next, persist: false });
            setThemeState(next);
            setResolved(resolvedTheme(next));
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);
    const setTheme = useCallback((next) => {
        applyTheme({ theme: next });
        setThemeState(next);
        setResolved(resolvedTheme(next));
    }, []);
    return (_jsx(ThemeContext.Provider, { value: { theme, resolved, scheme: schemeOf(resolved), setTheme }, children: children }));
}
export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx)
        throw new Error('useTheme must be used inside <ThemeProvider>');
    return ctx;
}
