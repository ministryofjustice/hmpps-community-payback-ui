import { slow } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/common/common'
import { deliusPerson } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person'
import { login } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender'
import { createCommunityEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/event/create-event'
import { createRequirementForEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/requirement/create-requirement'
import { createUpwProject } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/create-upw-project'
import { allocateCurrentCaseToUpwProject } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/allocate-current-case-to-upw-project'
import { test, Page } from '@playwright/test'
import { Team } from './testOptions'
import DateTimeUtils from '../utils/DateTimeUtils'
import { DeliusTestData } from '../delius/deliusTestData'
import PersonOnProbation from '../delius/personOnProbation'

type TestContext = typeof test

export default async function setupDeliusForGroupPlacements({
  page,
  numberOfPopsToCreateAndAllocate,
  team,
  testContext,
}: {
  page: Page
  numberOfPopsToCreateAndAllocate: number
  team: Team
  testContext: TestContext
}) {
  slow() // Sets the maximum running time of this test, 7 minutes by default.
  await login(page)

  const project = await testContext.step('Create UPW group placement project', async () => {
    const startDate = new Date()
    // allow incomplete appointments to be rescheduled a week later
    const endDate = DateTimeUtils.plusDays(startDate, 8)

    return createUpwProject(page, {
      providerName: team.provider,
      teamName: team.name,
      endDate,
      projectAvailability: {
        startDate,
        endDate,
      },
    })
  })

  const deliusTestData: DeliusTestData = {
    project: {
      name: project.projectName,
      code: project.projectCode,
      availability: {
        startTime: project.projectAvailability.startTime,
        endTime: project.projectAvailability.endTime,
      },
    },
    pops: [],
  }

  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < numberOfPopsToCreateAndAllocate; i += 1) {
    await testContext.step(`Create and allocate person ${i + 1} of ${numberOfPopsToCreateAndAllocate}`, async () => {
      console.log('----- Creating and allocating person %d out of %d -----', i + 1, numberOfPopsToCreateAndAllocate) // eslint-disable-line  no-console
      const personOnProbation = await createAndAllocatePerson(page, deliusTestData, team, testContext)
      deliusTestData.pops.push(personOnProbation)
    })
  }
  /* eslint-enable no-await-in-loop */
  return deliusTestData
}

async function createAndAllocatePerson(
  page: Page,
  deliusTestData: DeliusTestData,
  team: Team,
  testContext: TestContext,
): Promise<PersonOnProbation> {
  const person = deliusPerson()
  const crn: string = await testContext.step('Create offender', async () => {
    return createOffender(page, {
      person,
      providerName: team.provider,
    })
  })

  const pop = new PersonOnProbation(person.firstName, person.lastName, crn)

  await testContext.step('Create community event', async () => {
    await createCommunityEvent(page, { crn: pop.crn, allocation: { team } })
  })

  await testContext.step('Create requirement for event', async () => {
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

  await testContext.step('Allocate person to project', async () => {
    await allocateCurrentCaseToUpwProject(page, {
      providerName: team.provider,
      teamName: team.name,
      projectName: deliusTestData.project.name,
    })
  })

  return pop
}
