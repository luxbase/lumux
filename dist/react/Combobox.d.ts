import { type ReactNode } from 'react';
export type ComboboxOption = {
    /** Submitted and returned from `onChange`. Must be unique within the list. */
    value: string;
    /** Used by the built-in filter and when the option is selected. */
    label: string;
    disabled?: boolean;
};
export type ComboboxOptionState = {
    active: boolean;
    selected: boolean;
};
export type ComboboxProps<Option extends ComboboxOption = ComboboxOption> = {
    /** Current result set. Replace it as an async search resolves. */
    options: Option[];
    /** The selected option's value. */
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    /** Called for every edit, so an app can fetch its next result set. */
    onQueryChange?: (query: string) => void;
    /** Shows a non-selectable loading row while async results are pending. */
    loading?: boolean;
    /** Renders an option's contents (for example, avatar, name and company). */
    renderOption?: (option: Option, state: ComboboxOptionState) => ReactNode;
    /** Replaces the built-in case-insensitive label filter. */
    filterOptions?: (options: Option[], query: string) => Option[];
    emptyMessage?: ReactNode;
    /** Text, or a formatter for text, in the optional create row. */
    createLabel?: ReactNode | ((query: string) => ReactNode);
    onCreate?: (query: string) => void;
    placeholder?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    /** Defaults to the Field id, so the Field label focuses this input. */
    id?: string;
    autoComplete?: string;
    /** Accessible name for use outside a Field. */
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    /** Accessible name for the bottom-sheet dialog on touch devices. */
    sheetLabel?: string;
    className?: string;
};
export declare function Combobox<Option extends ComboboxOption = ComboboxOption>(allProps: ComboboxProps<Option>): import("react").JSX.Element;
