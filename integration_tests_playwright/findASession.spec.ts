import { expect, test } from '@playwright/test'
import { resetStubs } from '../integration_tests/mockApis/wiremock'
import AuthStubs from '../integration_tests/mockApis/auth'
import ProviderStubs from '../integration_tests/mockApis/providers'

test('Search project sessions', async ({ page }) => {
  await resetStubs()
  await AuthStubs.stubAuthPing()
  await AuthStubs.stubSignIn()
  await ProviderStubs.stubGetTeams({ providerId: '1000', teams: { providers: [{ id: 1, name: 'Team 1' }] } })
  await page.goto('/')

  await AuthStubs.getSignInUrl().then((url: string) => page.goto(url))

  await page.goto('/sessions')
  await expect(page.locator('h1')).toContainText('Track progress on Community Payback')
})
