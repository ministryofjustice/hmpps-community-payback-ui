import { expect } from '@playwright/test'
import test from '../../fixtures/test'
import signIn from '../../steps/signIn'
import searchForASession from '../../steps/searchForASession'
import selectASession from '../../steps/selectASession'
import viewAppointmentFromList from '../../steps/viewAppointmentFromList'
import completeCheckAppointmentDetails from '../../steps/completeCheckAppointmentDetails'
import completeCompliance from '../../steps/completeCompliance'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { completeAttendedCompliedOutcome } from '../../steps/completeAttendanceOutcome'
import { checkAppointmentOnDelius } from '../../steps/delius'
import completeChooseSupervisor from '../../steps/completeChooseSupervisor'

test('Update a session appointment', async ({ page, deliusUser, team, project, personOnProbation, appointment }) => {
  await page.goto('/sign-out')
  await expect(page.locator('h1')).toContainText('Sign in')

  const homePage = await signIn(page, deliusUser)
  const groupSessionPage = await searchForASession(page, homePage, team, appointment.date)

  await groupSessionPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, groupSessionPage, project.name)

  await sessionPage.expect.toSeeAppointments()

  const checkAppointmentDetailsPage = await viewAppointmentFromList(page, sessionPage, personOnProbation.crn)
  const chooseSupervisorPage = await completeCheckAppointmentDetails(page, checkAppointmentDetailsPage)

  const attendanceOutcomePage = await completeChooseSupervisor(page, chooseSupervisorPage, team)

  const logHoursPage = await completeAttendedCompliedOutcome(page, attendanceOutcomePage, true)
  await logHoursPage.continue()

  await completeCompliance(page)

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toBeOnThePage()

  await confirmPage.expect.toShowAnswers(team.supervisor, project.availability)
  await confirmPage.expect.toShowOutcome('Attended \u2013 complied')
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
})
