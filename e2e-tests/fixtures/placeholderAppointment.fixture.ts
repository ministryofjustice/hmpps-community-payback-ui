import { test as base, Page, TestInfo } from '@playwright/test'
import { allocateCurrentCaseToUpwProject } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/allocate-current-case-to-upw-project'
import { deliusPerson } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender'
import { createRequirementForEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/requirement/create-requirement'
import { createCommunityEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/event/create-event'
import { PlacementType, Team } from './testOptions'
import PersonOnProbation from '../delius/personOnProbation'
import Project from '../delius/project'
import getProjectType from '../delius/projectType'
import Appointment from '../delius/appointment'

interface FixtureSetup {
  page: Page
  team: Team
  project: Project
  placementType: PlacementType
  testInfo: TestInfo
  isLoggedInToDelius: boolean
}

export default async ({ page, team, project, placementType, testInfo }: FixtureSetup): Promise<Appointment> => {
  // Set timeout to 3 minutes
  testInfo.setTimeout(3 * 60 * 1000)

  const pop = await base.step(`Creating person on probation to allocate to ${project}`, async () => {
    const person = deliusPerson()
    const crn: string = await createOffender(page, {
      person,
      providerName: team.provider,
    })

    return new PersonOnProbation(person.firstName, person.lastName, crn, person.dob)
  })

  const { crn } = pop

  await base.step('Creating community event', async () => {
    await createCommunityEvent(page, { crn, allocation: { team } })
  })

  await base.step(`Creating requirement for POP: ${crn}`, async () => {
    await createRequirementForEvent(page, {
      crn,
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

  await base.step(`Allocating ${crn} to ${project.name}`, async () => {
    await allocateCurrentCaseToUpwProject(page, {
      crn,
      providerName: team.provider,
      teamName: team.name,
      projectName: project.name,
      ...getProjectType(placementType),
      frequency: 'Weekly',
    })
  })

  return { date: new Date() }
}
