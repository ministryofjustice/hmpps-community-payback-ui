import test from '../../fixtures/test'
import CourseCompletionDetailsPage from '../../pages/courseCompletions/courseCompletionDetailsPage'
import searchCourseCompletions from '../../steps/searchCourseCompletions'
import sendCourseCompletionMessage from '../../steps/sendCourseCompletionMessage'
import signIn from '../../steps/signIn'

test('Process course completion', async ({ eteExternalApiClient, page, deliusUser, team, personOnProbation }) => {
  await test.step('Send Course Completion Message', async () => {
    return sendCourseCompletionMessage(eteExternalApiClient, team, personOnProbation)
  })

  const homePage = await signIn(page, deliusUser)
  const searchCourseCompletionsPage = await searchCourseCompletions(page, homePage, team)

  await searchCourseCompletionsPage.expect.toSeeCourseCompletions()

  const personName = personOnProbation.getFullName()

  await searchCourseCompletionsPage.clickCourseCompletion(personName)

  const courseCompletionsDetailsPage = new CourseCompletionDetailsPage(page, personName)
  await courseCompletionsDetailsPage.expect.toBeOnThePage()
})
