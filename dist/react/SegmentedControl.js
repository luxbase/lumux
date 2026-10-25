'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cx } from "./cx.js";
// One of 2–5 options, all visible. Native radios underneath (arrow keys, one
// tab stop); the label is what is drawn. The selected segment is a filled
// accent (7:1 against the track), not a tint: a state has to read at 3:1
// (1.4.11), and a tint on surface-raised does not.
export function SegmentedControl({ label, name, segments, value, onValueChange, className, }) {
    return (_jsx("div", { role: "radiogroup", "aria-label": label, className: cx('inline-flex gap-0.5 rounded-control bg-surface-raised p-0.5', className), children: segments.map((s) => (_jsxs("label", { className: cx('inline-flex min-h-target min-w-target cursor-pointer items-center justify-center gap-2 rounded-inset px-3 text-body-sm font-medium transition-colors duration-fast ease-lumux', 
            // The input is visually hidden, so its focus ring is drawn here.
            'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring has-focus-visible:outline-solid', value === s.value ? 'forced-selected bg-accent text-accent-foreground' : 'text-foreground hover:bg-surface'), children: [_jsx("input", { type: "radio", name: name, value: s.value, checked: value === s.value, onChange: () => onValueChange(s.value), className: "sr-only" }), s.icon, s.label] }, s.value))) }));
}
