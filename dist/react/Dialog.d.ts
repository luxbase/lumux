import * as D from '@radix-ui/react-dialog';
import { type ReactNode } from 'react';
export type DialogSize = 'sm' | 'md' | 'lg' | 'full';
export type DialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** The accessible name. Always visible. */
    title: ReactNode;
    description?: ReactNode;
    size?: DialogSize;
    /** Buttons in DOM order: cancel first, primary last. */
    footer?: ReactNode;
    /**
     * Clicking the scrim closes. Set false while the dialog holds unsaved input;
     * Escape and the close button still work.
     */
    dismissOnOverlay?: boolean;
    closeLabel?: string;
    children: ReactNode;
};
export declare function Dialog({ open, onOpenChange, title, description, size, footer, dismissOnOverlay, closeLabel, children, }: DialogProps): import("react").JSX.Element;
/** Wrap the opener for a declarative open; focus return then needs no capture. */
export declare const DialogTrigger: import("react").ForwardRefExoticComponent<D.DialogTriggerProps & import("react").RefAttributes<HTMLButtonElement>>;
/** Wrap a footer button that closes the dialog (Cancel). */
export declare const DialogClose: import("react").ForwardRefExoticComponent<D.DialogCloseProps & import("react").RefAttributes<HTMLButtonElement>>;
