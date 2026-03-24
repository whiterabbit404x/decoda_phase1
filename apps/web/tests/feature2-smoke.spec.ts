import { expect, test } from '@playwright/test';

test('localhost:3000/threat renders customer-facing threat analysis workflow', async ({ page }) => {
  const consoleErrors: string[] = [];

  page.on('pageerror', (error) => {
    consoleErrors.push(error.message);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  const response = await page.goto('/threat', { waitUntil: 'networkidle' });

  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('h3', { hasText: 'Threat analysis workspace' })).toBeVisible();
  await expect(page.locator('text=Scenario library')).toBeVisible();
  await expect(page.locator('text=Run analysis')).toBeVisible();
  await expect(page.locator('text=Decision output')).toBeVisible();

  await expect(page.locator('text=Decision summary')).toBeVisible();
  await expect(page.locator('text=Why this decision happened')).toBeVisible();
  await expect(page.locator('text=Recommended operator action')).toBeVisible();

  await expect(page.getByRole('button', { name: 'Copy summary' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy JSON' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open history' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run again' })).toBeVisible();

  await expect(page.locator('body')).not.toContainText('Application error');
  await expect(page.locator('body')).not.toContainText('Unhandled Runtime Error');
  await expect(page.locator('body')).not.toContainText('This page could not be found');

  expect(consoleErrors, `Unexpected console/page errors: ${consoleErrors.join('\n')}`).toEqual([]);
});
