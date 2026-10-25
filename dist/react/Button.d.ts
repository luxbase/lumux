import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-outline' | 'link';
export type ButtonSize = 'md' | 'lg';
type CommonProps = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Leading by default. */
    icon?: ReactNode;
    /** Chevrons and external-link only. */
    trailingIcon?: ReactNode;
    /** A trailing slot (e.g. a cost badge): a slot after the label, not a variant. */
    badge?: ReactNode;
};
type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> & {
    /** React 19 ref prop: for a mount-time focus (ConfirmInline's Keep). */
    ref?: Ref<HTMLButtonElement>;
    /** Spinner replaces the leading icon, the label stays, the width does not change. */
    loading?: boolean;
    /**
     * Renders aria-disabled, not the native attribute, so the button stays
     * focusable and its reason reachable. Clicks are swallowed.
     */
    disabled?: boolean;
    /** Why it is disabled, announced through aria-describedby. Never a `title`. */
    disabledReason?: string;
};
export declare function Button(props: ButtonProps): import("react").JSX.Element;
type IconButtonProps = Omit<ButtonProps, 'icon' | 'trailingIcon' | 'badge' | 'children'> & {
    icon: ReactNode;
    /** Icon-only controls have no visible name, so this is required. */
    'aria-label': string;
};
export declare function IconButton({ variant, ...rest }: IconButtonProps): import("react").JSX.Element;
type LinkButtonProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & {
    /** Render the child (a router Link) with the button's look. */
    asChild?: boolean;
};
export declare function LinkButton({ variant, size, icon, trailingIcon, badge, asChild, className, children, ...rest }: LinkButtonProps): import("react").JSX.Element;
export {};
