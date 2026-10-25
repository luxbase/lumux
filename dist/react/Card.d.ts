import type { HTMLAttributes, ReactNode } from 'react';
export type CardRail = 'none' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type CardProps = {
    as?: 'div' | 'li' | 'article' | 'section';
    /** `flat` by default: a bordered card with a shadow is two separations doing one job. `raised` floats (drag preview). */
    elevation?: 'flat' | 'raised';
    /** Status or brand colour on the left edge. The meaning is in the content; the rail is a cue. */
    rail?: CardRail;
    /** Optional header: a `heading`-role title and an action slot on the right. */
    title?: ReactNode;
    /** Heading level of `title`, to fit the page outline. Defaults to 3. */
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    action?: ReactNode;
    footer?: ReactNode;
    /** `none` when the children carry their own padding (a divided list). */
    pad?: 'default' | 'none';
    className?: string;
    children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'title' | 'className' | 'children'>;
export declare function Card({ as: Tag, elevation, rail, title, headingLevel, action, footer, pad, className, children, ...rest }: CardProps): import("react").JSX.Element;
