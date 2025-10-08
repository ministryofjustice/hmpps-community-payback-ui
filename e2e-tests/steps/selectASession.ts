import { Page } from '@playwright/test'
import TrackProgressPage from '../pages/trackProgressPage'
import SessionPage from '../pages/sessionPage'

export default async (page: Page, trackProgressPage: TrackProgressPage) => {
  const projectName = await trackProgressPage.firstProjectName()
  const sessionPage = new SessionPage(page, projectName)
  await trackProgressPage.clickOnProject(projectName)
  await sessionPage.expect.toBeOnThePage()

  return sessionPage
}
