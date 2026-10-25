'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cx } from "./cx.js";
// Empty and error share one shape: icon slot, heading, one line, one action.
// An error state is an alert; an empty one is a status.
export function EmptyState({ icon, title, description, action, tone = 'empty', className }) {
    return (_jsxs("div", { role: tone === 'error' ? 'alert' : 'status', className: cx('flex flex-col items-center gap-2 px-4 py-12 text-center', className), children: [icon && (_jsx("div", { "aria-hidden": "true", className: cx('mb-1 *:size-8', tone === 'error' ? 'text-danger' : 'text-foreground-subtle'), children: icon })), _jsx("p", { className: "text-subheading text-foreground", children: title }), description && _jsx("p", { className: "max-w-sheet text-body-sm text-foreground-muted", children: description }), action && _jsx("div", { className: "mt-2", children: action })] }));
}
