import { Page } from '@playwright/test'
import CheckProjectDetailsPage from '../pages/appointments/checkProjectDetailsPage'
import AttendanceOutcomePage from '../pages/appointments/attendanceOutcomePage'

export default async (page: Page, checkProjectDetailsPage: CheckProjectDetailsPage) => {
  const attendanceOutcomePage = new AttendanceOutcomePage(page)
  await checkProjectDetailsPage.chooseSupervisor()
  await checkProjectDetailsPage.continue()
  await attendanceOutcomePage.expect.toBeOnThePage()

  return attendanceOutcomePage
}
