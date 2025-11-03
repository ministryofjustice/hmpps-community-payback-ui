import { Page } from '@playwright/test'
import AttendanceOutcomePage from '../pages/appointments/attendanceOutcomePage'
import LogHoursPage from '../pages/appointments/logHoursPage'

export const completeAttendedCompliedOutcome = async (page: Page, attendanceOutcomePage: AttendanceOutcomePage) => {
  return step(page, attendanceOutcomePage, () => attendanceOutcomePage.chooseAttendedCompliedOutcome())
}

export const completeAttendedEnforceableOutcome = async (page: Page, attendanceOutcomePage: AttendanceOutcomePage) => {
  return step(page, attendanceOutcomePage, () => attendanceOutcomePage.chooseAttendedEnforceableOutcome())
}

export const completeNotAttendedEnforceableOutcome = async (
  page: Page,
  attendanceOutcomePage: AttendanceOutcomePage,
) => {
  return step(page, attendanceOutcomePage, () => attendanceOutcomePage.chooseEnforcementOutcome())
}

const step = async (page: Page, attendanceOutcomePage: AttendanceOutcomePage, chooseOutcome: () => Promise<void>) => {
  const logHoursPage = new LogHoursPage(page)

  await chooseOutcome()

  await attendanceOutcomePage.continue()
  await logHoursPage.expect.toBeOnThePage()

  return logHoursPage
}
