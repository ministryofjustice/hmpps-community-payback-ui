import test from '../../fixtures/appointmentTest'
import CourseCompletionDetailsPage from '../../pages/courseCompletions/courseCompletionDetailsPage'
import searchCourseCompletions from '../../steps/searchCourseCompletions'
import sendCourseCompletionMessage from '../../steps/sendCourseCompletionMessage'
import signIn from '../../steps/signIn'

test('Process course completion', async ({ eteExternalApiClient, page, deliusUser }) => {
  await sendCourseCompletionMessage(eteExternalApiClient)

  const homePage = await signIn(page, deliusUser)
  const searchCourseCompletionsPage = await searchCourseCompletions(page, homePage)

  await searchCourseCompletionsPage.expect.toSeeCourseCompletions()

  const personName = await searchCourseCompletionsPage.clickViewACourseCompletion()

  const courseCompletionsDetailsPage = new CourseCompletionDetailsPage(page, personName)
  await courseCompletionsDetailsPage.expect.toBeOnThePage()
})
