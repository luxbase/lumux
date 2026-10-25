'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { Button } from "./Button.js";
import { cx } from "./cx.js";
// Replaces window.confirm for a destructive row action: it stays in the page,
// lands focus on Keep so a stray Enter keeps the row, and Escape backs out.
export function ConfirmInline({ question, confirmLabel, keepLabel = 'Keep', onConfirm, onCancel, className }) {
    // Focus Keep on mount: this replaces a control the user just pressed, so
    // focus would otherwise fall to <body>. Not `autoFocus`: that is for page
    // load, and jsx-a11y bans it for the same reason.
    const keep = useRef(null);
    useEffect(() => keep.current?.focus(), []);
    // Escape backs out from either button; the group itself is not interactive.
    const onKeyDown = (e) => {
        if (e.key === 'Escape')
            onCancel();
    };
    return (_jsxs("span", { role: "group", "aria-label": typeof question === 'string' ? question : confirmLabel, className: cx('inline-flex flex-wrap items-center gap-2', className), children: [_jsx("span", { className: "text-body-sm text-foreground", children: question }), _jsx(Button, { variant: "danger", onClick: onConfirm, onKeyDown: onKeyDown, children: confirmLabel }), _jsx(Button, { ref: keep, variant: "ghost", onClick: onCancel, onKeyDown: onKeyDown, children: keepLabel })] }));
}
