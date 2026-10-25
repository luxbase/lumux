export type Scheme = 'light' | 'dark';
export declare const THEME_META: {
    readonly day: {
        readonly scheme: "light";
        readonly family: "core";
    };
    readonly night: {
        readonly scheme: "dark";
        readonly family: "core";
    };
    readonly dawn: {
        readonly scheme: "light";
        readonly family: "extended";
    };
    readonly midnight: {
        readonly scheme: "dark";
        readonly family: "extended";
    };
    readonly forest: {
        readonly scheme: "light";
        readonly family: "extended";
    };
    readonly ocean: {
        readonly scheme: "dark";
        readonly family: "extended";
    };
};
export type ThemeName = keyof typeof THEME_META;
export declare const THEME_NAMES: ThemeName[];
export declare const SYSTEM_THEME: Record<Scheme, ThemeName>;
export declare function isThemeName(v: unknown): v is ThemeName;
export declare function schemeOf(theme: ThemeName): Scheme;
