import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { deleteUserProfileFromDatabaseById } from '~/self-inquiry/infrastructure/user-profile-model.server'
import { loginAndSaveUserProfileToDatabase } from '../utils'

test.describe('landing page', () => {
  test('given user is logged in: redirects you to the prompt queue page', async ({ page, baseURL }) => {
    const { id } = await loginAndSaveUserProfileToDatabase({ page })

    await page.goto('./')
    const currentUrl = new URL(page.url())
    expect(currentUrl.origin + currentUrl.pathname).toEqual(baseURL + '/queue')

    await deleteUserProfileFromDatabaseById(id)
  })

  test('given user is logged out: the landing page loads', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { level: 1, name: 'Sati' })).toBeVisible()
  })

  test('given user is logged out: page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('./')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })
})
