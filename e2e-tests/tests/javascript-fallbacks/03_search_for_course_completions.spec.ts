import { expect } from '@playwright/test'
import test from '../../fixtures/test'
import signIn from '../../steps/signIn'
import sendCourseCompletionMessage from '../../steps/sendCourseCompletionMessage'
import CourseCompletionDetailsPage from '../../pages/courseCompletions/courseCompletionDetailsPage'
import SearchCourseCompletionsPage from '../../pages/courseCompletions/searchCourseCompletionsPage'

test.describe('Without javascript', () => {
  test.use({ javaScriptEnabled: false })

  test('Process course completion', async ({ eteExternalApiClient, page, deliusUser }) => {
    await page.goto('/sign-out')
    await expect(page.locator('h1')).toContainText('Sign in')

    await sendCourseCompletionMessage(eteExternalApiClient)

    const homePage = await signIn(page, deliusUser)

    const searchCourseCompletionsPage = new SearchCourseCompletionsPage(
      page,
      'Process employment, training and education completions',
    )

    await homePage.courseCompletionsLink.click()
    await searchCourseCompletionsPage.expect.toBeOnThePage()

    await searchCourseCompletionsPage.pduFilter.selectRegion()
    await searchCourseCompletionsPage.applyRegion()
    await searchCourseCompletionsPage.pduFilter.selectPdu()
    await searchCourseCompletionsPage.submitForm()

    await searchCourseCompletionsPage.expect.toSeeCourseCompletions()

    const personName = await searchCourseCompletionsPage.clickViewACourseCompletion()

    const courseCompletionsDetailsPage = new CourseCompletionDetailsPage(page, personName)
    await courseCompletionsDetailsPage.expect.toBeOnThePage()
  })
})
