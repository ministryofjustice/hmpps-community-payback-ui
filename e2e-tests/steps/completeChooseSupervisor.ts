import { Page } from '@playwright/test'
import AttendanceOutcomePage from '../pages/appointments/attendanceOutcomePage'
import ChooseSupervisorPage from '../pages/appointments/chooseSupervisorPage'

export default async (page: Page, chooseSupervisorPage: ChooseSupervisorPage, supervisor: string) => {
  const attendanceOutcomePage = new AttendanceOutcomePage(page)
  await chooseSupervisorPage.chooseSupervisor(supervisor)
  await chooseSupervisorPage.continue()
  await attendanceOutcomePage.expect.toBeOnThePage()

  return attendanceOutcomePage
}
