import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { CircleAlert } from 'lucide-react';
export const hintId = (id) => `${id}-hint`;
export const errorId = (id) => `${id}-error`;
/** aria-describedby for a control: the error while there is one, then the hint. */
export function describedBy(id, { hint, error }, extra) {
    return [error ? errorId(id) : null, hint ? hintId(id) : null, extra].filter(Boolean).join(' ') || undefined;
}
// Hint (≤90 chars, docs/copy.md) and error under a control. The error is an
// icon plus text, never colour alone, and role=alert announces it the moment
// it appears (3.3.1, 4.1.3).
export function FieldMessages({ id, hint, error }) {
    return (_jsxs(_Fragment, { children: [hint && (_jsx("p", { id: hintId(id), className: "text-caption text-foreground-muted", children: hint })), error && (_jsxs("p", { id: errorId(id), role: "alert", className: "flex items-start gap-1 text-body-sm text-danger", children: [_jsx("span", { "aria-hidden": "true", className: "flex h-5 shrink-0 items-center", children: _jsx(CircleAlert, { className: "size-4" }) }), _jsx("span", { children: error })] }))] }));
}
/** The required marker is a word in the label, not an asterisk alone. */
export function RequiredMark({ label = 'required' }) {
    return _jsxs("span", { className: "font-normal text-foreground-muted", children: [" (", label, ")"] });
}
