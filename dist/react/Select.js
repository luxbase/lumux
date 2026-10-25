'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as S from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CONTROL, EDGE, useFieldProps } from "./Field.js";
import { cx } from "./cx.js";
// No outline-none: Radix moves DOM focus through the items, so the global ring marks the keyboard
// position (the only marker left in forced colors, where the highlight background is erased). Inset,
// because the viewport scrolls and would clip a ring drawn outside the item.
const ITEM = 'flex min-h-target cursor-default select-none items-center gap-2 rounded-inset px-3 text-body text-foreground ' +
    'focus-visible:-outline-offset-2 data-highlighted:bg-surface-raised data-disabled:cursor-not-allowed data-disabled:text-foreground-subtle';
// Radix Select: the same popup in every browser, styled like Menu. Arrow
// keys, Home / End, type-ahead, Escape and focus return come from Radix; the
// trigger is a role=combobox button, so the Field label focuses it.
export function Select({ options, value, defaultValue, onValueChange, placeholder, name, disabled, required, autoComplete, className, ...rest }) {
    const { invalid, props } = useFieldProps({ ...rest, required });
    // Tracked here so the selected item can carry `forced-selected` as a class, like SegmentedControl.
    const [inner, setInner] = useState(defaultValue);
    const selected = value ?? inner;
    const trigger = useRef(null);
    const fromLabel = useRef(false);
    // A <label> forwards a click to its control, and Radix opens on any click it did not see a
    // pointerdown for. Native labels only focus; do the same.
    useEffect(() => {
        const onClick = (e) => {
            const label = e.target instanceof Element ? e.target.closest('label') : null;
            if (!label || label.control !== trigger.current)
                return;
            fromLabel.current = true;
            setTimeout(() => (fromLabel.current = false));
        };
        document.addEventListener('click', onClick, true);
        return () => document.removeEventListener('click', onClick, true);
    }, []);
    const { required: isRequired, ...triggerProps } = props;
    return (_jsxs(S.Root, { value: value, defaultValue: defaultValue, onValueChange: (v) => {
            setInner(v);
            onValueChange?.(v);
        }, name: name, disabled: disabled, required: isRequired ?? required, autoComplete: autoComplete, children: [_jsxs(S.Trigger, { ref: trigger, ...rest, onClick: (e) => {
                    if (!fromLabel.current)
                        return;
                    e.preventDefault();
                    trigger.current?.focus();
                }, ...triggerProps, className: cx(CONTROL, EDGE(invalid), 'flex min-h-target items-center justify-between gap-2 px-3 text-left data-placeholder:text-foreground-subtle', className), children: [_jsx(S.Value, { placeholder: placeholder, children: options.find((o) => o.value === selected)?.label }), _jsx(S.Icon, { asChild: true, children: _jsx(ChevronDown, { "aria-hidden": "true", className: "shrink-0 text-foreground-muted" }) })] }), _jsx(S.Portal, { children: _jsx(S.Content, { position: "popper", sideOffset: 4, collisionPadding: 8, 
                    // scroll-ok: a long option list scrolls inside the popup, capped to the space left on screen
                    className: "z-overlay max-h-(--radix-select-content-available-height) w-(--radix-select-trigger-width) min-w-menu overflow-y-auto rounded-card border border-border-strong bg-surface p-1 text-foreground shadow-overlay", children: _jsx(S.Viewport, { children: options.map((o) => (_jsxs(S.Item, { value: o.value, disabled: o.disabled, className: cx(ITEM, o.value === selected && 'forced-selected'), children: [_jsx(S.ItemText, { children: o.label }), _jsx(S.ItemIndicator, { className: "ml-auto flex", children: _jsx(Check, { "aria-hidden": "true" }) })] }, o.value))) }) }) })] }));
}
