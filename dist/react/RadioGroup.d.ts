import { type ReactNode } from 'react';
export type RadioOption = {
    value: string;
    label: ReactNode;
    disabled?: boolean;
};
type RadioGroupProps = {
    legend: ReactNode;
    name: string;
    options: RadioOption[];
    value: string | undefined;
    onValueChange: (value: string) => void;
    hint?: ReactNode;
    error?: ReactNode;
    required?: boolean;
    requiredLabel?: string;
    className?: string;
};
export declare function RadioGroup({ legend, name, options, value, onValueChange, hint, error, required, requiredLabel, className, }: RadioGroupProps): import("react").JSX.Element;
export {};
