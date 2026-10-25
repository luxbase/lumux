import type { ReactNode } from 'react';
export type EmptyStateProps = {
    icon?: ReactNode;
    /** ≤5 words. */
    title: string;
    /** One line, ≤90 characters: what would fill this and how, never "nothing here yet". */
    description?: ReactNode;
    /** At most one. */
    action?: ReactNode;
    tone?: 'empty' | 'error';
    className?: string;
};
export declare function EmptyState({ icon, title, description, action, tone, className }: EmptyStateProps): import("react").JSX.Element;
