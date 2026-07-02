import { Page } from '@playwright/test'
import ChooseSupervisorPage from '../pages/appointments/chooseSupervisorPage'
import { Team } from '../fixtures/testOptions'
import ChooseProjectPage from '../pages/appointments/chooseProjectPage'

export default async (page: Page, chooseSupervisorPage: ChooseSupervisorPage, team: Team) => {
  await chooseSupervisorPage.chooseSupervisingTeam(team.name)
  await Promise.all([page.waitForURL(/team=/), chooseSupervisorPage.clickSelectTeam()])

  await chooseSupervisorPage.chooseSupervisor(team.supervisor)
  await chooseSupervisorPage.continue()

  const chooseProjectPage = new ChooseProjectPage(page)
  chooseProjectPage.expect.toBeOnThePage()
  return chooseProjectPage
}
