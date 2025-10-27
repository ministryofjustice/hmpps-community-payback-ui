import { Page } from '@playwright/test'
import LogCompliancePage from '../pages/appointments/logCompliancePage'

export default async (page: Page, logCompliancePage: LogCompliancePage) => {
  await logCompliancePage.enterComplianceDetails()
  await logCompliancePage.continue()
}
