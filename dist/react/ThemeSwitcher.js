'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Monitor, Moon, Sun } from 'lucide-react';
import { schemeOf, SYSTEM_THEME } from "../theme/index.js";
import { cx } from "./cx.js";
import { useTheme } from "./ThemeProvider.js";
const DEFAULT_LABELS = {
    group: 'Theme',
    day: 'Day',
    night: 'Night',
    dawn: 'Dawn',
    midnight: 'Midnight',
    forest: 'Forest',
    ocean: 'Ocean',
    system: 'System',
};
// Labelled toggles rather than one cycling icon: the current choice and the
// alternatives are both readable without trying them. The default offers the
// default pair; an app that ships more lists them in `themes`.
export function ThemeSwitcher({ themes = [SYSTEM_THEME.light, SYSTEM_THEME.dark], system = true, labels, className, }) {
    const { theme, setTheme } = useTheme();
    const text = { ...DEFAULT_LABELS, ...labels };
    const options = system ? [...themes, 'system'] : [...themes];
    // Icons alone tell themes apart only when each scheme appears once (one sun, one moon).
    const iconsDistinct = new Set(themes.map(schemeOf)).size === themes.length;
    return (_jsx("div", { role: "group", "aria-label": text.group, className: cx('inline-flex flex-wrap gap-0.5 rounded-control bg-surface-raised p-0.5', className), children: options.map((value) => {
            const pressed = theme === value;
            const Icon = value === 'system' ? Monitor : schemeOf(value) === 'dark' ? Moon : Sun;
            return (_jsxs("button", { type: "button", "aria-pressed": pressed, onClick: () => setTheme(value), className: cx('inline-flex min-h-target min-w-target items-center justify-center gap-2 rounded-inset px-3 text-body-sm font-medium transition-colors duration-fast ease-lumux', pressed ? 'forced-selected bg-accent text-accent-foreground' : 'text-foreground hover:bg-surface'), children: [_jsx(Icon, { "aria-hidden": "true" }), _jsx("span", { className: iconsDistinct ? 'sr-only sm:not-sr-only' : undefined, children: text[value] })] }, value));
        }) }));
}
