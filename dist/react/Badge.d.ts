import type { ReactNode } from 'react';
export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeProps = {
    tone?: BadgeTone;
    /** A tinted ground, for a badge on something already dense. Square corners: a pill says "press me". */
    filled?: boolean;
    className?: string;
    /** The word. Never empty: a dot alone is not a badge. */
    children: ReactNode;
};
export declare function Badge({ tone, filled, className, children }: BadgeProps): import("react").JSX.Element;
