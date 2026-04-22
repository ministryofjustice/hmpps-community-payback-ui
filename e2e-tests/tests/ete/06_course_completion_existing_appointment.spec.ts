import test from '../../fixtures/test'
import CourseCompletionDetailsPage from '../../pages/courseCompletions/courseCompletionDetailsPage'
import CourseCompletionFormPage from '../../pages/courseCompletions/courseCompletionFormPage'
import searchCourseCompletions from '../../steps/searchCourseCompletions'
import sendCourseCompletionMessage from '../../steps/sendCourseCompletionMessage'
import signIn from '../../steps/signIn'

test('Process course completion - credit time on existing appointment', async ({
  eteExternalApiClient,
  page,
  deliusUser,
  team,
  project,
  personOnProbation,
  appointment,
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

  const courseCompletionFormPage = new CourseCompletionFormPage(page, true)

  await courseCompletionFormPage.expect.toBeOnThePage('crn')
  await courseCompletionFormPage.fillCrn(personOnProbation.crn)
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('person')
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('history')
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('requirement')
  await courseCompletionFormPage.selectRequirement()
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('project')
  await courseCompletionFormPage.selectProject(team, project)
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('appointments')
  await courseCompletionFormPage.selectAppointment(appointment)
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('outcome')
  await courseCompletionFormPage.completeOutcomeForm()
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('confirm')
  await courseCompletionFormPage.continue()

  await searchCourseCompletionsPage.expect.toBeOnThePage()
})
