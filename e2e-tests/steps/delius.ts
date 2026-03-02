import { login as deliusLogin } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import { checkAppointmentOnDelius as _checkAppointmentOnDelius } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/checkAppointmentDetails'
import { Page } from '@playwright/test'
import { Team } from '../fixtures/testOptions'
import PersonOnProbation from '../delius/personOnProbation'
import Project from '../delius/project'

export interface ContactOutcome {
  outcome: string
  notes?: string
  startTime?: string
  endTime?: string
}

export const checkAppointmentOnDelius = async ({
  page,
  team,
  person,
  project,
  contactOutcome,
}: {
  page: Page
  team: Team
  person: PersonOnProbation
  project: Project
  contactOutcome: ContactOutcome
}) => {
  await deliusLogin(page)
  await page.getByRole('link', { name: 'UPW Project Diary' }).click()
  await page.waitForSelector('span.float-start:has-text("UPW Project Diary")')
  await _checkAppointmentOnDelius(page, {
    teamProvider: team.provider,
    teamName: team.name,
    projectName: project.name,
    popCrn: person.crn,
    popName: person.getDisplayName(),
    startTime: contactOutcome.startTime ?? project.availability.startTime,
    endTime: contactOutcome.endTime ?? project.availability.endTime,
    outcome: contactOutcome.outcome,
  })
}
