import { Page } from '@playwright/test'
import AttendanceOutcomePage from '../pages/appointments/attendanceOutcomePage'
import LogHoursPage from '../pages/appointments/logHoursPage'

export default async (page: Page, attendanceOutcomePage: AttendanceOutcomePage) => {
  const logHoursPage = new LogHoursPage(page)

  await attendanceOutcomePage.chooseOutcome()
  await attendanceOutcomePage.continue()
  await logHoursPage.expect.toBeOnThePage()

  return logHoursPage
}
