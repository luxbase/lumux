export type SelectOption = {
    /** Non-empty: Radix reserves the empty string for "no selection". */
    value: string;
    label: string;
    disabled?: boolean;
};
export type SelectProps = {
    options: SelectOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** Shown while nothing is selected. */
    placeholder?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    /** Defaults to the Field's id, so the label focuses the trigger. */
    id?: string;
    autoComplete?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    className?: string;
};
export declare function Select({ options, value, defaultValue, onValueChange, placeholder, name, disabled, required, autoComplete, className, ...rest }: SelectProps): import("react").JSX.Element;
