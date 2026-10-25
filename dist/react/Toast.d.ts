import { type ReactNode } from 'react';
export type ToastType = 'info' | 'success' | 'warning' | 'error';
export type ToastAction = {
    label: string;
    run: () => void;
};
export type ToastOptions = {
    type?: ToastType;
    action?: ToastAction;
};
export type ToastItem = {
    id: number;
    message: string;
    type: ToastType;
    /** How many times this exact (message, type) arrived while on screen. */
    count: number;
    action?: ToastAction;
    at: Date;
    /**
     * @internal Press order; a merge takes the newer press's number, so the bump is announced.
     * Set by `ToastProvider`; do not construct `ToastItem`s yourself.
     */
    seq: number;
    /** The press whose timer may close it; a merge hands the lease to the newer press. */
    lease?: number;
};
type ToastContextValue = {
    toast: (message: string, options?: ToastOptions) => void;
};
type ToastLogValue = {
    log: ToastItem[];
    clear: () => void;
};
export type ToastLabels = {
    dismiss: string;
    dismissAll: string;
    region: string;
    /** Appended to the announcement of a toast with an action, so the button is discoverable. */
    actionHint?: (actionLabel: string) => string;
};
export declare function ToastProvider({ children, labels }: {
    children: ReactNode;
    labels?: ToastLabels;
}): import("react").JSX.Element;
export declare function useToast(): ToastContextValue;
/** Every toast that was shown, newest first (2.2.3: a toast is never the only record). */
export declare function useToastLog(): ToastLogValue;
/** A reachable list of past notifications, for a settings page or a help panel. */
export declare function ToastLog({ emptyText, typeWords, className }: {
    emptyText?: string;
    typeWords?: Record<ToastType, string>;
    className?: string;
}): import("react").JSX.Element;
export {};
