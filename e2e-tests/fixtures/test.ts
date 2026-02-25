import { test as base } from '@playwright/test'
import { TestOptions } from './testOptions'

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
  canCreateNewPops: true,
})
