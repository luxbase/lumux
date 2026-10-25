'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as D from '@radix-ui/react-dialog';
import { createContext, useContext, useEffect } from 'react';
import { cx } from "./cx.js";
import { OverlayBody, OverlayFooter, OverlayHeader, PANEL, useFocusReturn } from "./overlay.js";
// Below `sm` every size is a full-screen sheet from the bottom.
const SIZE = {
    sm: 'sm:max-w-dialog-sm',
    md: 'sm:max-w-dialog-md',
    lg: 'sm:max-w-dialog-lg',
    full: 'sm:max-w-none',
};
// One level of nesting: the second dialog sits at z-modal-top; a third
// is a design error and logs in development.
const Depth = createContext(0);
const DEV = (() => {
    try {
        return process.env.NODE_ENV !== 'production';
    }
    catch {
        return false;
    }
})();
export function Dialog({ open, onOpenChange, title, description, size = 'md', footer, dismissOnOverlay = true, closeLabel = 'Close', children, }) {
    const depth = useContext(Depth);
    useEffect(() => {
        if (depth > 1 && DEV)
            console.error('lumux Dialog: only one level of nesting is allowed (§5.4)');
    }, [depth]);
    const onCloseAutoFocus = useFocusReturn(open);
    const z = depth === 0 ? 'z-modal' : 'z-modal-top';
    const full = size === 'full';
    return (_jsx(D.Root, { open: open, onOpenChange: onOpenChange, children: _jsx(D.Portal, { children: _jsx(D.Overlay, { className: cx('fixed inset-0 grid bg-overlay-scrim', z, 
                // Phones: the panel fills the screen. Desktop: centred with a 16px margin.
                full ? 'p-0' : 'items-end p-0 sm:items-center sm:justify-items-center sm:p-4'), children: _jsx(D.Content, { onCloseAutoFocus: onCloseAutoFocus, onPointerDownOutside: (e) => !dismissOnOverlay && e.preventDefault(), onInteractOutside: (e) => !dismissOnOverlay && e.preventDefault(), className: cx(PANEL, 'h-full w-full max-h-full', full ? '' : 'sm:h-auto sm:rounded-card', SIZE[size]), children: _jsxs(Depth.Provider, { value: depth + 1, children: [_jsx(OverlayHeader, { title: title, description: description, closeLabel: closeLabel, onClose: () => onOpenChange(false), Title: D.Title, Description: D.Description }), _jsx(OverlayBody, { children: children }), footer && _jsx(OverlayFooter, { children: footer })] }) }) }) }) }));
}
/** Wrap the opener for a declarative open; focus return then needs no capture. */
export const DialogTrigger = D.Trigger;
/** Wrap a footer button that closes the dialog (Cancel). */
export const DialogClose = D.Close;
