import { login as deliusLogin } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import verifyTimeCredited from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/verify-time-credited'
import test from '../../fixtures/test'
import CourseCompletionDetailsPage from '../../pages/courseCompletions/courseCompletionDetailsPage'
import CourseCompletionFormPage from '../../pages/courseCompletions/courseCompletionFormPage'
import searchCourseCompletions from '../../steps/searchCourseCompletions'
import sendCourseCompletionMessage from '../../steps/sendCourseCompletionMessage'
import signIn from '../../steps/signIn'

test('Process course completion - use recommended CRN', async ({
  eteExternalApiClient,
  page,
  deliusUser,
  e2eProjects,
  team,
  personOnProbation,
}) => {
  const [firstProject, secondProject] = e2eProjects
  // Record first course for a person
  await test.step('Send Course Completion Message', async () => {
    return sendCourseCompletionMessage({ eteExternalApiClient, team, personOnProbation })
  })

  const homePage = await signIn(page, deliusUser)
  await homePage.courseCompletionsLink.click()
  const searchCourseCompletionsPage = await searchCourseCompletions(page, team)

  await searchCourseCompletionsPage.expect.toSeeSearchResults()

  const personName = personOnProbation.getFullName()

  await searchCourseCompletionsPage.clickCourseCompletion(personName)

  const courseCompletionsDetailsPage = new CourseCompletionDetailsPage(page, personName)
  await courseCompletionsDetailsPage.expect.toBeOnThePage()
  await courseCompletionsDetailsPage.clickProcess()

  const courseCompletionFormPage = new CourseCompletionFormPage(page, personOnProbation)

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
  await courseCompletionFormPage.selectProject(team, firstProject)
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('appointments')
  await courseCompletionFormPage.createNewAppointmentButton.click()

  await courseCompletionFormPage.expect.toBeOnThePage('outcome')
  const date = new Date()
  await courseCompletionFormPage.completeOutcomeForm({ hours: '0', minutes: '20' }, date)
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('confirm')
  await courseCompletionFormPage.continue()

  await searchCourseCompletionsPage.expect.toBeOnThePage()
  await searchCourseCompletionsPage.expect.toSeeSearchResults()
  await searchCourseCompletionsPage.courseCompletions.expect.notToHaveRowWithContent(personName)

  // Record second course for the same account

  await test.step('Send Course Completion Message', async () => {
    return sendCourseCompletionMessage({ eteExternalApiClient, team, personOnProbation })
  })

  await searchCourseCompletions(page, team)

  await searchCourseCompletionsPage.expect.toSeeSearchResults()

  await searchCourseCompletionsPage.clickCourseCompletion(personName)

  await courseCompletionsDetailsPage.expect.toBeOnThePage()
  await courseCompletionsDetailsPage.clickProcess()

  await courseCompletionFormPage.expect.toBeOnThePage('person')
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('history')
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('requirement')
  await courseCompletionFormPage.selectRequirement()
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('project')
  await courseCompletionFormPage.selectProject(team, secondProject)
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('appointments')
  await courseCompletionFormPage.createNewAppointmentButton.click()

  await courseCompletionFormPage.expect.toBeOnThePage('outcome')
  await courseCompletionFormPage.completeOutcomeForm({ hours: '0', minutes: '25' }, date)
  await courseCompletionFormPage.continue()

  await courseCompletionFormPage.expect.toBeOnThePage('confirm')
  await courseCompletionFormPage.continue()

  await searchCourseCompletionsPage.expect.toBeOnThePage()
  await searchCourseCompletionsPage.expect.toSeeSearchResults()
  await searchCourseCompletionsPage.courseCompletions.expect.notToHaveRowWithContent(personName)

  await deliusLogin(page)
  // Verify first course outcome was recorded
  await verifyTimeCredited(page, {
    crn: personOnProbation.crn,
    projectName: firstProject,
    hoursCredited: '0:20',
    outcome: 'Attended - Complied',
    date,
  })

  // Verify second course outcome was recorded
  await verifyTimeCredited(page, {
    crn: personOnProbation.crn,
    projectName: secondProject,
    hoursCredited: '0:25',
    outcome: 'Attended - Complied',
    date,
  })
})
