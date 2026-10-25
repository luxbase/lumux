'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { LucideProvider } from 'lucide-react';
// Icon defaults: 16px, stroke 1.75. Sizes are 14 (dense rows), 16
// (inline, default), 20 (chrome) and 32 (empty-state glyph), set with size-*
// classes; never a per-icon `size` or `strokeWidth`.
export function IconProvider({ children }) {
    return (_jsx(LucideProvider, { size: 16, strokeWidth: 1.75, children: children }));
}
