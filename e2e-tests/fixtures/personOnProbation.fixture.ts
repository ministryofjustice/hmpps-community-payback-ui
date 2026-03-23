import { test as base, Page, TestInfo } from '@playwright/test'
import { deliusPerson } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender'
import { createRequirementForEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/requirement/create-requirement'
import { allocateCurrentCaseToUpwProject } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/allocate-current-case-to-upw-project'
import { createCommunityEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/event/create-event'
import PersonOnProbation from '../delius/personOnProbation'
import { PlacementType, Team } from './testOptions'
import Project from '../delius/project'

interface PersonOnProbationFixtureSetup {
  page: Page
  team: Team
  project: Project
  placementType: PlacementType
  testInfo: TestInfo
}

export default async ({
  page,
  testInfo,
  team,
  project,
  placementType,
}: PersonOnProbationFixtureSetup): Promise<PersonOnProbation> => {
  // Set timeout to 3 minutes
  testInfo.setTimeout(3 * 60 * 1000)

  const pop = await base.step('Creating person on probation', async () => {
    const person = deliusPerson()
    const crn: string = await createOffender(page, {
      person,
      providerName: team.provider,
    })

    return new PersonOnProbation(person.firstName, person.lastName, crn)
  })

  await base.step('Creating community event', async () => {
    await createCommunityEvent(page, { crn: pop.crn, allocation: { team } })
  })

  await base.step(`Creating requirement for POP: ${pop.crn}`, async () => {
    await createRequirementForEvent(page, {
      crn: pop.crn,
      requirement: {
        category: 'Unpaid Work',
        subCategory: 'Regular',
        // this matches the default length of a single appointment such that scheduling
        // will be triggered if that appointment is not fully completed
        length: '4',
      },
      team,
    })
  })

  await page.locator('a', { hasText: 'Personal Details' }).click()

  await base.step(`Allocating ${pop.crn} to ${project.name}`, async () => {
    await allocateCurrentCaseToUpwProject(page, {
      crn: pop.crn,
      providerName: team.provider,
      teamName: team.name,
      projectName: project.name,
      ...(placementType === 'group'
        ? {}
        : { projectType: 'Individual Placement - ICP (Individual Community Placement)' }),
    })
  })

  return pop
}
