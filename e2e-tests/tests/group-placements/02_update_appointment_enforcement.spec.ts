import test from '../../fixtures/test'
import signIn from '../../steps/signIn'
import searchForASession from '../../steps/searchForASession'
import selectASession from '../../steps/selectASession'
import viewAppointmentFromList from '../../steps/viewAppointmentFromList'
import completeCheckAppointmentDetails from '../../steps/completeCheckAppointmentDetails'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { checkAppointmentOnDelius } from '../../steps/delius'
import DateTimeUtils from '../../utils/DateTimeUtils'
import completeChooseSupervisor from '../../steps/completeChooseSupervisor'

test('Update a session appointment with an enforceable outcome', async ({
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

  const attendanceOutcomePage = await completeChooseSupervisor(page, chooseSupervisorPage, team)
  await attendanceOutcomePage.chooseEnforcementOutcome()
  await attendanceOutcomePage.continue()

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toShowAnswers(team.supervisor, project.availability, false)
  await confirmPage.expect.toShowAttendanceAnswer('Unacceptable absence')
  await confirmPage.expect.toShowMessageThatOutcomeWillAlert()

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()

  await checkAppointmentOnDelius({
    page,
    team,
    person: personOnProbation,
    project,
    contactOutcome: { outcome: 'Unacceptable Absence (CP Only)' },
  })

  await homePage.visit()
  const rescheduledAppointmentDate = DateTimeUtils.plusDays(new Date(), 7)
  const rescheduledSessionsPage = await searchForASession(page, homePage, team, rescheduledAppointmentDate)
  await rescheduledSessionsPage.expect.toSeeResults()

  const rescheduledSessionPage = await selectASession(page, groupSessionPage, project.name)
  await rescheduledSessionPage.expect.toSeeAppointmentForCrn(personOnProbation.crn)
})
