import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const username = process.env.LEAFTAPS_USERNAME;
const password = process.env.LEAFTAPS_PASSWORD;
const credentialsMessage = 'Set LEAFTAPS_USERNAME and LEAFTAPS_PASSWORD to run credential-based login tests.';

type LoginScenario = {
  name: string;
  username: string | undefined;
  password: string | undefined;
  expectsLogin: boolean;
  requiresCredentials?: boolean;
};

const loginScenarios: LoginScenario[] = [
  {
    name: 'logs in with valid credentials',
    username,
    password,
    expectsLogin: true,
    requiresCredentials: true,
  },
  {
    name: 'rejects an unknown username and password',
    username: 'invalid-user',
    password: 'invalid-password',
    expectsLogin: false,
  },
  ...(username
    ? [{
        name: 'rejects an invalid password for a known username',
        username,
        password: 'invalid-password',
        expectsLogin: false,
      }]
    : []),
];

test.describe('Leaftaps login', () => {
  for (const scenario of loginScenarios) {
    test(scenario.name, async ({ page }) => {
      if (scenario.requiresCredentials) {
        test.skip(!scenario.username || !scenario.password, credentialsMessage);
      }

      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(scenario.username ?? '', scenario.password ?? '');

      if (scenario.expectsLogin) {
        await expect(page.getByRole('heading', { name: 'Welcome Demo B2C CSR' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'CRM/SFA' })).toBeVisible();
        return;
      }

      await expect(loginPage.heading).toBeVisible();
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Welcome Demo B2C CSR' })).toHaveCount(0);
    });
  }

  test('keeps the login form available when submitted empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.submit();

    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Welcome Demo B2C CSR' })).toHaveCount(0);
  });
});
