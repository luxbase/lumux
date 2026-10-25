import { jsx as _jsx } from "react/jsx-runtime";
import { LoaderCircle } from 'lucide-react';
import { cx } from "./cx.js";
// Decorative: whatever is loading says so in text or with aria-busy. Under
// reduced motion it stands still (--lumux-spin: none).
export function Spinner({ className }) {
    return _jsx(LoaderCircle, { "aria-hidden": "true", className: cx('size-4 shrink-0 animate-lumux-spin', className) });
}
