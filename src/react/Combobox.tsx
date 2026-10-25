'use client';

import * as D from '@radix-ui/react-dialog';
import { ChevronDown, LoaderCircle } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { CONTROL, EDGE, useFieldProps } from './Field.tsx';
import { useMediaQuery } from './overlay.tsx';
import { cx } from './cx.ts';

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

const optionClass = (active: boolean, selected: boolean, disabled?: boolean) =>
  cx(
    'flex min-h-target w-full cursor-default items-center px-3 text-left text-body text-foreground transition-colors duration-fast ease-lumux motion-reduce:transition-none',
    active && 'bg-surface-raised forced-colors:outline forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-Highlight',
    selected && 'forced-selected',
    disabled && 'cursor-not-allowed text-foreground-subtle',
  );

// scroll-ok: a long result set is capped by its popup or bottom sheet; the query input remains reachable above it.
const LIST = 'min-h-0 overflow-y-auto rounded-control border border-border-strong bg-surface p-1 text-foreground shadow-overlay';

const defaultFilter = <Option extends ComboboxOption>(options: Option[], query: string) => {
  const needle = query.trim().toLocaleLowerCase();
  return needle ? options.filter((option) => option.label.toLocaleLowerCase().includes(needle)) : options;
};

// An editable combobox, rather than a searchable Select: screen readers stay on
// the input and aria-activedescendant identifies the option under the virtual
// cursor. The same input is moved into a modal bottom sheet on coarse pointers.
export function Combobox<Option extends ComboboxOption = ComboboxOption>(allProps: ComboboxProps<Option>) {
  const {
    options,
    value,
    defaultValue,
    onChange,
    onQueryChange,
    loading = false,
    renderOption,
    filterOptions = defaultFilter,
    emptyMessage = 'No results.',
    createLabel,
    onCreate,
    placeholder,
    name,
    disabled,
    required,
    sheetLabel = 'Options',
    className,
    ...rest
  } = allProps;
  const { invalid, props } = useFieldProps({ ...rest, required });
  // Presence, not definedness: a controlled value cleared to undefined must not fall back to a stale inner one.
  const controlled = 'value' in allProps;
  const [innerValue, setInnerValue] = useState(defaultValue);
  const selectedValue = controlled ? value : innerValue;
  const initialLabel = options.find((option) => option.value === selectedValue)?.label ?? '';
  const [query, setQuery] = useState(initialLabel);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const lastSynced = useRef<string | undefined>(selectedValue);
  // What the input shows again when it closes without a choice, so its text always matches the submitted value.
  const committedLabel = useRef(initialLabel);
  const mobileHadOpen = useRef(false);
  const restoringFocus = useRef(false);
  const id = useId();
  const listId = `${id}-listbox`;
  const coarse = useMediaQuery('(pointer: coarse)');
  const filtered = useMemo(() => filterOptions(options, query), [filterOptions, options, query]);
  const trimmed = query.trim();
  const canCreate =
    !!onCreate &&
    !!createLabel &&
    trimmed.length > 0 &&
    !options.some((option) => option.label.toLocaleLowerCase() === trimmed.toLocaleLowerCase());
  const indexes = filtered.flatMap((option, index) => (option.disabled ? [] : [index])).concat(canCreate ? [filtered.length] : []);
  // Async results can be replaced under the cursor; a position that no longer exists is no position.
  const current = indexes.includes(active) ? active : -1;

  // An externally selected value replaces the search phrase with its label once available.
  useEffect(() => {
    if (selectedValue === undefined) {
      if (lastSynced.current !== undefined) {
        lastSynced.current = undefined;
        committedLabel.current = '';
        setQuery('');
      }
      return;
    }
    const label = options.find((option) => option.value === selectedValue)?.label;
    if (label !== undefined && lastSynced.current !== selectedValue) {
      lastSynced.current = selectedValue;
      committedLabel.current = label;
      setQuery(label);
    }
  }, [options, selectedValue]);

  useEffect(() => {
    if (current < 0 || !open) return;
    const el = document.getElementById(`${listId}-option-${current}`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [current, listId, open]);

  useEffect(() => {
    if (!open || coarse) return;
    const closeIfOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) dismiss();
    };
    document.addEventListener('pointerdown', closeIfOutside);
    return () => document.removeEventListener('pointerdown', closeIfOutside);
  }, [coarse, open]);

  useEffect(() => {
    if (!coarse) return;
    if (open) {
      mobileHadOpen.current = true;
      input.current?.focus();
    } else if (mobileHadOpen.current) {
      // Once the sheet unmounts, return to its same labelled field.
      mobileHadOpen.current = false;
      restoringFocus.current = true;
      input.current?.focus();
    }
  }, [coarse, open]);

  const setSearch = (next: string) => {
    setQuery(next);
    // A new search has no virtual cursor yet: the first ArrowDown lands on its
    // first result, matching an editable native combobox.
    setActive(-1);
    setOpen(true);
    onQueryChange?.(next);
  };

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const dismiss = () => {
    setQuery(committedLabel.current);
    close();
  };

  const select = (option: ComboboxOption) => {
    if (option.disabled) return;
    lastSynced.current = option.value;
    committedLabel.current = option.label;
    if (!controlled) setInnerValue(option.value);
    setQuery(option.label);
    onChange?.(option.value);
    close();
  };

  const create = () => {
    const next = query.trim();
    if (!next || !onCreate) return;
    committedLabel.current = next;
    setQuery(next);
    onCreate(next);
    close();
  };

  const move = (direction: 1 | -1) => {
    if (!indexes.length) return;
    const position = indexes.indexOf(current);
    // From no position, ArrowUp lands on the last row, not the one before it.
    const next = position < 0 ? (direction === 1 ? 0 : indexes.length - 1) : (position + direction + indexes.length) % indexes.length;
    setActive(indexes[next]);
  };
  const first = () => setActive(indexes[0] ?? -1);
  const last = () => setActive(indexes.at(-1) ?? -1);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) setOpen(true);
      move(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) setOpen(true);
      move(-1);
    } else if (event.key === 'Home' && open) {
      event.preventDefault();
      first();
    } else if (event.key === 'End' && open) {
      event.preventDefault();
      last();
    } else if (event.key === 'Enter' && open) {
      event.preventDefault();
      if (current === filtered.length) create();
      else if (current >= 0) select(filtered[current]);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      dismiss();
    } else if (event.key === 'Tab' && open) {
      // Tab leaves an editable combobox; it must never make an accidental choice.
      dismiss();
    }
  };

  const inputProps = {
    ...rest,
    ...props,
    ref: input,
    role: 'combobox' as const,
    type: 'text',
    value: query,
    placeholder,
    disabled,
    autoComplete: rest.autoComplete ?? 'off',
    'aria-autocomplete': 'list' as const,
    'aria-expanded': open,
    'aria-controls': listId,
    'aria-activedescendant': open && current >= 0 ? `${listId}-option-${current}` : undefined,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value),
    onFocus: () => {
      if (restoringFocus.current) {
        restoringFocus.current = false;
        return;
      }
      if (!disabled) setOpen(true);
    },
    onClick: () => {
      if (!disabled && !open) setOpen(true);
    },
    onKeyDown,
    className: cx(CONTROL, EDGE(invalid), 'min-h-target pr-10 pl-3', className),
  };

  // A listbox may only own options, so the loading and empty rows sit beside it in the same panel.
  const list = (
    <div className={LIST}>
      {loading && (
        <div role="status" className="flex min-h-target items-center gap-2 px-3 text-body text-foreground-muted">
          <LoaderCircle aria-hidden="true" className="animate-lumux-spin" /> Loading…
        </div>
      )}
      {!loading && filtered.length === 0 && !canCreate && <div className="flex min-h-target items-center px-3 text-body text-foreground-muted">{emptyMessage}</div>}
      <div id={listId} role="listbox" aria-busy={loading || undefined}>
        {filtered.map((option, index) => {
          const selected = option.value === selectedValue;
          return (
            <div
              id={`${listId}-option-${index}`}
              key={option.value}
              role="option"
              aria-selected={selected}
              aria-disabled={option.disabled || undefined}
              tabIndex={-1}
              className={optionClass(current === index, selected, option.disabled)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(option)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  select(option);
                }
              }}
            >
              {renderOption ? renderOption(option, { active: current === index, selected }) : option.label}
            </div>
          );
        })}
        {canCreate && (
          <div
            id={`${listId}-option-${filtered.length}`}
            role="option"
            aria-selected={false}
            tabIndex={-1}
            className={optionClass(current === filtered.length, false)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={create}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                create();
              }
            }}
          >
            {typeof createLabel === 'function' ? createLabel(trimmed) : createLabel}
          </div>
        )}
      </div>
    </div>
  );

  const field = (
    <div className="relative">
      <input {...inputProps} />
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-foreground-muted" />
    </div>
  );

  if (coarse) {
    return (
      <>
        {!open && field}
        {name && <input type="hidden" name={name} value={selectedValue ?? ''} />}
        <D.Root open={open} onOpenChange={(next) => (next ? setOpen(true) : dismiss())}>
          <D.Portal>
            <D.Overlay className="fixed inset-0 z-modal bg-overlay-scrim">
              <D.Content
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="fixed inset-x-0 bottom-0 z-modal flex max-h-combobox-sheet flex-col rounded-t-card bg-surface text-foreground shadow-overlay safe-bottom"
              >
                <D.Title className="sr-only">{sheetLabel}</D.Title>
                <div className="shrink-0 border-b border-border p-4">{field}</div>
                {/* scroll-ok: the combobox result list is the sheet's one scrolling region; its input stays pinned above it. */}
                <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-2">{list}</div>
              </D.Content>
            </D.Overlay>
          </D.Portal>
        </D.Root>
      </>
    );
  }

  return (
    <div ref={root} className="relative">
      {field}
      {name && <input type="hidden" name={name} value={selectedValue ?? ''} />}
      {open && <div className="absolute z-overlay mt-1 max-h-80 w-full">{list}</div>}
    </div>
  );
}
