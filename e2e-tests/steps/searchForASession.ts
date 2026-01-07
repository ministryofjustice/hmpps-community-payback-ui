import { Page } from '@playwright/test'
import TrackProgressPage from '../pages/trackProgressPage'
import HomePage from '../pages/homePage'
import { Team } from '../fixtures/testOptions'

export default async (page: Page, homePage: HomePage, team: Team) => {
  const trackProgressPage = new TrackProgressPage(page)

  await homePage.trackCommunityPaybackProgressLink.click()
  await trackProgressPage.expect.toBeOnThePage()

  await trackProgressPage.completeSearchForm(new Date(), new Date(), team)
  await trackProgressPage.submitForm()
  return trackProgressPage
}
