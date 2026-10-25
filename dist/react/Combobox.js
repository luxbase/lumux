'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as D from '@radix-ui/react-dialog';
import { ChevronDown, LoaderCircle } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { CONTROL, EDGE, useFieldProps } from "./Field.js";
import { useMediaQuery } from "./overlay.js";
import { cx } from "./cx.js";
const optionClass = (active, selected, disabled) => cx('flex min-h-target w-full cursor-default items-center px-3 text-left text-body text-foreground transition-colors duration-fast ease-lumux motion-reduce:transition-none', active && 'bg-surface-raised forced-colors:outline forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-Highlight', selected && 'forced-selected', disabled && 'cursor-not-allowed text-foreground-subtle');
// scroll-ok: a long result set is capped by its popup or bottom sheet; the query input remains reachable above it.
const LIST = 'min-h-0 overflow-y-auto rounded-control border border-border-strong bg-surface p-1 text-foreground shadow-overlay';
const TABBABLE = 'a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
// The next (or previous) tab stop after `from`, as the browser would pick it.
function focusBeside(from, direction) {
    const stops = Array.from(document.querySelectorAll(TABBABLE)).filter((el) => !el.matches(':disabled, [type="hidden"]') && el.getClientRects().length > 0);
    stops[stops.indexOf(from) + direction]?.focus();
}
const defaultFilter = (options, query) => {
    const needle = query.trim().toLocaleLowerCase();
    return needle ? options.filter((option) => option.label.toLocaleLowerCase().includes(needle)) : options;
};
// An editable combobox, rather than a searchable Select: screen readers stay on
// the input and aria-activedescendant identifies the option under the virtual
// cursor. The same input is moved into a modal bottom sheet on coarse pointers.
export function Combobox(allProps) {
    const { options, value, defaultValue, onChange, onQueryChange, loading = false, renderOption, filterOptions = defaultFilter, emptyMessage = 'No results.', createLabel, onCreate, placeholder, name, disabled, required, sheetLabel = 'Options', className, ...rest } = allProps;
    const { invalid, props } = useFieldProps({ ...rest, required });
    // Presence, not definedness: a controlled value cleared to undefined must not fall back to a stale inner one.
    const controlled = 'value' in allProps;
    const [innerValue, setInnerValue] = useState(defaultValue);
    const selectedValue = controlled ? value : innerValue;
    const initialLabel = options.find((option) => option.value === selectedValue)?.label ?? '';
    const [query, setQuery] = useState(initialLabel);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const input = useRef(null);
    const root = useRef(null);
    const lastSynced = useRef(selectedValue);
    // What the input shows again when it closes without a choice, so its text always matches the submitted value.
    const committedLabel = useRef(initialLabel);
    const mobileHadOpen = useRef(false);
    // Tab pressed inside the phone sheet: once the field is back, focus moves on from it (-1 = Shift+Tab).
    const advance = useRef(0);
    const restoringFocus = useRef(false);
    const id = useId();
    const listId = `${id}-listbox`;
    const coarse = useMediaQuery('(pointer: coarse)');
    const filtered = useMemo(() => filterOptions(options, query), [filterOptions, options, query]);
    const trimmed = query.trim();
    const canCreate = !!onCreate &&
        !!createLabel &&
        trimmed.length > 0 &&
        !options.some((option) => option.label.toLocaleLowerCase() === trimmed.toLocaleLowerCase());
    const indexes = filtered.flatMap((option, index) => (option.disabled ? [] : [index])).concat(canCreate ? [filtered.length] : []);
    // Async results can be replaced under the cursor; a position that no longer exists is no position.
    const current = indexes.includes(active) ? active : -1;
    // An externally selected value replaces the search phrase with its label once available.
    useEffect(() => {
        if (selectedValue === undefined) {
            if (lastSynced.current !== undefined) {
                lastSynced.current = undefined;
                committedLabel.current = '';
                setQuery('');
            }
            return;
        }
        const label = options.find((option) => option.value === selectedValue)?.label;
        if (label !== undefined && lastSynced.current !== selectedValue) {
            lastSynced.current = selectedValue;
            committedLabel.current = label;
            setQuery(label);
        }
    }, [options, selectedValue]);
    useEffect(() => {
        if (current < 0 || !open)
            return;
        const el = document.getElementById(`${listId}-option-${current}`);
        el?.scrollIntoView({ block: 'nearest' });
    }, [current, listId, open]);
    useEffect(() => {
        if (!open || coarse)
            return;
        const closeIfOutside = (event) => {
            if (event.target instanceof Node && !root.current?.contains(event.target))
                dismiss();
        };
        document.addEventListener('pointerdown', closeIfOutside);
        return () => document.removeEventListener('pointerdown', closeIfOutside);
    }, [coarse, open]);
    useEffect(() => {
        if (!coarse)
            return;
        if (open) {
            mobileHadOpen.current = true;
            input.current?.focus();
        }
        else if (mobileHadOpen.current) {
            // Once the sheet unmounts, return to its same labelled field.
            mobileHadOpen.current = false;
            restoringFocus.current = true;
            input.current?.focus();
            if (advance.current && input.current)
                focusBeside(input.current, advance.current);
            advance.current = 0;
        }
    }, [coarse, open]);
    const setSearch = (next) => {
        setQuery(next);
        // A new search has no virtual cursor yet: the first ArrowDown lands on its
        // first result, matching an editable native combobox.
        setActive(-1);
        setOpen(true);
        onQueryChange?.(next);
    };
    const close = () => {
        setOpen(false);
        setActive(-1);
    };
    const dismiss = () => {
        setQuery(committedLabel.current);
        close();
    };
    const select = (option) => {
        if (option.disabled)
            return;
        lastSynced.current = option.value;
        committedLabel.current = option.label;
        if (!controlled)
            setInnerValue(option.value);
        setQuery(option.label);
        onChange?.(option.value);
        close();
    };
    const create = () => {
        const next = query.trim();
        if (!next || !onCreate)
            return;
        committedLabel.current = next;
        setQuery(next);
        onCreate(next);
        close();
    };
    const move = (direction) => {
        if (!indexes.length)
            return;
        const position = indexes.indexOf(current);
        // From no position, ArrowUp lands on the last row, not the one before it.
        const next = position < 0 ? (direction === 1 ? 0 : indexes.length - 1) : (position + direction + indexes.length) % indexes.length;
        setActive(indexes[next]);
    };
    const first = () => setActive(indexes[0] ?? -1);
    const last = () => setActive(indexes.at(-1) ?? -1);
    const onKeyDown = (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!open)
                setOpen(true);
            move(1);
        }
        else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open)
                setOpen(true);
            move(-1);
        }
        else if (event.key === 'Home' && open) {
            event.preventDefault();
            first();
        }
        else if (event.key === 'End' && open) {
            event.preventDefault();
            last();
        }
        else if (event.key === 'Enter' && open) {
            event.preventDefault();
            if (current === filtered.length)
                create();
            else if (current >= 0)
                select(filtered[current]);
        }
        else if (event.key === 'Escape' && open) {
            event.preventDefault();
            dismiss();
        }
        else if (event.key === 'Tab' && open) {
            // Tab leaves an editable combobox; it must never make an accidental choice.
            // The modal sheet traps focus, so there it closes first and then hops past the field.
            if (coarse) {
                event.preventDefault();
                advance.current = event.shiftKey ? -1 : 1;
            }
            dismiss();
        }
    };
    const inputProps = {
        ...rest,
        ...props,
        ref: input,
        role: 'combobox',
        type: 'text',
        value: query,
        placeholder,
        disabled,
        autoComplete: rest.autoComplete ?? 'off',
        'aria-autocomplete': 'list',
        'aria-expanded': open,
        'aria-controls': listId,
        'aria-activedescendant': open && current >= 0 ? `${listId}-option-${current}` : undefined,
        onChange: (event) => setSearch(event.target.value),
        onFocus: () => {
            if (restoringFocus.current) {
                restoringFocus.current = false;
                return;
            }
            if (!disabled)
                setOpen(true);
        },
        onClick: () => {
            if (!disabled && !open)
                setOpen(true);
        },
        onKeyDown,
        className: cx(CONTROL, EDGE(invalid), 'min-h-target pr-10 pl-3', className),
    };
    // A listbox may only own options, so the loading and empty rows sit beside it in the same panel.
    const list = (_jsxs("div", { className: LIST, children: [loading && (_jsxs("div", { role: "status", className: "flex min-h-target items-center gap-2 px-3 text-body text-foreground-muted", children: [_jsx(LoaderCircle, { "aria-hidden": "true", className: "animate-lumux-spin" }), " Loading\u2026"] })), !loading && filtered.length === 0 && !canCreate && _jsx("div", { className: "flex min-h-target items-center px-3 text-body text-foreground-muted", children: emptyMessage }), _jsxs("div", { id: listId, role: "listbox", "aria-busy": loading || undefined, children: [filtered.map((option, index) => {
                        const selected = option.value === selectedValue;
                        return (
                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- never focused: the input drives options via aria-activedescendant
                        _jsx("div", { id: `${listId}-option-${index}`, role: "option", "aria-selected": selected, "aria-disabled": option.disabled || undefined, tabIndex: -1, className: optionClass(current === index, selected, option.disabled), onMouseDown: (event) => event.preventDefault(), onClick: () => select(option), children: renderOption ? renderOption(option, { active: current === index, selected }) : option.label }, option.value));
                    }), canCreate && (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- never focused: the input drives options via aria-activedescendant
                    _jsx("div", { id: `${listId}-option-${filtered.length}`, role: "option", "aria-selected": false, tabIndex: -1, className: optionClass(current === filtered.length, false), onMouseDown: (event) => event.preventDefault(), onClick: create, children: typeof createLabel === 'function' ? createLabel(trimmed) : createLabel }))] })] }));
    const field = (_jsxs("div", { className: "relative", children: [_jsx("input", { ...inputProps }), _jsx(ChevronDown, { "aria-hidden": "true", className: "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-foreground-muted" })] }));
    if (coarse) {
        return (_jsxs(_Fragment, { children: [!open && field, name && _jsx("input", { type: "hidden", name: name, value: selectedValue ?? '' }), _jsx(D.Root, { open: open, onOpenChange: (next) => (next ? setOpen(true) : dismiss()), children: _jsx(D.Portal, { children: _jsx(D.Overlay, { className: "fixed inset-0 z-modal bg-overlay-scrim", children: _jsxs(D.Content, { "aria-describedby": undefined, onCloseAutoFocus: (e) => e.preventDefault(), className: "fixed inset-x-0 bottom-0 z-modal flex max-h-combobox-sheet flex-col rounded-t-card bg-surface text-foreground shadow-overlay safe-bottom", children: [_jsx(D.Title, { className: "sr-only", children: sheetLabel }), _jsx("div", { className: "shrink-0 border-b border-border p-4", children: field }), _jsx("div", { className: "min-h-0 flex-1 overflow-y-auto p-4 pt-2", children: list })] }) }) }) })] }));
    }
    return (_jsxs("div", { ref: root, className: "relative", children: [field, name && _jsx("input", { type: "hidden", name: name, value: selectedValue ?? '' }), open && _jsx("div", { className: "absolute z-overlay mt-1 max-h-80 w-full", children: list })] }));
}
