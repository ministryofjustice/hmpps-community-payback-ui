import { Page } from '@playwright/test'
import CheckAppointmentDetailsPage from '../pages/appointments/checkAppointmentDetailsPage'
import AttendanceOutcomePage from '../pages/appointments/attendanceOutcomePage'

export default async (page: Page, checkAppointmentDetailsPage: CheckAppointmentDetailsPage, supervisor: string) => {
  const attendanceOutcomePage = new AttendanceOutcomePage(page)
  await checkAppointmentDetailsPage.chooseSupervisor(supervisor)
  await checkAppointmentDetailsPage.continue()
  await attendanceOutcomePage.expect.toBeOnThePage()

  return attendanceOutcomePage
}
