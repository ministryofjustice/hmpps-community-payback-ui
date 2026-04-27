import { test as base, Page } from '@playwright/test'
import { allocateCurrentCaseToUpwProject } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/allocate-current-case-to-upw-project'
import createUpwAppointment from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/create-upw-appointment'
import { getCurrentDay } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/date-time'
import PersonOnProbation from '../delius/personOnProbation'
import { PlacementType, Team } from './testOptions'
import Project from '../delius/project'
import getProjectType from '../delius/projectType'

interface FixtureSetup {
  page: Page
  team: Team
  project: Project
  placementType: PlacementType
  personOnProbation: PersonOnProbation
  isLoggedInToDelius: boolean
}

export default async ({
  page,
  team,
  project,
  placementType,
  personOnProbation,
}: FixtureSetup): Promise<{ date: Date }> => {
  await page.locator('a', { hasText: 'Personal Details' }).click()

  if (placementType === 'ete') {
    await createUpwAppointment(page, {
      crn: personOnProbation.crn,
      eventNumber: 1,
      projectName: project.name,
      date: new Date(),
      providerName: team.provider,
      teamName: team.name,
      startTime: '0:00',
      endTime: '06:00',
      supervisorName: 'Unallocated',
      projectType: 'ETE - HMPPS Portal',
      allocation: `${getCurrentDay()}(00:00 - 23:59)`,
    })
  } else {
    await base.step(`Allocating ${personOnProbation.crn} to ${project.name}`, async () => {
      await allocateCurrentCaseToUpwProject(page, {
        crn: personOnProbation.crn,
        providerName: team.provider,
        teamName: team.name,
        projectName: project.name,
        ...getProjectType(placementType),
      })
    })
  }

  return { date: new Date() }
}
