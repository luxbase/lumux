import type { ReactNode } from 'react';
export type Segment<T extends string> = {
    value: T;
    label: ReactNode;
    icon?: ReactNode;
};
type SegmentedControlProps<T extends string> = {
    /** Names the group for screen readers; pair it with a visible heading where one exists. */
    label: string;
    name: string;
    segments: Segment<T>[];
    value: T;
    onValueChange: (value: T) => void;
    className?: string;
};
export declare function SegmentedControl<T extends string>({ label, name, segments, value, onValueChange, className, }: SegmentedControlProps<T>): import("react").JSX.Element;
export {};
