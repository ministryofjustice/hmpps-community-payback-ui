import { expect } from '@playwright/test'
import test from '../../fixtures/appointmentTest'
import signIn from '../../steps/signIn'
import FindIndividualPlacementsPage from '../../pages/projects/findIndividualPlacementsPage'

test.describe('Without javascript', () => {
  test.use({ javaScriptEnabled: false })

  test.skip('Update a session appointment', async ({ page, deliusUser, team }) => {
    await page.goto('/sign-out')
    await expect(page.locator('h1')).toContainText('Sign in')

    const homePage = await signIn(page, deliusUser)
    const individualPlacementsPage = new FindIndividualPlacementsPage(page)

    await homePage.trackIndividualPlacementsLink.click()
    await individualPlacementsPage.expect.toBeOnThePage()

    await individualPlacementsPage.teamFilter.selectRegion(team)
    await individualPlacementsPage.teamFilter.applyButtonLocator.click()
    await individualPlacementsPage.teamFilter.selectTeam(team)

    await individualPlacementsPage.teamFilter.submitForm()

    await individualPlacementsPage.expect.toSeeResults()
  })
})
