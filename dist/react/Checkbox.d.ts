import { type InputHTMLAttributes, type ReactNode } from 'react';
type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    label: ReactNode;
    hint?: ReactNode;
    error?: ReactNode;
};
export declare function Checkbox({ label, hint, error, id, className, ...rest }: CheckboxProps): import("react").JSX.Element;
export {};
