'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as T from '@radix-ui/react-tooltip';
import { useEffect, useRef, useState } from 'react';
/** Mount once at the root, beside IconProvider. */
export function TooltipProvider({ children }) {
    return (_jsx(T.Provider, { delayDuration: 300, skipDelayDuration: 500, children: children }));
}
const LONG_PRESS_MS = 500;
// Opens on hover, on focus and on a long press. Radix ignores touch on
// purpose; the long-press timer below opens it for touch pointers, and the
// release closes it. Never the only carrier of information.
export function Tooltip({ content, children, side = 'top' }) {
    // Always controlled: Radix drives hover and focus through onOpenChange, the
    // long press drives touch (switching controlled/uncontrolled warns in Radix).
    const [open, setOpen] = useState(false);
    const timer = useRef(null);
    const pressed = useRef(false);
    const clear = () => {
        if (timer.current !== null) {
            window.clearTimeout(timer.current);
            timer.current = null;
        }
    };
    useEffect(() => clear, []);
    const onPointerDown = (e) => {
        if (e.pointerType !== 'touch')
            return;
        clear();
        timer.current = window.setTimeout(() => {
            timer.current = null;
            pressed.current = true;
            setOpen(true);
        }, LONG_PRESS_MS);
    };
    const release = () => {
        clear();
        if (pressed.current) {
            pressed.current = false;
            setOpen(false);
        }
    };
    return (_jsxs(T.Root, { open: open, onOpenChange: setOpen, children: [_jsx(T.Trigger, { asChild: true, onPointerDown: onPointerDown, onPointerUp: release, onPointerCancel: release, onPointerLeave: release, children: children }), _jsx(T.Portal, { children: _jsxs(T.Content, { side: side, sideOffset: 6, collisionPadding: 8, className: "z-tooltip max-w-sheet rounded-control bg-foreground px-3 py-2 text-body-sm text-background shadow-overlay", children: [content, _jsx(T.Arrow, { className: "fill-foreground", width: 12, height: 6 })] }) })] }));
}
