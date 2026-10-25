'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
import { cx } from "./cx.js";
import { describedBy, FieldMessages, RequiredMark } from "./FieldMessages.js";
// Native radios in a fieldset: arrow keys, one tab stop and form semantics come
// from the platform. Each label row is a 44px target. The circle and the dot
// are drawn with tokens so every edge is a pair check-contrast verifies.
export function RadioGroup({ legend, name, options, value, onValueChange, hint, error, required = false, requiredLabel, className, }) {
    const id = useId();
    return (_jsxs("fieldset", { "aria-describedby": describedBy(id, { hint, error }), "aria-invalid": error ? true : undefined, className: cx('group/radio flex flex-col gap-1', className), children: [_jsxs("legend", { className: "mb-1 text-body-sm font-medium text-foreground", children: [legend, required && _jsx(RequiredMark, { label: requiredLabel })] }), options.map((o) => (_jsxs("label", { className: "inline-flex min-h-target cursor-pointer items-center gap-3 text-body text-foreground has-disabled:cursor-not-allowed has-disabled:text-foreground-subtle", children: [_jsxs("span", { className: "relative inline-flex shrink-0", children: [_jsx("input", { type: "radio", name: name, value: o.value, checked: value === o.value, disabled: o.disabled, required: required, onChange: () => onValueChange(o.value), className: "peer size-5 cursor-pointer appearance-none rounded-pill border-2 border-border-strong bg-surface group-aria-invalid/radio:border-danger disabled:cursor-not-allowed disabled:bg-surface-raised" }), _jsx("span", { "aria-hidden": "true", className: "pointer-events-none absolute inset-0 hidden items-center justify-center rounded-pill border-2 border-accent bg-surface text-accent peer-checked:flex peer-disabled:border-border-strong peer-disabled:bg-surface-raised peer-disabled:text-foreground-subtle", children: _jsx("span", { className: "size-2 rounded-pill bg-current forced-color-adjust-none" }) })] }), o.label] }, o.value))), _jsx(FieldMessages, { id: id, hint: hint, error: error })] }));
}
