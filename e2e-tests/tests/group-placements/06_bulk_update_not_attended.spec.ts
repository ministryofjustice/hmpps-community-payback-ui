import { expect } from '@playwright/test'
import { login as deliusLogin } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import { checkAppointmentOnDelius } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/checkAppointmentDetails'
import { slow } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/common/common'
import test from '../../fixtures/test'
import signIn from '../../steps/signIn'
import searchForASession from '../../steps/searchForASession'
import selectASession from '../../steps/selectASession'
import ConfirmPage from '../../pages/appointments/confirmPage'
import completeChooseSupervisor from '../../steps/completeChooseSupervisor'
import BulkUpdatePeoplePage from '../../pages/appointments/bulkUpdatePeoplePage'
import ChooseSupervisorPage from '../../pages/appointments/chooseSupervisorPage'

test('Bulk update a group session => not attended', async ({ page, deliusUser, team, project, groupSession }) => {
  slow()
  await page.goto('/sign-out')
  await expect(page.locator('h1')).toContainText('Sign in')

  const homePage = await signIn(page, deliusUser)
  const groupSessionPage = await searchForASession(page, homePage, team, groupSession.date)

  await groupSessionPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, groupSessionPage, project.name)

  await sessionPage.expect.toSeeAppointments()
  await sessionPage.clickBulkUpdate()

  const bulkUpdatePeoplePage = new BulkUpdatePeoplePage(page)
  await bulkUpdatePeoplePage.expect.toBeOnThePage()
  await bulkUpdatePeoplePage.selectPeople(groupSession.peopleOnProbation)

  await bulkUpdatePeoplePage.continue()

  const chooseSupervisorPage = new ChooseSupervisorPage(page)
  await chooseSupervisorPage.expect.toBeOnThePage()

  const attendanceOutcomePage = await completeChooseSupervisor(page, chooseSupervisorPage, team)
  await attendanceOutcomePage.chooseNotAttendedNotEnforcementOutcome()
  await attendanceOutcomePage.continue()

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toBeOnThePage()

  await confirmPage.expect.toShowSelectedPeople(groupSession.peopleOnProbation)
  await confirmPage.expect.toShowAnswers(team.supervisor, project.availability, false)
  await confirmPage.expect.toShowAttendanceAnswer('Rescheduled - Service Request')
  await confirmPage.selectAlertPractitioner()

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()

  await deliusLogin(page)

  /* eslint-disable no-plusplus, no-await-in-loop */
  for (let i = 0; i < groupSession.peopleOnProbation.length; i++) {
    await page.getByRole('link', { name: 'UPW Project Diary' }).click()
    await page.waitForSelector('span.float-start:has-text("UPW Project Diary")')
    const person = groupSession.peopleOnProbation[i]
    await checkAppointmentOnDelius(page, {
      teamProvider: team.provider,
      teamName: team.name,
      projectName: project.name,
      popCrn: person.crn,
      popName: person.getDisplayName(),
      startTime: project.availability.startTime,
      endTime: project.availability.endTime,
      outcome: 'Rescheduled - Service Request',
      hoursCredited: '',
    })
  }
  /* eslint-enable no-plusplus, no-await-in-loop */
})
