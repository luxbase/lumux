'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as P from '@radix-ui/react-popover';
import { X } from 'lucide-react';
import { useId } from 'react';
import { IconButton } from "./Button.js";
// Anchored, non-modal content that is more than a menu: a filter form, a date
// picker, a legend. Focus moves in on open and back to the trigger on close;
// Escape and outside click dismiss. For a confirmation, use a Dialog.
export function Popover({ trigger, title, children, align = 'start', side = 'bottom', open, onOpenChange, closeLabel = 'Close' }) {
    const titleId = useId();
    return (_jsxs(P.Root, { open: open, onOpenChange: onOpenChange, children: [_jsx(P.Trigger, { asChild: true, children: trigger }), _jsx(P.Portal, { children: _jsxs(P.Content, { "aria-labelledby": titleId, align: align, side: side, sideOffset: 4, collisionPadding: 8, className: "z-overlay flex max-w-sheet flex-col gap-3 rounded-card border border-border-strong bg-surface p-4 text-foreground shadow-overlay outline-none", children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx("h2", { id: titleId, className: "flex-1 text-subheading", children: title }), _jsx(P.Close, { asChild: true, children: _jsx(IconButton, { icon: _jsx(X, { "aria-hidden": "true", size: 20 }), "aria-label": closeLabel, className: "-m-2" }) })] }), children] }) })] }));
}
