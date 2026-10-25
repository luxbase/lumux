import { type ReactNode } from 'react';
export type ConfirmInlineProps = {
    /** Names the group: "Delete this entry?" */
    question: ReactNode;
    /** The destructive verb: "Delete", "Discard". */
    confirmLabel: string;
    keepLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    className?: string;
};
export declare function ConfirmInline({ question, confirmLabel, keepLabel, onConfirm, onCancel, className }: ConfirmInlineProps): import("react").JSX.Element;
