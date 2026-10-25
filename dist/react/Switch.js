'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
import { cx } from "./cx.js";
import { describedBy, FieldMessages } from "./FieldMessages.js";
// role="switch": one bit that applies immediately. A choice submitted with a
// form is a Checkbox. The whole row (label included) is the 44px target; the
// drawn track stays track-shaped.
export function Switch({ label, checked, onCheckedChange, hint, disabled = false, id, className }) {
    const generated = useId();
    const switchId = id ?? generated;
    return (_jsxs("div", { className: cx('flex flex-col gap-1', className), children: [_jsxs("button", { id: switchId, type: "button", role: "switch", "aria-checked": checked, "aria-disabled": disabled || undefined, "aria-describedby": describedBy(switchId, { hint }), onClick: () => !disabled && onCheckedChange(!checked), className: cx('inline-flex min-h-target items-center gap-3 rounded-control text-left text-body', disabled ? 'cursor-not-allowed text-foreground-subtle' : 'text-foreground'), children: [_jsx("span", { "aria-hidden": "true", className: cx('inline-flex h-6 w-11 shrink-0 items-center rounded-pill border-2 p-0.5 transition-colors duration-fast ease-lumux', checked ? 'justify-end border-accent bg-accent' : 'justify-start border-border-strong bg-surface', disabled && 'border-border-strong bg-surface-raised'), children: _jsx("span", { className: cx('block size-4 rounded-pill', disabled ? 'bg-foreground-subtle' : checked ? 'bg-accent-foreground' : 'bg-foreground-muted') }) }), _jsx("span", { children: label })] }), _jsx(FieldMessages, { id: switchId, hint: hint })] }));
}
