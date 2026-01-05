import { Page } from '@playwright/test'
import CheckProjectDetailsPage from '../pages/appointments/checkProjectDetailsPage'
import AttendanceOutcomePage from '../pages/appointments/attendanceOutcomePage'

export default async (page: Page, checkProjectDetailsPage: CheckProjectDetailsPage, supervisor: string) => {
  const attendanceOutcomePage = new AttendanceOutcomePage(page)
  await checkProjectDetailsPage.chooseSupervisor(supervisor)
  await checkProjectDetailsPage.continue()
  await attendanceOutcomePage.expect.toBeOnThePage()

  return attendanceOutcomePage
}
