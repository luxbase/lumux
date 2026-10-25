'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, } from 'react';
import { Button, IconButton } from "./Button.js";
import { cx } from "./cx.js";
const ToastContext = createContext(null);
const ToastLogContext = createContext(null);
// Four on screen; a fifth pushes out the oldest. Errors never auto-dismiss, so
// an unbounded stack would grow off the top of the window, ✕ included.
const MAX_TOASTS = 4;
const MAX_LOG = 50;
// Transient toasts (info, success) go after 4 s. A toast with an action never
// times out: an Undo is a function with a time limit (2.2.1, 2.2.3).
const DURATION = 4000;
// How long a live region keeps its text after its last toast is gone.
const LIVE_CLEAR = 5000;
let nextId = 0;
let nextSeq = 0;
// Errors and warnings are assertive and sticky; info and success are polite
// and time out unless they carry an action. The outcome is also kept in the log, so a toast is never the
// only record of it.
const STYLE = {
    error: { icon: XCircle, accent: 'text-danger', rail: 'border-l-danger', assertive: true },
    warning: { icon: AlertTriangle, accent: 'text-warning', rail: 'border-l-warning', assertive: true },
    success: { icon: CheckCircle2, accent: 'text-success', rail: 'border-l-success', assertive: false },
    info: { icon: Info, accent: 'text-info', rail: 'border-l-info', assertive: false },
};
const DEFAULT_LABELS = { dismiss: 'Dismiss', dismissAll: 'Dismiss all', region: 'Notifications' };
const defaultActionHint = (label) => `${label} available`;
export function ToastProvider({ children, labels = DEFAULT_LABELS }) {
    const [toasts, setToasts] = useState([]);
    const [log, setLog] = useState([]);
    const [live, setLive] = useState({ polite: '', assertive: '' });
    const dismiss = useCallback((id) => setToasts((prev) => prev.filter((x) => x.id !== id)), []);
    const dismissAll = useCallback(() => setToasts([]), []);
    const clear = useCallback(() => setLog([]), []);
    // One timer per transient press, all cleared on unmount. While the pointer or
    // focus is inside the region nothing closes: a timer that fires then is parked
    // and re-armed on leave, so an Undo never vanishes under the user (2.2.1).
    const timers = useRef(new Set());
    const parked = useRef(new Set());
    const hold = useRef({ pointer: false, focus: false });
    const expire = useCallback((lease) => {
        if (hold.current.pointer || hold.current.focus)
            parked.current.add(lease);
        else
            setToasts((prev) => prev.filter((x) => x.lease !== lease));
    }, []);
    const schedule = useCallback((lease, ms) => {
        const handle = setTimeout(() => {
            timers.current.delete(handle);
            expire(lease);
        }, ms);
        timers.current.add(handle);
    }, [expire]);
    useEffect(() => {
        const live = timers.current;
        return () => {
            live.forEach(clearTimeout);
            live.clear();
        };
    }, []);
    // Native listeners: the region is a landmark, not a control, so it takes no
    // React handlers; it only watches whether the user is inside it.
    const region = useRef(null);
    useEffect(() => {
        const el = region.current;
        if (!el)
            return;
        const set = (key, on) => {
            hold.current[key] = on;
            if (hold.current.pointer || hold.current.focus)
                return;
            parked.current.forEach((lease) => schedule(lease, DURATION));
            parked.current.clear();
        };
        const enter = () => set('pointer', true);
        const leave = () => set('pointer', false);
        const focusIn = () => set('focus', true);
        const focusOut = (e) => {
            if (!el.contains(e.relatedTarget))
                set('focus', false);
        };
        el.addEventListener('pointerenter', enter);
        el.addEventListener('pointerleave', leave);
        el.addEventListener('focusin', focusIn);
        el.addEventListener('focusout', focusOut);
        return () => {
            el.removeEventListener('pointerenter', enter);
            el.removeEventListener('pointerleave', leave);
            el.removeEventListener('focusin', focusIn);
            el.removeEventListener('focusout', focusOut);
        };
    }, [schedule]);
    // The live regions exist from mount and only their text changes, which is
    // what screen readers announce reliably. Clearing first re-announces a repeat.
    const announced = useRef(-1);
    const announceTimers = useRef(new Set());
    const clearTimers = useRef({});
    const actionHint = labels.actionHint ?? defaultActionHint;
    useEffect(() => {
        // Once no toast of a kind is left, its region is emptied after a while, so
        // a screen-reader user browsing later does not land on a stale message.
        for (const kind of ['polite', 'assertive']) {
            const shown = toasts.some((x) => STYLE[x.type].assertive === (kind === 'assertive'));
            if (shown) {
                clearTimeout(clearTimers.current[kind]);
                delete clearTimers.current[kind];
            }
            else if (!clearTimers.current[kind]) {
                clearTimers.current[kind] = setTimeout(() => {
                    delete clearTimers.current[kind];
                    setLive((prev) => (prev[kind] ? { ...prev, [kind]: '' } : prev));
                }, LIVE_CLEAR);
            }
        }
        const fresh = toasts.filter((x) => x.seq > announced.current).sort((a, b) => a.seq - b.seq);
        if (!fresh.length)
            return;
        announced.current = fresh[fresh.length - 1].seq;
        for (const kind of ['polite', 'assertive']) {
            const last = fresh.filter((x) => STYLE[x.type].assertive === (kind === 'assertive')).pop();
            if (!last)
                continue;
            let text = last.count > 1 ? `${last.message} ×${last.count}` : last.message;
            if (last.action) {
                const hint = actionHint(last.action.label);
                text += `${/[.!?]$/.test(text) ? '' : '.'} ${hint}${/[.!?]$/.test(hint) ? '' : '.'}`;
            }
            setLive((prev) => ({ ...prev, [kind]: '' }));
            const handle = setTimeout(() => {
                announceTimers.current.delete(handle);
                setLive((prev) => ({ ...prev, [kind]: text }));
            }, 50);
            announceTimers.current.add(handle);
        }
    }, [toasts, actionHint]);
    useEffect(() => {
        const pending = announceTimers.current;
        const stale = clearTimers.current;
        return () => {
            pending.forEach(clearTimeout);
            pending.clear();
            Object.values(stale).forEach(clearTimeout);
            clearTimers.current = {};
        };
    }, []);
    const toast = useCallback((message, { type = 'info', action } = {}) => {
        // Minted outside the updater: StrictMode runs updaters twice.
        const id = nextId++;
        const transient = !STYLE[type].assertive && !action;
        const lease = transient ? id : undefined;
        const item = { id, message, type, count: 1, action, at: new Date(), seq: nextSeq++, lease };
        setLog((prev) => [item, ...prev].slice(0, MAX_LOG));
        setToasts((prev) => {
            // Exact (message, type) merges into ×N. A toast with an action never
            // merges: each Undo undoes its own press.
            const at = action ? -1 : prev.findIndex((x) => x.message === message && x.type === type && !x.action);
            if (at !== -1) {
                const next = [...prev];
                // The bump re-announces it, so it gets a full duration from now.
                next[at] = { ...next[at], count: next[at].count + 1, seq: item.seq, lease };
                return next;
            }
            if (prev.length < MAX_TOASTS)
                return [...prev, item];
            // Full: the oldest toast without an action goes first, so new toasts
            // never push an untimed Undo off screen while a plain one could go.
            const drop = Math.max(0, prev.findIndex((x) => !x.action));
            return [...prev.slice(0, drop), ...prev.slice(drop + 1), item];
        });
        if (lease !== undefined)
            schedule(lease, DURATION);
    }, [schedule]);
    const value = useMemo(() => ({ toast }), [toast]);
    const logValue = useMemo(() => ({ log, clear }), [log, clear]);
    return (_jsx(ToastContext.Provider, { value: value, children: _jsxs(ToastLogContext.Provider, { value: logValue, children: [children, _jsxs("section", { "aria-label": labels.region, ref: region, className: "pointer-events-none fixed inset-x-4 top-4 z-toast flex flex-col gap-2 safe-top sm:inset-x-auto sm:top-auto sm:right-4 sm:bottom-4 sm:w-sheet sm:max-w-full", children: [toasts.length > 1 && (_jsx("div", { className: "pointer-events-auto flex justify-end", children: _jsx(Button, { variant: "secondary", onClick: dismissAll, children: labels.dismissAll }) })), _jsx("div", { className: "flex max-h-96 flex-col gap-2 overflow-y-auto", children: toasts.map((item) => {
                                const s = STYLE[item.type];
                                const Icon = s.icon;
                                return (_jsxs("div", { className: cx('pointer-events-auto flex items-start gap-3 rounded-card border border-border border-l-4 bg-surface p-3 text-body-sm text-foreground shadow-overlay', s.rail), children: [_jsx(Icon, { "aria-hidden": "true", className: cx('mt-1 shrink-0', s.accent) }), _jsxs("span", { className: "flex-1 self-center", children: [item.message, item.count > 1 && _jsxs("span", { className: "ml-1 tabular-nums text-foreground-muted", children: ["\u00D7", item.count] })] }), item.action && (_jsx(Button, { variant: "secondary", className: "shrink-0 self-center", onClick: () => {
                                                dismiss(item.id);
                                                item.action?.run();
                                            }, children: item.action.label })), _jsx(IconButton, { icon: _jsx(X, { "aria-hidden": "true" }), "aria-label": labels.dismiss, onClick: () => dismiss(item.id), className: "-my-2 -mr-2 shrink-0 self-center" })] }, item.id));
                            }) })] }), _jsx("div", { role: "status", "aria-live": "polite", "aria-atomic": "true", className: "sr-only", children: live.polite }), _jsx("div", { role: "alert", "aria-live": "assertive", "aria-atomic": "true", className: "sr-only", children: live.assertive })] }) }));
}
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx)
        throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
}
/** Every toast that was shown, newest first (2.2.3: a toast is never the only record). */
export function useToastLog() {
    const ctx = useContext(ToastLogContext);
    if (!ctx)
        throw new Error('useToastLog must be used inside <ToastProvider>');
    return ctx;
}
const TYPE_WORD = { info: 'Info', success: 'Success', warning: 'Warning', error: 'Error' };
/** A reachable list of past notifications, for a settings page or a help panel. */
export function ToastLog({ emptyText = 'No notifications yet.', typeWords = TYPE_WORD, className }) {
    const { log } = useToastLog();
    if (!log.length)
        return _jsx("p", { className: cx('text-body-sm text-foreground-muted', className), children: emptyText });
    return (_jsx("ol", { className: cx('flex flex-col divide-y divide-border', className), children: log.map((item) => {
            const s = STYLE[item.type];
            const Icon = s.icon;
            return (_jsxs("li", { className: "flex items-start gap-3 py-2 text-body-sm", children: [_jsx(Icon, { "aria-hidden": "true", className: cx('mt-0.5 shrink-0', s.accent) }), _jsxs("span", { className: "flex-1", children: [_jsxs("span", { className: "sr-only", children: [typeWords[item.type], ": "] }), item.message] }), _jsx("time", { dateTime: item.at.toISOString(), className: "shrink-0 text-caption text-foreground-subtle tabular-nums", children: item.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] }, item.id));
        }) }));
}
