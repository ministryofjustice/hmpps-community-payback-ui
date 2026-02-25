import { Page } from '@playwright/test'
import GroupSessionPage from '../pages/groupSessionPage'
import HomePage from '../pages/homePage'
import { Team } from '../fixtures/testOptions'

export default async (
  page: Page,
  homePage: HomePage,
  team: Team,
  startDate: Date = new Date(),
  endDate: Date = new Date(),
) => {
  const groupSessionPage = new GroupSessionPage(page)

  await homePage.trackCommunityPaybackProgressLink.click()
  await groupSessionPage.expect.toBeOnThePage()

  await groupSessionPage.teamFilter.selectRegion(team)
  await groupSessionPage.teamFilter.selectTeam(team)
  await groupSessionPage.completeSearchForm(startDate, endDate)
  await groupSessionPage.submitForm()
  return groupSessionPage
}
