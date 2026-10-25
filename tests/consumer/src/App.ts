// Every component lumux/react exports, through the public export paths only.
// No JSX, so ssr.ts runs under plain Node (type stripping) with no build step.
import { createElement as h, type ReactNode } from 'react';
import {
  AppShell, Badge, Button, Card, Checkbox, Combobox, ConfirmInline, Dialog, DialogClose, DialogTrigger, Drawer,
  EmptyState, Field, IconButton, IconProvider, Input, LinkButton, Menu, Popover, RadioGroup,
  NativeSelect, SegmentedControl, Select, Sheet, SheetClose, SheetTrigger, SkipLink, Spinner, Switch, Textarea,
  ThemeProvider, ThemeSwitcher, ToastLog, ToastProvider, Tooltip, TooltipProvider,
  useDocumentTitle, useTheme, useToast, useToastLog,
} from 'lumux/react';
import { THEME_NAMES, type ThemeName } from 'lumux/theme';

// ssr.ts fails when lumux/react exports a component this list misses; tsconfig's
// noUnusedLocals fails when one is imported here but never rendered.
export const RENDERED = [
  'AppShell', 'Badge', 'Button', 'Card', 'Checkbox', 'Combobox', 'ConfirmInline', 'Dialog', 'DialogClose', 'DialogTrigger',
  'Drawer', 'EmptyState', 'Field', 'IconButton', 'IconProvider', 'Input', 'LinkButton', 'Menu', 'Popover',
  'NativeSelect', 'RadioGroup', 'SegmentedControl', 'Select', 'Sheet', 'SheetClose', 'SheetTrigger', 'SkipLink', 'Spinner',
  'Switch', 'Textarea', 'ThemeProvider', 'ThemeSwitcher', 'ToastLog', 'ToastProvider', 'Tooltip', 'TooltipProvider',
];

const noop = () => {};
const first: ThemeName = THEME_NAMES[0];

function Hooks(): ReactNode {
  useDocumentTitle('Smoke', 'lumux');
  const { resolved } = useTheme();
  useToast();
  useToastLog();
  return h('p', null, resolved || first);
}

function Page(): ReactNode {
  return h('div', null,
    h(Hooks),
    h(SkipLink, null, 'Skip'),
    h(Button, { variant: 'primary', children: 'Save' }),
    // @ts-expect-error: `variant` is a union. Unused if the types collapsed to `any`.
    h(Button, { variant: 'nope', children: 'Typed' }),
    h(IconButton, { icon: h(Spinner), 'aria-label': 'Busy' }),
    h(LinkButton, { href: '#', children: 'Go' }),
    h(Spinner),
    h(ThemeSwitcher),
    h(Field, { label: 'Email', hint: 'Work address', children: h(Input, { autoComplete: 'email' }) }),
    h(Field, { label: 'Notes', children: h(Textarea) }),
    h(Field, { label: 'Size', children: h(NativeSelect, null, h('option', null, 'M')) }),
    h(Field, { label: 'Fit', children: h(Select, { options: [{ value: 'm', label: 'M' }], defaultValue: 'm' }) }),
    h(Field, { label: 'Company', children: h(Combobox, { options: [{ value: 'a', label: 'Acme' }] }) }),
    h(Checkbox, { label: 'Agree' }),
    h(Switch, { label: 'Alerts', checked: false, onCheckedChange: noop }),
    h(RadioGroup, { legend: 'Plan', name: 'plan', options: [{ value: 'a', label: 'A' }], value: 'a', onValueChange: noop }),
    h(SegmentedControl, { label: 'View', name: 'view', segments: [{ value: 'list', label: 'List' }], value: 'list', onValueChange: noop }),
    h(Tooltip, { content: 'Saves', children: h(Button, null, 'Hover') }),
    h(Menu, { trigger: h(Button, null, 'More'), items: [{ label: 'Edit', onSelect: noop }] }),
    h(Popover, { trigger: h(Button, null, 'Info'), title: 'Info', open: true, children: 'Body' }),
    h(Card, { title: 'Card', footer: h(Badge, { tone: 'success', children: 'Live' }), children: 'Content' }),
    h(EmptyState, { title: 'No entries', description: 'Add one to start.' }),
    h(ConfirmInline, { question: 'Delete?', confirmLabel: 'Delete', onConfirm: noop, onCancel: noop }),
    h(ToastLog),
    h(Dialog, { open: true, onOpenChange: noop, title: 'Dialog', size: 'md', footer: h(DialogClose, null, 'Cancel'), children: 'Body' }),
    h(Dialog, { open: false, onOpenChange: noop, title: 'Declarative', children: h(DialogTrigger, null, 'Open') }),
    h(Sheet, { open: true, onOpenChange: noop, title: 'Sheet', footer: h(SheetClose, null, 'Close'), children: 'Body' }),
    h(Sheet, { open: false, onOpenChange: noop, title: 'Declarative', children: h(SheetTrigger, null, 'Open') }),
    h(Drawer, { open: true, onOpenChange: noop, title: 'Menu', children: 'Links' }),
  );
}

export function App(): ReactNode {
  const shell = h(AppShell, { header: 'lumux', sidebar: h('nav', { 'aria-label': 'Main' }), children: h(Page) });
  const toasts = h(ToastProvider, { children: shell });
  return h(ThemeProvider, { children: h(IconProvider, { children: h(TooltipProvider, { children: toasts }) }) });
}
