import { Page } from '@playwright/test'
import EnforcementPage from '../pages/appointments/enforcementPage'
import ConfirmPage from '../pages/appointments/confirmPage'

export default async (page: Page, enforcementPage: EnforcementPage): Promise<ConfirmPage> => {
  const confirmPage = new ConfirmPage(page)
  await enforcementPage.continue()

  await confirmPage.expect.toBeOnThePage()
  return confirmPage
}
