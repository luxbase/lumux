'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Slot } from '@radix-ui/react-slot';
import { useId, } from 'react';
import { cx } from "./cx.js";
import { Spinner } from "./Spinner.js";
const BASE = 'relative inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap select-none transition-colors duration-fast ease-lumux';
// Each fg/bg pair below is a legal pair in vocabulary.ts. Disabled keeps a 7:1
// pair instead of fading: inactive controls are exempt from 1.4.6, but the
// reason they are disabled still has to be readable.
const VARIANT = {
    primary: 'bg-accent text-accent-foreground hover:bg-accent-strong',
    secondary: 'border border-border-strong bg-surface text-accent hover:bg-surface-raised',
    ghost: 'text-foreground hover:bg-surface-raised',
    danger: 'bg-danger text-danger-foreground hover:bg-danger-strong',
    'danger-outline': 'border border-danger bg-surface text-danger hover:bg-danger-soft hover:text-danger-on-soft',
    link: 'text-accent underline underline-offset-4 hover:no-underline',
};
const DISABLED = 'cursor-not-allowed border border-border-strong bg-surface-raised text-foreground-subtle';
const SIZE = {
    md: 'min-h-target min-w-target px-4 text-body',
    lg: 'min-h-12 min-w-12 px-6 text-subheading',
};
const ICON_SIZE = {
    md: 'size-target',
    lg: 'size-12',
};
function ButtonImpl({ square = false, variant = 'primary', size = 'md', icon, trailingIcon, badge, loading = false, disabled = false, disabledReason, type = 'button', className, children, onClick, ref, 'aria-describedby': describedBy, ...rest }) {
    const reasonId = useId();
    const inert = disabled || loading;
    const showReason = disabled && disabledReason;
    const handleClick = (e) => {
        if (inert) {
            e.preventDefault();
            return;
        }
        onClick?.(e);
    };
    return (_jsxs(_Fragment, { children: [_jsx("button", { ref: ref, type: type, "aria-disabled": disabled || undefined, "aria-busy": loading || undefined, "aria-describedby": cx(describedBy, showReason && reasonId) || undefined, onClick: handleClick, className: cx(BASE, square ? ICON_SIZE[size] : SIZE[size], disabled ? DISABLED : VARIANT[variant], className), ...rest, children: loading && !icon ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "absolute inset-0 flex items-center justify-center", children: _jsx(Spinner, {}) }), _jsxs("span", { className: "inline-flex items-center gap-2 opacity-0", children: [children, badge, trailingIcon] })] })) : (_jsxs(_Fragment, { children: [loading ? _jsx(Spinner, {}) : icon, children, badge, trailingIcon] })) }), showReason && (_jsx("span", { id: reasonId, className: "sr-only", children: disabledReason }))] }));
}
export function Button(props) {
    return _jsx(ButtonImpl, { ...props });
}
export function IconButton({ variant = 'ghost', ...rest }) {
    return _jsx(ButtonImpl, { square: true, variant: variant, ...rest });
}
// A control that navigates is a link, never a button that calls navigate().
export function LinkButton({ variant = 'secondary', size = 'md', icon, trailingIcon, badge, asChild = false, className, children, ...rest }) {
    const Comp = asChild ? Slot : 'a';
    return (_jsx(Comp, { className: cx(BASE, SIZE[size], VARIANT[variant], className), ...rest, children: asChild ? (children) : (_jsxs(_Fragment, { children: [icon, children, badge, trailingIcon] })) }));
}
