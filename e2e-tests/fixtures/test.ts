import { test as base } from '@playwright/test'
import { TestOptions } from './testOptions'

export default base.extend<TestOptions>({
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
  existingPops: [[], { option: true }],
  testIds: process.env.PW_TESTS?.split(','),
})
