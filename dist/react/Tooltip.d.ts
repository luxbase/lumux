import { type ReactNode } from 'react';
/** Mount once at the root, beside IconProvider. */
export declare function TooltipProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export type TooltipProps = {
    /** Short, supplementary. The child keeps its own accessible name. */
    content: ReactNode;
    /** One element that can take focus: a Button, an IconButton, a link. */
    children: ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
};
export declare function Tooltip({ content, children, side }: TooltipProps): import("react").JSX.Element;
