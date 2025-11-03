import test from '../test'
import signIn from '../steps/signIn'
import searchForASession from '../steps/searchForASession'
import selectASession from '../steps/selectASession'
import clickUpdateAnAppointment from '../steps/clickUpdateAnAppointment'
import completeCheckProjectDetails from '../steps/completeCheckProjectDetails'
import completeHours from '../steps/completeHours'
import EnforcementPage from '../pages/appointments/enforcementPage'
import completeEnforcement from '../steps/completeEnforcement'
import { completeNotAttendedEnforceableOutcome } from '../steps/completeAttendanceOutcome'

test('Update a session appoinment with an enforceable outcome', async ({ page, deliusUser }) => {
  const homePage = await signIn(page, deliusUser)
  const trackProgressPage = await searchForASession(page, homePage)

  await trackProgressPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, trackProgressPage)

  await sessionPage.expect.toSeeAppointments()

  const checkProjectDetailsPage = await clickUpdateAnAppointment(page, sessionPage)
  const attendanceOutcomePage = await completeCheckProjectDetails(page, checkProjectDetailsPage)

  const logHoursPage = await completeNotAttendedEnforceableOutcome(page, attendanceOutcomePage)
  await completeHours(logHoursPage)

  const enforcementPage = new EnforcementPage(page)
  await enforcementPage.expect.toBeOnThePage()

  const confirmPage = await completeEnforcement(page, enforcementPage)
  await confirmPage.expect.toShowEnforcementAction()
})
