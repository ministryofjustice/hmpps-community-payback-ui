import test from '../test'
import signIn from '../steps/signIn'
import searchForASession from '../steps/searchForASession'
import selectASession from '../steps/selectASession'
import clickUpdateAnAppointment from '../steps/clickUpdateAnAppointment'
import completeCheckProjectDetails from '../steps/completeCheckProjectDetails'
import completeHours from '../steps/completeHours'
import completeCompliance from '../steps/completeCompliance'
import ConfirmPage from '../pages/appointments/confirmPage'
import { completeAttendedCompliedOutcome } from '../steps/completeAttendanceOutcome'

test('Update a session appoinment', async ({ page, deliusUser }) => {
  const homePage = await signIn(page, deliusUser)
  const trackProgressPage = await searchForASession(page, homePage)

  await trackProgressPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, trackProgressPage)

  await sessionPage.expect.toSeeAppointments()

  const checkProjectDetailsPage = await clickUpdateAnAppointment(page, sessionPage)
  const attendanceOutcomePage = await completeCheckProjectDetails(page, checkProjectDetailsPage)

  const logHoursPage = await completeAttendedCompliedOutcome(page, attendanceOutcomePage)

  await completeHours(logHoursPage)
  await completeCompliance(page)

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toBeOnThePage()

  await confirmPage.expect.toShowAnswers()
  await confirmPage.expect.toShowAttendanceAnswer('Attended - Complied')
  await confirmPage.expect.toShowPenaltyHoursAnswer()
  await confirmPage.expect.toShowComplianceAnswer()

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()
})
