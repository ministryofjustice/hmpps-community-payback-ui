import test from '../fixtures/appointmentTest'
import signIn from '../steps/signIn'
import searchForASession from '../steps/searchForASession'
import selectASession from '../steps/selectASession'
import clickUpdateAnAppointment from '../steps/clickUpdateAnAppointment'
import completeCheckProjectDetails from '../steps/completeCheckProjectDetails'
import { completeNotAttendedNotEnforceableOutcome } from '../steps/completeAttendanceOutcome'
import ConfirmPage from '../pages/appointments/confirmPage'
import { checkAppointmentOnDelius } from '../steps/delius'

test('Update a session appointment with a not attended but not enforceable outcome', async ({
  page,
  deliusUser,
  team,
  testData,
}) => {
  const homePage = await signIn(page, deliusUser)
  const trackProgressPage = await searchForASession(page, homePage, team)

  await trackProgressPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, trackProgressPage, testData.project.name)

  await sessionPage.expect.toSeeAppointments()

  const checkProjectDetailsPage = await clickUpdateAnAppointment(page, sessionPage, testData.person.crn)
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
  await checkAppointmentOnDelius(page, team, testData, { outcome: 'Suspended' })
})
