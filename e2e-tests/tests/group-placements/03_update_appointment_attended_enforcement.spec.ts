import test from '../../fixtures/appointmentTest'
import signIn from '../../steps/signIn'
import searchForASession from '../../steps/searchForASession'
import selectASession from '../../steps/selectASession'
import clickUpdateAnAppointment from '../../steps/clickUpdateAnAppointment'
import completeCheckProjectDetails from '../../steps/completeCheckProjectDetails'
import { completeAttendedEnforceableOutcome } from '../../steps/completeAttendanceOutcome'
import completeCompliance from '../../steps/completeCompliance'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { checkAppointmentOnDelius } from '../../steps/delius'

test('Update a session appointment with an attended but enforceable outcome', async ({
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

  const logHoursPage = await completeAttendedEnforceableOutcome(page, attendanceOutcomePage)

  await logHoursPage.continue()

  await completeCompliance(page)

  const confirmPage = new ConfirmPage(page)

  await confirmPage.expect.toShowAnswers(team.supervisor, testData.project.availability)
  await confirmPage.expect.toShowAttendanceAnswer('Attended - Failed to Comply')
  await confirmPage.expect.toShowPenaltyHoursAnswerWithNoHoursApplied()
  await confirmPage.expect.toShowComplianceAnswer()

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()

  await checkAppointmentOnDelius(page, team, testData, { outcome: 'Attended - Failed to Comply' })
})
