'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cx } from "./cx.js";
// The left edge is written per side, width and colour together, so it never
// races the all-sides `border` shorthand in the stylesheet.
const RAIL = {
    none: 'border-l border-l-border',
    accent: 'border-l-4 border-l-accent',
    success: 'border-l-4 border-l-success',
    warning: 'border-l-4 border-l-warning',
    danger: 'border-l-4 border-l-danger',
    info: 'border-l-4 border-l-info',
};
// Card: surface, 1px border, radius-card, padding 16 (dense 12 via --lumux-card-padding).
export function Card({ as: Tag = 'div', elevation = 'flat', rail = 'none', title, headingLevel = 3, action, footer, pad = 'default', className, children, ...rest }) {
    const Heading = `h${headingLevel}`;
    const padding = pad === 'default' ? 'p-card' : '';
    return (_jsxs(Tag, { className: cx('flex flex-col rounded-card border-t border-r border-b border-border bg-surface text-foreground', RAIL[rail], elevation === 'raised' ? 'shadow-overlay' : 'shadow-flat', className), ...rest, children: [(title || action) && (_jsxs("div", { className: cx('flex items-start gap-2 border-b border-border', padding || 'p-card'), children: [title && _jsx(Heading, { className: "min-w-0 flex-1 text-subheading", children: title }), action && _jsx("div", { className: "-m-2 ml-auto shrink-0", children: action })] })), _jsx("div", { className: cx('min-w-0 flex-1', padding), children: children }), footer && _jsx("div", { className: cx('border-t border-border', padding || 'p-card'), children: footer })] }));
}
