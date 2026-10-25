'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as M from '@radix-ui/react-dropdown-menu';
import { useId } from 'react';
import { cx } from "./cx.js";
const ITEM = 'flex min-h-target cursor-default select-none items-center gap-2 rounded-inset px-3 text-body outline-none data-highlighted:bg-surface-raised';
// Radix DropdownMenu: arrow keys, type-ahead, Escape, focus back to the
// trigger. Items are 44px tall; a dense container keeps them 44.
export function Menu({ trigger, items, align = 'end', label }) {
    const base = useId();
    return (
    // Non-modal: the page stays in the accessibility tree while the menu is
    // open (a modal menu aria-hides a page full of focusable content).
    // Escape, outside click and focus return still work.
    _jsxs(M.Root, { modal: false, children: [_jsx(M.Trigger, { asChild: true, children: trigger }), _jsx(M.Portal, { children: _jsx(M.Content, { align: align, sideOffset: 4, collisionPadding: 8, ...(label ? { 'aria-label': label, 'aria-labelledby': undefined } : {}), className: "z-overlay min-w-menu rounded-card border border-border-strong bg-surface p-1 text-foreground shadow-overlay", children: items.map((item, i) => {
                        if (item.type === 'separator')
                            return _jsx(M.Separator, { className: "my-1 border-t border-border" }, i);
                        if (item.type === 'label')
                            return (_jsx(M.Label, { className: "px-3 py-2 text-label text-foreground-muted", children: item.label }, i));
                        const reasonId = `${base}-${i}`;
                        const showReason = item.disabled && item.disabledReason;
                        return (_jsxs(M.Item, { "aria-disabled": item.disabled || undefined, "aria-describedby": showReason ? reasonId : undefined, onSelect: (e) => {
                                if (item.disabled) {
                                    e.preventDefault();
                                    return;
                                }
                                item.onSelect();
                            }, className: cx(ITEM, item.disabled
                                ? 'cursor-not-allowed text-foreground-subtle'
                                : item.destructive
                                    ? 'text-danger data-highlighted:bg-danger-soft data-highlighted:text-danger-on-soft'
                                    : 'text-foreground'), children: [item.icon, item.label, showReason && (_jsx("span", { id: reasonId, className: "sr-only", children: item.disabledReason }))] }, item.id ?? i));
                    }) }) })] }));
}
