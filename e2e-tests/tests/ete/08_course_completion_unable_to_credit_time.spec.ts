import test from '../../fixtures/test'
import CourseCompletionDetailsPage from '../../pages/courseCompletions/courseCompletionDetailsPage'
import CourseCompletionFormPage from '../../pages/courseCompletions/courseCompletionFormPage'
import searchCourseCompletions from '../../steps/searchCourseCompletions'
import sendCourseCompletionMessage from '../../steps/sendCourseCompletionMessage'
import signIn from '../../steps/signIn'

test('Process course completion - unable to credit time', async ({
  eteExternalApiClient,
  page,
  deliusUser,
  team,
  personOnProbation,
}) => {
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
  await courseCompletionsDetailsPage.clickProcess()

  const courseCompletionFormPage = new CourseCompletionFormPage(page)

  await courseCompletionFormPage.expect.toBeOnThePage('crn')
  await courseCompletionFormPage.clickUnableToCreditTimeLink()
  await courseCompletionFormPage.completeUnableToCreditTimeForm()
  await courseCompletionFormPage.submit()
})
