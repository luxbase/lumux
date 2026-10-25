import { type ReactNode } from 'react';
import { type Scheme, type ThemeChoice, type ThemeName } from '../theme/index.ts';
type ThemeContextValue = {
    theme: ThemeChoice;
    /** The theme on screen: the choice, or the default pair when the choice is `system`. */
    resolved: ThemeName;
    /** `light` or `dark`, for anything that is not a token (chart libraries, map tiles). */
    scheme: Scheme;
    setTheme: (theme: ThemeChoice) => void;
};
/**
 * A pre-lumux theme key to migrate once. If the old names are already lumux names,
 * no map is needed: `{ key: 'app-theme' }`. A `map` translates other
 * vocabularies, e.g. `{ light: 'day', dark: 'night' }`.
 */
export type LegacyTheme = {
    key: string;
    map?: Record<string, ThemeName>;
};
export declare function ThemeProvider({ children, legacy }: {
    children: ReactNode;
    legacy?: LegacyTheme;
}): import("react").JSX.Element;
export declare function useTheme(): ThemeContextValue;
export {};
