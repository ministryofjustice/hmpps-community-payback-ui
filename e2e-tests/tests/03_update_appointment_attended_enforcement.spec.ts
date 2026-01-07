import test from '../fixtures/test'
import signIn from '../steps/signIn'
import searchForASession from '../steps/searchForASession'
import selectASession from '../steps/selectASession'
import clickUpdateAnAppointment from '../steps/clickUpdateAnAppointment'
import completeCheckProjectDetails from '../steps/completeCheckProjectDetails'
import { completeAttendedEnforceableOutcome } from '../steps/completeAttendanceOutcome'
import completeCompliance from '../steps/completeCompliance'
import PersonOnProbation from '../delius/personOnProbation'
import { readDeliusData } from '../delius/deliusTestData'
import ConfirmPage from '../pages/appointments/confirmPage'

test('Update a session appointment with an attended but enforceable outcome', async ({
  page,
  deliusUser,
  team,
  testIds,
}) => {
  const index = testIds.findIndex(testId => testId === test.info().testId)
  const deliusTestData = await readDeliusData()
  const person = deliusTestData.pops[index] as PersonOnProbation

  const homePage = await signIn(page, deliusUser)
  const trackProgressPage = await searchForASession(page, homePage, team)

  await trackProgressPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, trackProgressPage, deliusTestData.project.name)

  await sessionPage.expect.toSeeAppointments()

  const checkProjectDetailsPage = await clickUpdateAnAppointment(page, sessionPage, person.crn)
  const attendanceOutcomePage = await completeCheckProjectDetails(page, checkProjectDetailsPage, team.supervisor)

  const logHoursPage = await completeAttendedEnforceableOutcome(page, attendanceOutcomePage)

  await logHoursPage.enterHours()
  await logHoursPage.continue()

  await completeCompliance(page)

  const confirmPage = new ConfirmPage(page)

  await confirmPage.expect.toShowAnswers(team.supervisor)
  await confirmPage.expect.toShowAttendanceAnswer('Attended - Failed to Comply')
  await confirmPage.expect.toShowPenaltyHoursAnswerWithNoHoursApplied()
  await confirmPage.expect.toShowComplianceAnswer()

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()
})
