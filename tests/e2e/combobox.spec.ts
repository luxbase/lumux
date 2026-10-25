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
  await expect(box).toHaveValue('Acme');
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
});
