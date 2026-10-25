import * as D from '@radix-ui/react-dialog';
import { type ReactNode } from 'react';
export type SheetSide = 'right' | 'left';
export type SheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: ReactNode;
    description?: ReactNode;
    side?: SheetSide;
    /**
     * Modal: focus trapped, page inert, scroll locked. `false` keeps the page
     * operable beside the sheet (e.g. a live console) and only applies from
     * `lg` up; below that a sheet is always modal.
     */
    modal?: boolean;
    footer?: ReactNode;
    closeLabel?: string;
    children: ReactNode;
};
export declare function Sheet({ open, onOpenChange, title, description, side, modal, footer, closeLabel, children, }: SheetProps): import("react").JSX.Element;
export declare const SheetTrigger: import("react").ForwardRefExoticComponent<D.DialogTriggerProps & import("react").RefAttributes<HTMLButtonElement>>;
export declare const SheetClose: import("react").ForwardRefExoticComponent<D.DialogCloseProps & import("react").RefAttributes<HTMLButtonElement>>;
