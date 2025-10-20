import { Page } from '@playwright/test'
import LogHoursPage from '../pages/appointments/logHoursPage'

export default async (page: Page, logHoursPage: LogHoursPage) => {
  await logHoursPage.enterHours()
  await logHoursPage.continue()
}
