import { Page } from '@playwright/test'
import EnforcementPage from '../pages/appointments/enforcementPage'
import ConfirmPage from '../pages/appointments/confirmPage'

export default async (
  page: Page,
  enforcementPage: EnforcementPage,
): Promise<{ confirmPage: ConfirmPage; selectedAction: string }> => {
  const confirmPage = new ConfirmPage(page)
  const selectedAction = await enforcementPage.chooseAction()
  await enforcementPage.continue()

  await confirmPage.expect.toBeOnThePage()
  await confirmPage.expect.toShowSelectedEnforcementAction(selectedAction)
  return { confirmPage, selectedAction }
}
