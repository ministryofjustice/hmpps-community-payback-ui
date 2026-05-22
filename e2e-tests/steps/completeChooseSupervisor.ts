import { Page } from '@playwright/test'
import AttendanceOutcomePage from '../pages/appointments/attendanceOutcomePage'
import ChooseSupervisorPage from '../pages/appointments/chooseSupervisorPage'
import { Team } from '../fixtures/testOptions'

export default async (page: Page, chooseSupervisorPage: ChooseSupervisorPage, team: Team) => {
  await chooseSupervisorPage.chooseSupervisingTeam(team.name)
  await Promise.all([page.waitForURL(/team=/), chooseSupervisorPage.clickSelectTeam()])

  await chooseSupervisorPage.chooseSupervisor(team.supervisor)
  await chooseSupervisorPage.continue()

  const attendanceOutcomePage = new AttendanceOutcomePage(page)
  await attendanceOutcomePage.expect.toBeOnThePage()

  return attendanceOutcomePage
}
