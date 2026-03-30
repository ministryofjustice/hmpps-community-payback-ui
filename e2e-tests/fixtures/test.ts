import { test as base, TestInfo } from '@playwright/test'
import { TestOptions } from './testOptions'
import setupPersonOnProbationFixture from './personOnProbation.fixture'
import setupProjectFixture from './project.fixture'

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
  personOnProbation: [
    async ({ page, team, project, placementType }, use, testInfo) => {
      const personOnProbation = await setupPersonOnProbationFixture({ page, testInfo, team, project, placementType })

      use(personOnProbation)
    },
    { scope: 'test' },
  ],
  project: [
    async ({ page, team, placementType }, use) => {
      const project = await setupProjectFixture({ page, team, placementType })

      use(project)
    },
    { scope: 'test' },
  ],
  placementType: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, testInfo) => {
      const type = getPlacementType(testInfo)

      use(type)
    },
    { scope: 'test' },
  ],
})

function getPlacementType(testInfo: TestInfo): TestOptions['placementType'] {
  if (testInfo.file.includes('group-placements')) {
    return 'group'
  }

  if (testInfo.file.includes('ete')) {
    return 'ete'
  }

  return 'individual'
}
