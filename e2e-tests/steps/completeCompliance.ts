import { Page } from '@playwright/test'
import LogCompliancePage from '../pages/appointments/logCompliancePage'

export default async (page: Page) => {
  const logCompliancePage = new LogCompliancePage(page)

  await logCompliancePage.expect.toBeOnThePage()
  await logCompliancePage.enterComplianceDetails()
  await logCompliancePage.continue()
}
