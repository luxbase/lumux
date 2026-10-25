'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Check, Minus } from 'lucide-react';
import { useId } from 'react';
import { cx } from "./cx.js";
import { describedBy, FieldMessages } from "./FieldMessages.js";
const MARK = 'pointer-events-none absolute inset-0 hidden items-center justify-center rounded-inset border-2 border-accent bg-accent text-accent-foreground peer-disabled:border-border-strong peer-disabled:bg-surface-raised peer-disabled:text-foreground-subtle';
// A native checkbox inside its label. The label row is the target (min 44px
// tall), so the drawn box can stay 20px. The input stays native for keyboard,
// forms and AT; its box and the checked mark are drawn with tokens so every
// edge is a pair check-contrast verifies.
export function Checkbox({ label, hint, error, id, className, ...rest }) {
    const generated = useId();
    const inputId = id ?? generated;
    return (_jsxs("div", { className: cx('flex flex-col gap-1', className), children: [_jsxs("label", { htmlFor: inputId, className: "inline-flex min-h-target cursor-pointer items-center gap-3 text-body text-foreground has-disabled:cursor-not-allowed has-disabled:text-foreground-subtle", children: [_jsxs("span", { className: "relative inline-flex shrink-0", children: [_jsx("input", { ...rest, id: inputId, type: "checkbox", "aria-invalid": error ? true : undefined, "aria-describedby": describedBy(inputId, { hint, error }, rest['aria-describedby']), className: "peer size-5 cursor-pointer appearance-none rounded-inset border-2 border-border-strong bg-surface aria-invalid:border-danger disabled:cursor-not-allowed disabled:bg-surface-raised" }), _jsx("span", { "aria-hidden": "true", className: cx(MARK, 'peer-checked:flex'), children: _jsx(Check, { className: "size-3.5" }) }), _jsx("span", { "aria-hidden": "true", className: cx(MARK, 'peer-indeterminate:flex'), children: _jsx(Minus, { className: "size-3.5" }) })] }), label] }), _jsx(FieldMessages, { id: inputId, hint: hint, error: error })] }));
}
