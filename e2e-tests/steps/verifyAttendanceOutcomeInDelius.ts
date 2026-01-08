import { Page } from '@playwright/test'
import { login } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import { Team } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/test-data/test-data'
import DeliusPage from '../pages/deliusPage'
import { AttendanceOutcome } from '../contactOutcomes'
import PersonOnProbation from '../delius/personOnProbation'

export default async (
  page: Page,
  projectName: string,
  team: Team,
  person: PersonOnProbation,
  attendanceOutcome: AttendanceOutcome,
  creditedHours: string,
) => {
  await login(page)
  const deliusPage = new DeliusPage(page)
  await deliusPage.visitUpwProjectDiary()
  await deliusPage.searchForSession(team)
  await deliusPage.selectProject(projectName)
  await deliusPage.verifyAttendanceOutcome(person.crn, attendanceOutcome, creditedHours)
}
