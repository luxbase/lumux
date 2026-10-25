import { type ReactNode } from 'react';
type SwitchProps = {
    /** Visible, and the switch's accessible name. */
    label: ReactNode;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    hint?: ReactNode;
    /** aria-disabled: stays focusable, toggling is swallowed. */
    disabled?: boolean;
    id?: string;
    className?: string;
};
export declare function Switch({ label, checked, onCheckedChange, hint, disabled, id, className }: SwitchProps): import("react").JSX.Element;
export {};
