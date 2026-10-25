import type { ReactNode } from 'react';
export type DrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Names the drawer and its `<nav>`: "Menu", "Navigation". */
    title: ReactNode;
    /** The nav landmark's accessible name when `title` is not a string. */
    label?: string;
    closeLabel?: string;
    children: ReactNode;
};
export declare function Drawer({ open, onOpenChange, title, label, closeLabel, children }: DrawerProps): import("react").JSX.Element;
