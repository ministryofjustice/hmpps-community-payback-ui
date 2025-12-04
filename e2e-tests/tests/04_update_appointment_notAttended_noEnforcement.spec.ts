import test from '../test'
import signIn from '../steps/signIn'
import searchForASession from '../steps/searchForASession'
import selectASession from '../steps/selectASession'
import clickUpdateAnAppointment from '../steps/clickUpdateAnAppointment'
import completeCheckProjectDetails from '../steps/completeCheckProjectDetails'
import { completeNotAttendedNotEnforceableOutcome } from '../steps/completeAttendanceOutcome'
import ConfirmPage from '../pages/appointments/confirmPage'
import PersonOnProbation from '../delius/personOnProbation'
import { readDeliusData } from '../delius/deliusTestData'

test('Update a session appointment with a not attended but not enforceable outcome', async ({ page, deliusUser }) => {
  const deliusTestData = await readDeliusData()
  const person = deliusTestData.pops[3] as PersonOnProbation

  const homePage = await signIn(page, deliusUser)
  const trackProgressPage = await searchForASession(page, homePage)

  await trackProgressPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, trackProgressPage, deliusTestData.project.name)

  await sessionPage.expect.toSeeAppointments()

  const checkProjectDetailsPage = await clickUpdateAnAppointment(page, sessionPage, person.crn)
  const attendanceOutcomePage = await completeCheckProjectDetails(page, checkProjectDetailsPage)

  const logHoursPage = await completeNotAttendedNotEnforceableOutcome(page, attendanceOutcomePage)

  await logHoursPage.enterHours()
  await logHoursPage.continue()

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toBeOnThePage()

  await confirmPage.expect.toShowAnswers()
  await confirmPage.expect.toShowAttendanceAnswer('Suspended')

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()
})
