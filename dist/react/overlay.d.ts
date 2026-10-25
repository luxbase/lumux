import { type ReactNode } from 'react';
/**
 * Focus return for imperative opens.
 * Radix returns focus to a `Trigger`; most lumux dialogs open from a row click
 * or a menu action, with no trigger near them. The opener is captured on the
 * closed→open transition, during render, which is the one moment that still
 * sees whatever had focus before the panel existed (an `autoFocus` child wins
 * the race against `onOpenAutoFocus`).
 */
export declare function useFocusReturn(open: boolean): (event: Event) => void;
export declare function useMediaQuery(query: string): boolean;
export declare const PANEL = "flex flex-col bg-surface text-foreground shadow-overlay outline-none";
export declare function OverlayHeader({ title, description, closeLabel, onClose, Title, Description, }: {
    title: ReactNode;
    description?: ReactNode;
    closeLabel: string;
    onClose: () => void;
    Title: React.ComponentType<{
        asChild?: boolean;
        children: ReactNode;
    }>;
    Description: React.ComponentType<{
        className?: string;
        children: ReactNode;
    }>;
}): import("react").JSX.Element;
export declare function OverlayFooter({ children, className }: {
    children: ReactNode;
    className?: string;
}): import("react").JSX.Element;
export declare function OverlayBody({ children, className }: {
    children: ReactNode;
    className?: string;
}): import("react").JSX.Element;
