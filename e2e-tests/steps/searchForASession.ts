import { Page } from '@playwright/test'
import TrackProgressPage from '../pages/trackProgressPage'
import HomePage from '../pages/homePage'
import { Team } from '../fixtures/testOptions'

export default async (
  page: Page,
  homePage: HomePage,
  team: Team,
  startDate: Date = new Date(),
  endDate: Date = new Date(),
) => {
  const trackProgressPage = new TrackProgressPage(page)

  await homePage.trackCommunityPaybackProgressLink.click()
  await trackProgressPage.expect.toBeOnThePage()

  await trackProgressPage.completeSearchForm(startDate, endDate, team)
  await trackProgressPage.submitForm()
  return trackProgressPage
}
