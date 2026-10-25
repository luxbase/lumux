import { type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
type FieldProps = {
    /** A noun phrase, ≤3 words, no trailing colon (docs/copy.md). */
    label: ReactNode;
    /** A fact the label and layout don't state; ≤90 chars. */
    hint?: ReactNode;
    /** What is wrong and what fixes it. Present = the control is invalid. */
    error?: ReactNode;
    required?: boolean;
    /** The word shown for `required`, for translated UIs. */
    requiredLabel?: string;
    /** Defaults to a generated id. */
    id?: string;
    children: ReactNode;
    className?: string;
};
export declare function Field({ label, hint, error, required, requiredLabel, id, children, className }: FieldProps): import("react").JSX.Element;
export declare function useFieldProps(own: {
    id?: string;
    'aria-describedby'?: string;
    required?: boolean;
}): {
    invalid: boolean;
    props: {
        id?: undefined;
        'aria-describedby'?: undefined;
        'aria-invalid'?: undefined;
        required?: undefined;
    };
} | {
    invalid: boolean;
    props: {
        id: string;
        'aria-describedby': string | undefined;
        'aria-invalid': true | undefined;
        required: boolean | undefined;
    };
};
export declare const CONTROL: string;
export declare const EDGE: (invalid: boolean) => "border-danger" | "border-border-strong";
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    /** Decorative leading icon (search, mail). */
    icon?: ReactNode;
};
/** Pass `autoComplete` whenever the field has a known purpose (1.3.5). */
export declare function Input({ icon, className, ...rest }: InputProps): import("react").JSX.Element;
export declare function Textarea({ className, rows, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>): import("react").JSX.Element;
/** Native <select>: the platform picker on phones, full keyboard and screen-reader support for free. */
export declare function NativeSelect({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>): import("react").JSX.Element;
export {};
