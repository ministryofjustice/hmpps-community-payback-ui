import { expect } from '@playwright/test'
import { login as deliusLogin } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import { checkAppointmentOnDelius } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/checkAppointmentDetails'
import test from '../../fixtures/test'
import signIn from '../../steps/signIn'
import searchForASession from '../../steps/searchForASession'
import selectASession from '../../steps/selectASession'
import completeCompliance from '../../steps/completeCompliance'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { completeAttendedCompliedOutcome } from '../../steps/completeAttendanceOutcome'
import completeChooseSupervisor from '../../steps/completeChooseSupervisor'
import BulkUpdatePeoplePage from '../../pages/appointments/bulkUpdatePeoplePage'
import ChooseSupervisorPage from '../../pages/appointments/chooseSupervisorPage'

test('Bulk update a group session => attended', async ({ page, deliusUser, team, project, groupSession: session }) => {
  await page.goto('/sign-out')
  await expect(page.locator('h1')).toContainText('Sign in')

  const homePage = await signIn(page, deliusUser)
  const groupSessionPage = await searchForASession(page, homePage, team, session.date)

  await groupSessionPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, groupSessionPage, project.name)

  await sessionPage.expect.toSeeAppointments()
  await sessionPage.clickBulkUpdate()

  const bulkUpdatePeoplePage = new BulkUpdatePeoplePage(page)
  await bulkUpdatePeoplePage.expect.toBeOnThePage()
  await bulkUpdatePeoplePage.selectPeople(session.peopleOnProbation)

  await bulkUpdatePeoplePage.continue()

  const chooseSupervisorPage = new ChooseSupervisorPage(page)
  await chooseSupervisorPage.expect.toBeOnThePage()

  const attendanceOutcomePage = await completeChooseSupervisor(page, chooseSupervisorPage, team)

  const logHoursPage = await completeAttendedCompliedOutcome(page, attendanceOutcomePage)
  await logHoursPage.enterStartAndEndTime(project.availability)
  await logHoursPage.continue()

  await completeCompliance(page)

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toBeOnThePage()

  await confirmPage.expect.toShowSelectedPeople(session.peopleOnProbation)
  await confirmPage.expect.toShowAnswers(team.supervisor, project.availability)
  await confirmPage.expect.toShowAttendanceAnswer('Attended - Complied')
  await confirmPage.expect.toShowComplianceAnswer()
  await confirmPage.selectAlertPractitioner()

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()

  await deliusLogin(page)

  /* eslint-disable no-plusplus, no-await-in-loop */
  for (let i = 0; i < session.peopleOnProbation.length; i++) {
    await page.getByRole('link', { name: 'UPW Project Diary' }).click()
    await page.waitForSelector('span.float-start:has-text("UPW Project Diary")')
    const person = session.peopleOnProbation[i]
    await checkAppointmentOnDelius(page, {
      teamProvider: team.provider,
      teamName: team.name,
      projectName: project.name,
      popCrn: person.crn,
      popName: person.getDisplayName(),
      startTime: project.availability.startTime,
      endTime: project.availability.endTime,
      outcome: 'Attended - Complied',
      hoursCredited: '4:00',
    })
  }
  /* eslint-enable no-plusplus, no-await-in-loop */
})
