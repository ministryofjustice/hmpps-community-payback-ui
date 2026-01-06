import test from '../test'
import signIn from '../steps/signIn'
import searchForASession from '../steps/searchForASession'
import selectASession from '../steps/selectASession'
import clickUpdateAnAppointment from '../steps/clickUpdateAnAppointment'
import completeCheckProjectDetails from '../steps/completeCheckProjectDetails'
import { completeNotAttendedEnforceableOutcome } from '../steps/completeAttendanceOutcome'
import PersonOnProbation from '../delius/personOnProbation'
import { readDeliusData } from '../delius/deliusTestData'
import ConfirmPage from '../pages/appointments/confirmPage'

test('Update a session appointment with an enforceable outcome', async ({ page, deliusUser, team }) => {
  const index = test.info().parallelIndex
  const deliusTestData = await readDeliusData()
  const person = deliusTestData.pops[index] as PersonOnProbation

  const homePage = await signIn(page, deliusUser)
  const trackProgressPage = await searchForASession(page, homePage, team)

  await trackProgressPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, trackProgressPage, deliusTestData.project.name)

  await sessionPage.expect.toSeeAppointments()

  const checkProjectDetailsPage = await clickUpdateAnAppointment(page, sessionPage, person.crn)
  const attendanceOutcomePage = await completeCheckProjectDetails(page, checkProjectDetailsPage, team.supervisor)

  const logHoursPage = await completeNotAttendedEnforceableOutcome(page, attendanceOutcomePage)
  await logHoursPage.enterHours()
  await logHoursPage.continue()

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toShowAnswers(team.supervisor)
  await confirmPage.expect.toShowAttendanceAnswer('Unacceptable Absence')

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()
})
