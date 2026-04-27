import { login as deliusLogin } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import verifyTimeCredited from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/verify-time-credited'
import test from '../../fixtures/test'
import CourseCompletionDetailsPage from '../../pages/courseCompletions/courseCompletionDetailsPage'
import CourseCompletionFormPage from '../../pages/courseCompletions/courseCompletionFormPage'
import searchCourseCompletions from '../../steps/searchCourseCompletions'
import sendCourseCompletionMessage from '../../steps/sendCourseCompletionMessage'
import signIn from '../../steps/signIn'

test('Process course completion - create new appointment', async ({
  eteExternalApiClient,
  page,
  deliusUser,
  project,
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
  await courseCompletionFormPage.createNewAppointmentButton.click()

  await courseCompletionFormPage.expect.toBeOnThePage('outcome')
  const timeCredited = { hours: '1', minutes: '10' }
  const date = new Date()
  await courseCompletionFormPage.completeOutcomeForm(timeCredited, date)
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('confirm')
  await courseCompletionFormPage.continue()

  await searchCourseCompletionsPage.expect.toBeOnThePage()
  await searchCourseCompletionsPage.expect.toSeeCourseCompletions()

  await deliusLogin(page)
  await verifyTimeCredited(page, {
    crn: personOnProbation.crn,
    projectName: project.name,
    hoursCredited: `${timeCredited.hours}:${timeCredited.minutes}`,
    outcome: 'Attended - Complied',
    date,
  })
})
