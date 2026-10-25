import { type ReactNode } from 'react';
export type MenuItem = {
    type?: 'item';
    /** Stable React key for lists whose items come and go; the index is used without it. */
    id?: string;
    label: ReactNode;
    icon?: ReactNode;
    onSelect: () => void;
    /** Deleting, discarding: drawn in `danger`. */
    destructive?: boolean;
    /** aria-disabled: stays focusable and readable; selection is swallowed. */
    disabled?: boolean;
    disabledReason?: string;
} | {
    type: 'separator';
} | {
    type: 'label';
    label: ReactNode;
};
export type MenuProps = {
    /** The opener. A Button or IconButton; it gets aria-haspopup and aria-expanded. */
    trigger: ReactNode;
    items: MenuItem[];
    align?: 'start' | 'end';
    /** Names the menu when the trigger's label doesn't (an icon-only ⋮ button). */
    label?: string;
};
export declare function Menu({ trigger, items, align, label }: MenuProps): import("react").JSX.Element;
