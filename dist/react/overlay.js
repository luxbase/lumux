'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { IconButton } from "./Button.js";
import { cx } from "./cx.js";
// Internal pieces shared by Dialog, Sheet and Drawer. Not exported from the barrel.
let pointerTarget = null;
if (typeof document !== 'undefined') {
    const FOCUSABLE = 'button,a[href],input,select,textarea,summary,[role="button"],[tabindex]';
    const record = (e) => {
        const t = e.target instanceof Element ? e.target : null;
        pointerTarget = t?.closest(FOCUSABLE) ?? null;
    };
    const clear = () => (pointerTarget = null);
    document.addEventListener('pointerdown', record, true);
    // A pointerdown with no click (touch scroll, drag) must not leak into a later keyboard open.
    document.addEventListener('pointercancel', clear, true);
    document.addEventListener('keydown', clear, true);
    document.addEventListener('click', (e) => {
        record(e);
        setTimeout(clear, 0);
    }, true);
}
/**
 * Focus return for imperative opens.
 * Radix returns focus to a `Trigger`; most lumux dialogs open from a row click
 * or a menu action, with no trigger near them. The opener is captured on the
 * closed→open transition, during render, which is the one moment that still
 * sees whatever had focus before the panel existed (an `autoFocus` child wins
 * the race against `onOpenAutoFocus`).
 */
export function useFocusReturn(open) {
    const opener = useRef(null);
    const wasOpen = useRef(false);
    if (open && !wasOpen.current && typeof document !== 'undefined') {
        const active = document.activeElement;
        // Safari doesn't focus a clicked button: focus stays on body, or lands on a
        // focusable ancestor (e.g. main[tabindex=-1]). Fall back to the pointer target.
        const unfocused = !active || active === document.body || (!!pointerTarget && active.contains(pointerTarget));
        opener.current = unfocused ? (pointerTarget ?? active) : active;
    }
    wasOpen.current = open;
    return (event) => {
        const el = opener.current;
        // Nothing usable was focused (a row replaced by a refresh is detached): let Radix return focus to its Trigger.
        if (!el || el === document.body || !el.isConnected)
            return;
        event.preventDefault();
        el.focus();
    };
}
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const mq = matchMedia(query);
        const update = () => setMatches(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, [query]);
    return matches;
}
export const PANEL = 'flex flex-col bg-surface text-foreground shadow-overlay outline-none';
export function OverlayHeader({ title, description, closeLabel, onClose, Title, Description, }) {
    return (_jsxs("div", { className: "flex shrink-0 items-start gap-2 border-b border-border p-4", children: [_jsxs("div", { className: "flex min-w-0 flex-1 flex-col gap-1", children: [_jsx(Title, { asChild: true, children: _jsx("h2", { className: "text-heading", children: title }) }), description && _jsx(Description, { className: "text-body-sm text-foreground-muted", children: description })] }), _jsx(IconButton, { icon: _jsx(X, { "aria-hidden": "true", size: 20 }), "aria-label": closeLabel, onClick: onClose, className: "-m-2 shrink-0" })] }));
}
// Secondary left, primary right on fine pointers; stacked, primary on top, on
// coarse. Pass the buttons in DOM order: cancel first, primary last.
export function OverlayFooter({ children, className }) {
    return (_jsx("div", { className: cx('flex shrink-0 flex-row justify-end gap-2 border-t border-border p-4 pointer-coarse:flex-col-reverse', className), children: children }));
}
// The only scroller: body text and forms scroll here, never the panel.
export function OverlayBody({ children, className }) {
    // scroll-ok: the one body scroller of a dialog / sheet; header and footer stay fixed so the close button and the actions are always reachable
    return _jsx("div", { className: cx('min-h-0 flex-1 overflow-y-auto p-4', className), children: children });
}
