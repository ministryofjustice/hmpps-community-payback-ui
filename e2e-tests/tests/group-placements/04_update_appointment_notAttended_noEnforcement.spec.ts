import test from '../../fixtures/test'
import signIn from '../../steps/signIn'
import searchForASession from '../../steps/searchForASession'
import selectASession from '../../steps/selectASession'
import clickUpdateAnAppointment from '../../steps/clickUpdateAnAppointment'
import completeCheckAppointmentDetails from '../../steps/completeCheckAppointmentDetails'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { checkAppointmentOnDelius } from '../../steps/delius'
import DateTimeUtils from '../../utils/DateTimeUtils'

test('Update a session appointment with a not attended but not enforceable outcome', async ({
  page,
  deliusUser,
  team,
  personOnProbation,
  project,
}) => {
  const homePage = await signIn(page, deliusUser)
  const groupSessionPage = await searchForASession(page, homePage, team)

  await groupSessionPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, groupSessionPage, project.name)

  await sessionPage.expect.toSeeAppointments()

  const checkAppointmentDetailsPage = await clickUpdateAnAppointment(page, sessionPage, personOnProbation.crn)
  const attendanceOutcomePage = await completeCheckAppointmentDetails(
    page,
    checkAppointmentDetailsPage,
    team.supervisor,
  )

  await attendanceOutcomePage.chooseNotAttendedNotEnforcementOutcome()
  await attendanceOutcomePage.continue()

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toBeOnThePage()

  await confirmPage.expect.toShowAnswers(team.supervisor, project.availability, false)
  await confirmPage.expect.toShowAttendanceAnswer('Rescheduled - Service Request')

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()

  await checkAppointmentOnDelius({
    page,
    team,
    person: personOnProbation,
    project,
    contactOutcome: { outcome: 'Rescheduled - Service Request' },
  })

  await homePage.visit()
  const rescheduledAppointmentDate = DateTimeUtils.plusDays(new Date(), 7)
  const rescheduledSessionsPage = await searchForASession(
    page,
    homePage,
    team,
    rescheduledAppointmentDate,
    rescheduledAppointmentDate,
  )
  await rescheduledSessionsPage.expect.toSeeResults()

  const rescheduledSessionPage = await selectASession(page, groupSessionPage, project.name)
  await rescheduledSessionPage.expect.toSeeAppointmentForCrn(personOnProbation.crn)
})
