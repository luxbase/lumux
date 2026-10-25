import { type ThemeChoice, type ThemeName } from '../theme/index.ts';
export type ThemeSwitcherLabels = Partial<Record<ThemeChoice, string>> & {
    group?: string;
};
export declare function ThemeSwitcher({ themes, system, labels, className, }: {
    themes?: readonly ThemeName[];
    /** Offer "follow the OS". Off for an app that pins its themes. */
    system?: boolean;
    labels?: ThemeSwitcherLabels;
    className?: string;
}): import("react").JSX.Element;
