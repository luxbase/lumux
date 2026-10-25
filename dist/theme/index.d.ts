import { type Scheme, type ThemeName } from '../tokens/themes.ts';
export { SYSTEM_THEME, THEME_META, THEME_NAMES, isThemeName, schemeOf, type Scheme, type ThemeName } from '../tokens/themes.ts';
export type ThemeChoice = ThemeName | 'system';
export declare const THEME_STORAGE_KEY = "lumux-theme";
export declare function readTheme(): ThemeChoice;
export declare function systemScheme(): Scheme;
export declare function resolvedTheme(choice?: ThemeChoice): ThemeName;
export declare function resolvedScheme(choice?: ThemeChoice): Scheme;
export declare function applyTheme({ theme, persist }: {
    theme: ThemeChoice;
    persist?: boolean;
}): void;
export declare function syncThemeColor(choice?: ThemeChoice): void;
