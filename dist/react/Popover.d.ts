import { type ReactNode } from 'react';
export type PopoverProps = {
    /** The opener: a Button or IconButton. It gets aria-haspopup and aria-expanded. */
    trigger: ReactNode;
    /** Visible heading; also the popover's accessible name. */
    title: ReactNode;
    children: ReactNode;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    closeLabel?: string;
};
export declare function Popover({ trigger, title, children, align, side, open, onOpenChange, closeLabel }: PopoverProps): import("react").JSX.Element;
