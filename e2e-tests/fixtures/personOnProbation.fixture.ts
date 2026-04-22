import { test as base, Page, TestInfo } from '@playwright/test'
import { deliusPerson } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender'
import { createRequirementForEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/requirement/create-requirement'
import { createCommunityEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/event/create-event'
import PersonOnProbation from '../delius/personOnProbation'
import { Team } from './testOptions'

interface PersonOnProbationFixtureSetup {
  page: Page
  team: Team
  testInfo: TestInfo
  isLoggedInToDelius: boolean
}

export default async ({ page, testInfo, team }: PersonOnProbationFixtureSetup): Promise<PersonOnProbation> => {
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

  return pop
}
