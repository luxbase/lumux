// Joins class names. No tailwind-merge: appearance is a prop, and `className`
// only ever adds layout, so there is nothing to de-duplicate.
export function cx(...parts) {
    return parts.filter(Boolean).join(' ');
}
