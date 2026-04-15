import { expect } from '@playwright/test'
import test from '../../fixtures/test'
import signIn from '../../steps/signIn'
import sendCourseCompletionMessage from '../../steps/sendCourseCompletionMessage'
import SearchCourseCompletionsPage from '../../pages/courseCompletions/searchCourseCompletionsPage'

test.describe('Without javascript', () => {
  test.use({ javaScriptEnabled: false })

  test('Search for course completions', async ({ eteExternalApiClient, page, deliusUser, team }) => {
    await page.goto('/sign-out')
    await expect(page.locator('h1')).toContainText('Sign in')

    await sendCourseCompletionMessage(eteExternalApiClient, team)

    const homePage = await signIn(page, deliusUser)

    const searchCourseCompletionsPage = new SearchCourseCompletionsPage(
      page,
      'Process Community Campus course completions',
    )

    await homePage.courseCompletionsLink.click()
    await searchCourseCompletionsPage.expect.toBeOnThePage()

    await searchCourseCompletionsPage.pduFilter.selectRegion(team.provider)
    await searchCourseCompletionsPage.applyRegion()
    await searchCourseCompletionsPage.pduFilter.selectPdu(team.pdu)
    await searchCourseCompletionsPage.submitForm()

    await searchCourseCompletionsPage.expect.toSeeCourseCompletions()
  })
})
