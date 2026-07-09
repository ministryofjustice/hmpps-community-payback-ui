import test from '../../fixtures/test'
import signIn from '../../steps/signIn'
import searchForASession from '../../steps/searchForASession'
import selectASession from '../../steps/selectASession'
import viewAppointmentFromList from '../../steps/viewAppointmentFromList'
import completeCheckAppointmentDetails from '../../steps/completeCheckAppointmentDetails'
import { completeAttendedEnforceableOutcome } from '../../steps/completeAttendanceOutcome'
import completeCompliance from '../../steps/completeCompliance'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { checkAppointmentOnDelius } from '../../steps/delius'
import completeChooseSupervisor from '../../steps/completeChooseSupervisor'
import completeChooseProject from '../../steps/completeChooseProject'

test('Update a session appointment with an attended but enforceable outcome', async ({
  page,
  deliusUser,
  team,
  project,
  personOnProbation,
  appointment,
}) => {
  const homePage = await signIn(page, deliusUser)
  const groupSessionPage = await searchForASession(page, homePage, team, appointment.date)

  await groupSessionPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, groupSessionPage, project.name)

  await sessionPage.expect.toSeeAppointments()

  const checkAppointmentDetailsPage = await viewAppointmentFromList(page, sessionPage, personOnProbation.crn)
  const chooseSupervisorPage = await completeCheckAppointmentDetails(page, checkAppointmentDetailsPage)

  const chooseProjectPage = await completeChooseSupervisor(page, chooseSupervisorPage, team)
  const attendanceOutcomePage = await completeChooseProject(page, chooseProjectPage)

  const logHoursPage = await completeAttendedEnforceableOutcome(page, attendanceOutcomePage)

  await logHoursPage.continue()

  await completeCompliance(page)

  const confirmPage = new ConfirmPage(page)

  await confirmPage.expect.toShowAnswers(team.supervisor, project.availability)
  await confirmPage.expect.toShowOutcome('Attended \u2013 failed to comply')
  await confirmPage.expect.toShowComplianceAnswer()

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()

  await checkAppointmentOnDelius({
    page,
    team,
    person: personOnProbation,
    project,
    contactOutcome: { outcome: 'Attended - Failed to Comply' },
  })
})
