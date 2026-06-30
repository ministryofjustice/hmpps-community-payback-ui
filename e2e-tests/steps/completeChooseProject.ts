import { Page } from '@playwright/test'
import AttendanceOutcomePage from '../pages/appointments/attendanceOutcomePage'
import ChooseProjectPage from '../pages/appointments/chooseProjectPage'

export default async (page: Page, chooseProjectPage: ChooseProjectPage) => {
  await chooseProjectPage.continue()

  const attendanceOutcomePage = new AttendanceOutcomePage(page)
  await attendanceOutcomePage.expect.toBeOnThePage()

  return attendanceOutcomePage
}
