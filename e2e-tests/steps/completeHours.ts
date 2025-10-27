import { Page } from '@playwright/test'
import LogHoursPage from '../pages/appointments/logHoursPage'
import LogCompliancePage from '../pages/appointments/logCompliancePage'

export default async (page: Page, logHoursPage: LogHoursPage) => {
  const logCompliancePage = new LogCompliancePage(page)
  await logHoursPage.enterHours()
  await logHoursPage.continue()
  await logCompliancePage.expect.toBeOnThePage()

  return logCompliancePage
}
