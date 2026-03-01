import { test as base } from '@playwright/test'
import { deliusPerson } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender'
import { createUpwProject } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/create-upw-project'
import { createRequirementForEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/requirement/create-requirement'
import { allocateCurrentCaseToUpwProject } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/allocate-current-case-to-upw-project'
import DateTimeUtils from '../utils/DateTimeUtils'
import PersonOnProbation from '../delius/personOnProbation'
import { TestOptions } from './testOptions'
import { Project } from '../delius/project'

interface ProjectCache {
  group?: Project
  individual?: Project
}

/*
 * Create a cache for storing the retrieved project from Delius
 */
const projectCache: ProjectCache = {}

export default base.extend<TestOptions>({
  eteExternalApiClient: [
    {
      enabled: (process.env.ETE_EXTERNAL_API_ENABLED as string).toUpperCase() === 'TRUE',
      apiKey: process.env.ETE_EXTERNAL_API_API_KEY as string,
      certBase64: process.env.ETE_EXTERNAL_API_CERT_B64 as string,
      privateKeyBase64: process.env.ETE_EXTERNAL_API_PRIVATE_KEY_B64 as string,
      url: process.env.ETE_EXTERNAL_API_URL as string,
    },
    { option: true },
  ],
  deliusUser: [
    {
      username: process.env.DELIUS_USERNAME as string,
      password: process.env.DELIUS_PASSWORD as string,
    },
    { option: true },
  ],
  team: [
    {
      provider: 'East of England',
      name: 'CPB Automated Test Team',
      supervisor: 'CPBTest Supervisor [PS1 - PS - Other]',
    },
    { option: true },
  ],
  testCount: Number(process.env.PW_TOTAL_TESTS),
  personOnProbation: [
    async ({ page, team, project }, use, testInfo) => {
      // Set timeout to 3 minutes
      testInfo.setTimeout(3 * 60 * 1000)

      const person = deliusPerson()
      const crn: string = await createOffender(page, {
        person,
        providerName: team.provider,
      })

      const pop = new PersonOnProbation(person.firstName, person.lastName, crn)

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

      await page.locator('a', { hasText: 'Personal Details' }).click()

      await allocateCurrentCaseToUpwProject(page, {
        providerName: team.provider,
        teamName: team.name,
        projectName: project.name,
      })

      use(pop)
    },
    { scope: 'test' },
  ],
  project: [
    async ({ page, team, placementType }, use) => {
      const startDate = new Date()
      // allow incomplete appointments to be rescheduled a week later
      const endDate = DateTimeUtils.plusDays(startDate, 8)

      if (projectCache[placementType]) {
        /*
         * If a project has been created for this run of tests
         * return the test from memory
         *
         * This works by delcaring a variable in the outer scope
         * As module variables are cached per process in node
         * our playwright tests will have access to the same value
         * saved from the previous test
         */

        await use(projectCache[placementType])
      } else {
        const project = await createUpwProject(page, {
          providerName: team.provider,
          teamName: team.name,
          endDate,
          projectAvailability: {
            startDate,
            endDate,
          },
          ...(placementType === 'group'
            ? {}
            : { projectType: 'Individual Placement - ICP (Individual Community Placement)' }),
        })

        projectCache[placementType] = {
          name: project.projectName,
          code: project.projectCode,
          availability: {
            startTime: project.projectAvailability.startTime,
            endTime: project.projectAvailability.endTime,
          },
        }

        await use(projectCache[placementType])
      }
    },
    { scope: 'test' },
  ],
  placementType: [
    async ({}, use, testInfo) => {
      const type: TestOptions['placementType'] = testInfo.file.includes('group-placements') ? 'group' : 'individual'

      use(type)
    },
    { scope: 'test' },
  ],
})
