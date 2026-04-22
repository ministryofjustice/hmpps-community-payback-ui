import { test as base, Page } from '@playwright/test'
import { allocateCurrentCaseToUpwProject } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/allocate-current-case-to-upw-project'
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
}

export default async ({
  page,
  team,
  project,
  placementType,
  personOnProbation,
}: FixtureSetup): Promise<{ date: Date }> => {
  await page.locator('a', { hasText: 'Personal Details' }).click()

  await base.step(`Allocating ${personOnProbation.crn} to ${project.name}`, async () => {
    await allocateCurrentCaseToUpwProject(page, {
      crn: personOnProbation.crn,
      providerName: team.provider,
      teamName: team.name,
      projectName: project.name,
      ...getProjectType(placementType),
    })
  })

  return { date: new Date() }
}
