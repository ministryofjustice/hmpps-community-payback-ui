import test from '../fixtures/test'
import signIn from '../steps/signIn'
import searchForASession from '../steps/searchForASession'
import selectASession from '../steps/selectASession'
import clickUpdateAnAppointment from '../steps/clickUpdateAnAppointment'
import completeCheckProjectDetails from '../steps/completeCheckProjectDetails'
import { completeNotAttendedNotEnforceableOutcome } from '../steps/completeAttendanceOutcome'
import ConfirmPage from '../pages/appointments/confirmPage'
import { readDeliusData } from '../delius/deliusTestData'

test('Update a session appointment with a not attended but not enforceable outcome', async ({
  page,
  deliusUser,
  team,
  testIds,
}) => {
  const index = testIds.findIndex(testId => testId === test.info().testId)
  const deliusTestData = await readDeliusData(index)
  const { person } = deliusTestData

  const homePage = await signIn(page, deliusUser)
  const trackProgressPage = await searchForASession(page, homePage, team)

  await trackProgressPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, trackProgressPage, deliusTestData.project.name)

  await sessionPage.expect.toSeeAppointments()

  const checkProjectDetailsPage = await clickUpdateAnAppointment(page, sessionPage, person.crn)
  const attendanceOutcomePage = await completeCheckProjectDetails(page, checkProjectDetailsPage, team.supervisor)

  const logHoursPage = await completeNotAttendedNotEnforceableOutcome(page, attendanceOutcomePage)

  await logHoursPage.enterHours()
  await logHoursPage.continue()

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toBeOnThePage()

  await confirmPage.expect.toShowAnswers(team.supervisor)
  await confirmPage.expect.toShowAttendanceAnswer('Suspended')

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()
})
