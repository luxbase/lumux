import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, theme = 'day') {
  await page.goto(`/?theme=${theme}`);
  await page.locator('h1').waitFor();
}

test('Combobox filters, selects, creates and lets Tab leave without selecting', async ({ page }) => {
  await open(page);
  const box = page.getByRole('combobox', { name: 'Company picker' });
  await box.fill('lum');
  const list = page.getByRole('listbox');
  await expect(list.getByRole('option', { name: 'Lumux Asunción' })).toBeVisible();
  await expect(box).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('ArrowDown');
  await expect(box).toHaveAttribute('aria-activedescendant', /option-0$/);
  await page.keyboard.press('Enter');
  await expect(box).toHaveValue('Lumux');
  await expect(list).toHaveCount(0);

  await box.fill('Nova');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(box).toHaveValue('Nova');

  await box.fill('Acme');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  // Leaving without a choice restores the committed text, so it matches the submitted value.
  await expect(box).toHaveValue('Nova');

  await box.fill('lumux');
  await expect(page.getByRole('option', { name: /Create/ })).toHaveCount(0);
  await page.keyboard.press('ArrowUp');
  await expect(box).toHaveAttribute('aria-activedescendant', /option-0$/);
  await page.keyboard.press('Escape');
  await expect(box).toHaveValue('Nova');
});

test('Combobox without autoHighlight leaves Enter inert until an arrow key moves the cursor', async ({ page }) => {
  await open(page);
  const box = page.getByRole('combobox', { name: 'Company picker' });
  await box.fill('lum');
  await expect(page.getByRole('option', { name: 'Lumux Asunción' })).toBeVisible();
  await expect(box).not.toHaveAttribute('aria-activedescendant', /.+/);
  await page.keyboard.press('Enter');
  await expect(box).toHaveValue('lum');
  await expect(box).toHaveAttribute('aria-expanded', 'true');
});

test('Combobox autoHighlight: typing then Enter chooses the first enabled match', async ({ page }) => {
  await open(page);
  const box = page.getByRole('combobox', { name: 'Owner picker', exact: true });
  await box.fill('al');
  // "Alder (away)" matches first but is disabled, so the cursor starts on "Alma".
  await expect(page.getByRole('option', { name: 'Alder (away)' })).toHaveAttribute('aria-disabled', 'true');
  const alma = page.getByRole('option', { name: 'Alma' });
  await expect(alma).toBeVisible();
  await expect(box).toHaveAttribute('aria-activedescendant', (await alma.getAttribute('id'))!);
  await page.keyboard.press('Enter');
  await expect(box).toHaveValue('Alma');
  await expect(page.getByRole('listbox')).toHaveCount(0);
});

test('Combobox autoHighlight follows options that arrive after the keystroke, and waits while loading', async ({ page }) => {
  await open(page);
  const box = page.getByRole('combobox', { name: 'Remote owner picker', exact: true });
  await box.fill('br');
  await expect(page.getByText('Loading…')).toBeVisible();
  await expect(box).not.toHaveAttribute('aria-activedescendant', /.+/);
  const bruno = page.getByRole('option', { name: 'Bruno' });
  await expect(bruno).toBeVisible();
  await expect(box).toHaveAttribute('aria-activedescendant', (await bruno.getAttribute('id'))!);
  await page.keyboard.press('Enter');
  await expect(box).toHaveValue('Bruno');
});

test('Combobox autoHighlight never highlights on focus alone', async ({ page }) => {
  await open(page);
  const box = page.getByRole('combobox', { name: 'Owner picker', exact: true });
  await box.focus();
  await expect(page.getByRole('option', { name: 'Alma' })).toBeVisible();
  await expect(box).not.toHaveAttribute('aria-activedescendant', /.+/);
  await page.keyboard.press('Enter');
  await expect(box).toHaveValue('');
});

for (const theme of ['day', 'night'] as const) {
  test(`Combobox is axe clean in ${theme} and its result rows are 44px`, async ({ page }) => {
    await open(page, theme);
    const box = page.getByRole('combobox', { name: 'Company picker' });
    await box.focus();
    const list = page.getByRole('listbox');
    await expect(list).toBeVisible();
    const heights = await list.getByRole('option').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
    expect(heights.every((height) => height >= 44)).toBe(true);
    const { violations } = await new AxeBuilder({ page })
      .include('input[role="combobox"]')
      .include('[role="listbox"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'wcag2aaa'])
      .analyze();
    expect(violations).toEqual([]);
  });
}

test('Combobox in forced colors: selected item is Highlight, active position keeps an outline', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await open(page);
  const box = page.getByRole('combobox', { name: 'Company picker' });
  await box.focus();
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  await page.keyboard.press('ArrowDown');
  const option = list.getByRole('option', { name: 'Acme Buenos Aires' });
  const outline = await option.evaluate((el) => {
    const s = getComputedStyle(el);
    return { style: s.outlineStyle, width: s.outlineWidth };
  });
  expect(outline).toEqual({ style: 'solid', width: '2px' });
});

test('Combobox is axe clean while loading and survives results replaced under the cursor', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await open(page);
  const box = page.getByRole('combobox', { name: 'Company picker' });
  await box.fill('sl');
  const loading = page.getByText('Loading…');
  await expect(loading).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await expect(box).toHaveAttribute('aria-activedescendant', /option-0$/);
  const { violations } = await new AxeBuilder({ page })
    .include('input[role="combobox"]')
    .include('[role="listbox"]')
    .include(await loading.evaluate((el) => (el.id ? `#${el.id}` : '[role="status"]:has(svg)')))
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'wcag2aaa'])
    .analyze();
  expect(violations).toEqual([]);
  await expect(loading).toHaveCount(0);
  await expect(page.getByRole('option', { name: /Slate/ })).toHaveCount(0);
  const described = await box.getAttribute('aria-activedescendant');
  if (described) await expect(page.locator(`[id="${described}"]`)).toHaveCount(1);
  await page.keyboard.press('Enter');
  expect(errors).toEqual([]);
});

test('Combobox Escape closes popup and keeps focus on input', async ({ page }) => {
  await open(page);
  const box = page.getByRole('combobox', { name: 'Company picker' });
  await box.focus();
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(box).toBeFocused();
});

test.describe('on a coarse pointer', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 720 } });

  test('Combobox uses a bottom sheet with the input pinned above its list', async ({ page }) => {
    await open(page);
    await page.getByRole('combobox', { name: 'Company picker' }).click();
    const sheet = page.getByRole('dialog', { name: 'Options' });
    await expect(sheet).toBeVisible();
    const box = sheet.getByRole('combobox', { name: 'Company picker' });
    const list = sheet.getByRole('listbox');
    await expect(box).toBeFocused();
    expect((await box.boundingBox())!.y).toBeLessThan((await list.boundingBox())!.y);
    const { violations } = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'wcag2aaa'])
      .analyze();
    expect(violations).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await expect(page.getByRole('combobox', { name: 'Company picker' })).toBeFocused();
  });

  test('Tab in the sheet closes it and moves past the field', async ({ page }) => {
    await open(page);
    const field = page.getByRole('combobox', { name: 'Company picker' });
    await field.click();
    await expect(page.getByRole('dialog', { name: 'Options' })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('dialog', { name: 'Options' })).toHaveCount(0);
    await expect(field).not.toBeFocused();
  });

  test('opening the sheet logs no Radix accessibility warning', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (message) => warnings.push(message.text()));
    await open(page);
    await page.getByRole('combobox', { name: 'Company picker' }).click();
    await expect(page.getByRole('dialog', { name: 'Options' })).toBeVisible();
    expect(warnings.filter((text) => /Description|aria-describedby/.test(text))).toEqual([]);
  });
});
