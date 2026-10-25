import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

// The label must point at the control in server HTML, before any effect runs.
// Imported at run time: dist/ does not exist when `tsc --noEmit` runs on a fresh checkout.
const built = '../dist/react/Field.js';
const builtSelect = '../dist/react/Select.js';
const builtCombobox = '../dist/react/Combobox.js';

test('Field label targets the control in server-rendered HTML', async () => {
  const { Field, Input } = await import(built);
  const own = renderToString(h(Field, { label: 'Phone', hint: 'Mobile', children: h(Input, { id: 'phone' }) }));
  assert.match(own, /<label for="phone"/);
  assert.match(own, /<input id="phone" aria-describedby="[^"]+-hint"/);
  const field = renderToString(h(Field, { label: 'Email', id: 'email', children: h(Input, {}) }));
  assert.match(field, /<label for="email"/);
  assert.match(field, /<input id="email"/);
});

test('Combobox renders a labelled editable combobox in server HTML', async () => {
  const { Field } = await import(built);
  const { Combobox } = await import(builtCombobox);
  const html = renderToString(
    h(Field, { label: 'Company', id: 'company', children: h(Combobox, { options: [{ value: 'a', label: 'Acme' }] }) }),
  );
  assert.match(html, /<label for="company"/);
  assert.match(html, /<input[^>]*role="combobox"/);
  assert.match(html, /<input[^>]*id="company"/);
});

test('Select renders a labelled combobox trigger and NativeSelect stays a <select>', async () => {
  const { Field, NativeSelect } = await import(built);
  const { Select } = await import(builtSelect);
  const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];
  const html = renderToString(
    h(Field, { label: 'Letter', id: 'letter', hint: 'Pick one', error: 'Required', children: h(Select, { options, defaultValue: 'a', name: 'letter' }) }),
  );
  assert.match(html, /<label for="letter"/);
  assert.match(html, /<button[^>]* role="combobox"/);
  assert.match(html, /<button[^>]* id="letter"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="[^"]*letter-error[^"]*"/);
  assert.match(html, /Alpha/);
  // Controlled: the trigger carries the label of `value`, not of a stale default.
  const controlled = renderToString(h(Select, { options, value: 'b', defaultValue: 'a', onValueChange: () => {} }));
  assert.match(controlled, /Beta/);
  assert.doesNotMatch(controlled, /Alpha/);
  const native = renderToString(h(NativeSelect, { children: h('option', null, 'M') }));
  assert.match(native, /<select/);
});
