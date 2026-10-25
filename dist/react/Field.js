'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDown } from 'lucide-react';
import { Children, createContext, isValidElement, useContext, useEffect, useId, useLayoutEffect, useState, } from 'react';
import { cx } from "./cx.js";
import { describedBy, FieldMessages, RequiredMark } from "./FieldMessages.js";
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const FieldContext = createContext(null);
// Label above, control, hint, error. Wires the control it wraps: id,
// aria-describedby, aria-invalid and required come from here, so a field can't
// be half-connected. Validation timing is the app's (on submit, then on change
// for fields that have errored).
export function Field({ label, hint, error, required = false, requiredLabel, id, children, className }) {
    const generated = useId();
    const fieldId = id ?? generated;
    const [controlId, setControlId] = useState();
    // Server render and first paint: read a single child's own id, before the control registers it.
    const only = Children.count(children) === 1 && isValidElement(children) ? children.props.id : undefined;
    const childId = typeof only === 'string' ? only : undefined;
    return (_jsxs("div", { className: cx('flex flex-col gap-1', className), children: [_jsxs("label", { htmlFor: controlId ?? childId ?? fieldId, className: "text-body-sm font-medium text-foreground", children: [label, required && _jsx(RequiredMark, { label: requiredLabel })] }), _jsx(FieldContext.Provider, { value: { id: fieldId, describedBy: describedBy(fieldId, { hint, error }), invalid: !!error, required, setControlId }, children: children }), _jsx(FieldMessages, { id: fieldId, hint: hint, error: error })] }));
}
export function useFieldProps(own) {
    const field = useContext(FieldContext);
    const setControlId = field?.setControlId;
    useIsoLayoutEffect(() => {
        setControlId?.(own.id);
        return () => setControlId?.(undefined);
    }, [setControlId, own.id]);
    if (!field)
        return { invalid: false, props: {} };
    return {
        invalid: field.invalid,
        props: {
            id: own.id ?? field.id,
            'aria-describedby': cx(field.describedBy, own['aria-describedby']) || undefined,
            'aria-invalid': field.invalid || undefined,
            required: own.required ?? (field.required || undefined),
        },
    };
}
// 16px on every coarse pointer is enforced in tokens.css, dense included.
export const CONTROL = 'w-full rounded-control border bg-surface text-body text-foreground placeholder:text-foreground-subtle transition-colors duration-fast ease-lumux ' +
    'disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-foreground-subtle read-only:bg-surface-raised';
export const EDGE = (invalid) => (invalid ? 'border-danger' : 'border-border-strong');
/** Pass `autoComplete` whenever the field has a known purpose (1.3.5). */
export function Input({ icon, className, ...rest }) {
    const { invalid, props } = useFieldProps(rest);
    const input = (_jsx("input", { ...rest, ...props, className: cx(CONTROL, EDGE(invalid), 'min-h-target', icon ? 'pr-3 pl-10' : 'px-3', !icon && className) }));
    if (!icon)
        return input;
    return (_jsxs("div", { className: cx('relative flex items-center', className), children: [_jsx("span", { "aria-hidden": "true", className: "pointer-events-none absolute left-3 flex text-foreground-muted", children: icon }), input] }));
}
export function Textarea({ className, rows = 4, ...rest }) {
    const { invalid, props } = useFieldProps(rest);
    return (_jsx("textarea", { rows: rows, ...rest, ...props, className: cx(CONTROL, EDGE(invalid), 'min-h-target resize-y px-3 py-2', className) }));
}
/** Native <select>: the platform picker on phones, full keyboard and screen-reader support for free. */
export function NativeSelect({ className, children, ...rest }) {
    const { invalid, props } = useFieldProps(rest);
    return (_jsxs("div", { className: cx('relative flex items-center', className), children: [_jsx("select", { ...rest, ...props, className: cx(CONTROL, EDGE(invalid), 'min-h-target appearance-none pr-10 pl-3'), children: children }), _jsx(ChevronDown, { "aria-hidden": "true", className: "pointer-events-none absolute right-3 text-foreground-muted" })] }));
}
