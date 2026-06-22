import { Page } from '@playwright/test'
import AttendanceOutcomePage from '../pages/appointments/attendanceOutcomePage'
import LogHoursPage from '../pages/appointments/logHoursPage'

export const completeAttendedCompliedOutcome = async (
  page: Page,
  attendanceOutcomePage: AttendanceOutcomePage,
  checkIsSensitive: boolean = false,
) => {
  return step(
    page,
    attendanceOutcomePage,
    () => attendanceOutcomePage.chooseAttendedCompliedOutcome(),
    checkIsSensitive,
  )
}

export const completeAttendedEnforceableOutcome = async (
  page: Page,
  attendanceOutcomePage: AttendanceOutcomePage,
  checkIsSensitive: boolean = false,
) => {
  return step(
    page,
    attendanceOutcomePage,
    () => attendanceOutcomePage.chooseAttendedEnforceableOutcome(),
    checkIsSensitive,
  )
}

export const completeNotAttendedOutcome = async (
  page: Page,
  attendanceOutcomePage: AttendanceOutcomePage,
  checkIsSensitive: boolean = false,
) =>
  step(
    page,
    attendanceOutcomePage,
    () => attendanceOutcomePage.chooseNotAttendedNotEnforcementOutcome(),
    checkIsSensitive,
  )

const step = async (
  page: Page,
  attendanceOutcomePage: AttendanceOutcomePage,
  chooseOutcome: () => Promise<void>,
  checkIsSensitive: boolean,
) => {
  const logHoursPage = new LogHoursPage(page)

  await chooseOutcome()

  if (checkIsSensitive) {
    await attendanceOutcomePage.isSensitiveOptionLocator.check()
  }

  await attendanceOutcomePage.continue()
  await logHoursPage.expect.toBeOnThePage()

  return logHoursPage
}
