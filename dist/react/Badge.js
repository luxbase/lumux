'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cx } from "./cx.js";
// The dot carries the colour, the word carries the meaning (1.4.1). Each text
// pair below is a legal pair in vocabulary.ts; `filled` uses the -soft tint.
const TONE = {
    neutral: { dot: 'bg-foreground-muted', text: 'text-foreground-muted', fill: 'bg-surface-raised text-foreground-muted' },
    accent: { dot: 'bg-accent', text: 'text-accent', fill: 'bg-accent-soft text-accent-on-soft' },
    success: { dot: 'bg-success', text: 'text-success', fill: 'bg-success-soft text-success-on-soft' },
    warning: { dot: 'bg-warning', text: 'text-warning', fill: 'bg-warning-soft text-warning-on-soft' },
    danger: { dot: 'bg-danger', text: 'text-danger', fill: 'bg-danger-soft text-danger-on-soft' },
    info: { dot: 'bg-info', text: 'text-info', fill: 'bg-info-soft text-info-on-soft' },
};
export function Badge({ tone = 'neutral', filled = false, className, children }) {
    const t = TONE[tone];
    return (_jsxs("span", { className: cx('inline-flex items-center gap-1.5 text-label font-medium whitespace-nowrap', filled ? cx('rounded-control px-2 py-0.5', t.fill) : t.text, className), children: [_jsx("span", { "aria-hidden": "true", className: cx('size-1.5 shrink-0 rounded-pill', filled ? 'bg-current' : t.dot) }), children] }));
}
