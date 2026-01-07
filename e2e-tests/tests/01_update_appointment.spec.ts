import { expect } from '@playwright/test'
import test from '../fixtures/test'
import signIn from '../steps/signIn'
import searchForASession from '../steps/searchForASession'
import selectASession from '../steps/selectASession'
import clickUpdateAnAppointment from '../steps/clickUpdateAnAppointment'
import completeCheckProjectDetails from '../steps/completeCheckProjectDetails'
import completeCompliance from '../steps/completeCompliance'
import ConfirmPage from '../pages/appointments/confirmPage'
import { completeAttendedCompliedOutcome } from '../steps/completeAttendanceOutcome'
import PersonOnProbation from '../delius/personOnProbation'
import { readDeliusData } from '../delius/deliusTestData'

test('Update a session appointment', async ({ page, deliusUser, team, testIds }) => {
  const index = testIds.findIndex(testId => testId === test.info().testId)
  const deliusTestData = await readDeliusData()
  const person = deliusTestData.pops[index] as PersonOnProbation

  await page.goto('/sign-out')
  await expect(page.locator('h1')).toContainText('Sign in')

  const homePage = await signIn(page, deliusUser)
  const trackProgressPage = await searchForASession(page, homePage, team)

  await trackProgressPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, trackProgressPage, deliusTestData.project.name)

  await sessionPage.expect.toSeeAppointments()

  const checkProjectDetailsPage = await clickUpdateAnAppointment(page, sessionPage, person.crn)
  const attendanceOutcomePage = await completeCheckProjectDetails(page, checkProjectDetailsPage, team.supervisor)

  const logHoursPage = await completeAttendedCompliedOutcome(page, attendanceOutcomePage)

  await logHoursPage.enterHours()
  await logHoursPage.enterPenaltyHours()
  await logHoursPage.continue()

  await completeCompliance(page)

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toBeOnThePage()

  await confirmPage.expect.toShowAnswers(team.supervisor)
  await confirmPage.expect.toShowAttendanceAnswer('Attended - Complied')
  await confirmPage.expect.toShowPenaltyHoursAnswerWithHoursApplied()
  await confirmPage.expect.toShowComplianceAnswer()

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()
})
