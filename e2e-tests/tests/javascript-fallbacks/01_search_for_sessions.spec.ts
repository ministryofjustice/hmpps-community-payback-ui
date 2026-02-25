import { expect } from '@playwright/test'
import test from '../../fixtures/appointmentTest'
import signIn from '../../steps/signIn'
import GroupSessionPage from '../../pages/groupSessionPage'

test.describe('Without javascript', () => {
  test.use({ javaScriptEnabled: false })

  test('Update a session appointment', async ({ page, deliusUser, team }) => {
    await page.goto('/sign-out')
    await expect(page.locator('h1')).toContainText('Sign in')

    const homePage = await signIn(page, deliusUser)
    const groupSessionPage = new GroupSessionPage(page)

    await homePage.trackCommunityPaybackProgressLink.click()
    await groupSessionPage.expect.toBeOnThePage()

    await groupSessionPage.teamFilter.selectRegion(team)
    await groupSessionPage.teamFilter.applyButtonLocator.click()
    await groupSessionPage.teamFilter.selectTeam(team)
    await groupSessionPage.completeSearchForm(new Date(), new Date())
    await groupSessionPage.submitForm()

    await groupSessionPage.expect.toSeeResults()
  })
})
