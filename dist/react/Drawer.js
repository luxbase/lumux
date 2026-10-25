'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Sheet } from "./Sheet.js";
// The app's navigation below `lg`, where AppShell drops the sidebar: a modal
// sheet from the left wrapping a <nav>. Always modal, never side="right".
export function Drawer({ open, onOpenChange, title, label, closeLabel, children }) {
    return (_jsx(Sheet, { open: open, onOpenChange: onOpenChange, title: title, side: "left", closeLabel: closeLabel, children: _jsx("nav", { "aria-label": label ?? (typeof title === 'string' ? title : undefined), className: "-m-4 flex flex-col p-2", children: children }) }));
}
