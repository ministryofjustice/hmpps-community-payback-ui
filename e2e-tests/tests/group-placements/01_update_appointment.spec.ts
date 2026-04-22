import { expect } from '@playwright/test'
import test from '../../fixtures/test'
import signIn from '../../steps/signIn'
import searchForASession from '../../steps/searchForASession'
import selectASession from '../../steps/selectASession'
import clickUpdateAnAppointment from '../../steps/clickUpdateAnAppointment'
import completeCheckAppointmentDetails from '../../steps/completeCheckAppointmentDetails'
import completeCompliance from '../../steps/completeCompliance'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { completeAttendedCompliedOutcome } from '../../steps/completeAttendanceOutcome'
import { checkAppointmentOnDelius } from '../../steps/delius'
import DateTimeUtils from '../../utils/DateTimeUtils'

test('Update a session appointment', async ({ page, deliusUser, team, personOnProbation, project, appointment }) => {
  await page.goto('/sign-out')
  await expect(page.locator('h1')).toContainText('Sign in')

  const homePage = await signIn(page, deliusUser)
  const groupSessionPage = await searchForASession(page, homePage, team, appointment.date)

  await groupSessionPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, groupSessionPage, project.name)

  await sessionPage.expect.toSeeAppointments()

  const checkAppointmentDetailsPage = await clickUpdateAnAppointment(page, sessionPage, personOnProbation.crn)
  const attendanceOutcomePage = await completeCheckAppointmentDetails(
    page,
    checkAppointmentDetailsPage,
    team.supervisor,
  )

  const logHoursPage = await completeAttendedCompliedOutcome(page, attendanceOutcomePage)
  await logHoursPage.enterPenaltyHours()
  await logHoursPage.continue()

  await completeCompliance(page)

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toBeOnThePage()

  await confirmPage.expect.toShowAnswers(team.supervisor, project.availability)
  await confirmPage.expect.toShowAttendanceAnswer('Attended - Complied')
  await confirmPage.expect.toShowPenaltyHoursAnswerWithHoursApplied()
  await confirmPage.expect.toShowComplianceAnswer()
  await confirmPage.selectAlertPractitioner()

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()

  await checkAppointmentOnDelius({
    page,
    team,
    person: personOnProbation,
    project,
    contactOutcome: { outcome: 'Attended - Complied' },
  })

  // recording penalty hours creates a shortfall
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
