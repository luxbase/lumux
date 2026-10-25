'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as D from '@radix-ui/react-dialog';
import { useEffect } from 'react';
import { cx } from "./cx.js";
import { OverlayBody, OverlayFooter, OverlayHeader, PANEL, useFocusReturn, useMediaQuery } from "./overlay.js";
// One sheet open at a time: opening one closes the others.
const closers = new Set();
export function Sheet({ open, onOpenChange, title, description, side = 'right', modal = true, footer, closeLabel = 'Close', children, }) {
    const onCloseAutoFocus = useFocusReturn(open);
    const wide = useMediaQuery('(min-width: 64rem)');
    const isModal = modal || !wide;
    useEffect(() => {
        if (!open)
            return;
        const close = () => onOpenChange(false);
        closers.forEach((other) => other());
        closers.add(close);
        return () => {
            closers.delete(close);
        };
        // Opening is the event; a new onOpenChange identity must not re-run it.
    }, [open]);
    const panel = (_jsxs(D.Content, { onCloseAutoFocus: onCloseAutoFocus, 
        // Non-modal Radix dialogs close on any outside click or focus; the page
        // beside a non-modal sheet has to stay usable without closing it.
        onInteractOutside: isModal ? undefined : (e) => e.preventDefault(), className: cx(PANEL, 'fixed inset-y-0 z-modal h-full w-full sm:max-w-sheet', side === 'right' ? 'right-0 sm:border-l' : 'left-0 sm:border-r', 'border-border'), children: [_jsx(OverlayHeader, { title: title, description: description, closeLabel: closeLabel, onClose: () => onOpenChange(false), Title: D.Title, Description: D.Description }), _jsx(OverlayBody, { children: children }), footer && _jsx(OverlayFooter, { children: footer })] }));
    return (_jsx(D.Root, { open: open, onOpenChange: onOpenChange, modal: isModal, children: _jsx(D.Portal, { children: isModal ? _jsx(D.Overlay, { className: "fixed inset-0 z-modal bg-overlay-scrim", children: panel }) : panel }) }));
}
export const SheetTrigger = D.Trigger;
export const SheetClose = D.Close;
