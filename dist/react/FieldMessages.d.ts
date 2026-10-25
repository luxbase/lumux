import type { ReactNode } from 'react';
export declare const hintId: (id: string) => string;
export declare const errorId: (id: string) => string;
/** aria-describedby for a control: the error while there is one, then the hint. */
export declare function describedBy(id: string, { hint, error }: {
    hint?: ReactNode;
    error?: ReactNode;
}, extra?: string): string | undefined;
export declare function FieldMessages({ id, hint, error }: {
    id: string;
    hint?: ReactNode;
    error?: ReactNode;
}): import("react").JSX.Element;
/** The required marker is a word in the label, not an asterisk alone. */
export declare function RequiredMark({ label }: {
    label?: string;
}): import("react").JSX.Element;
