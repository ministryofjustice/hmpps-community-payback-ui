import { Page } from '@playwright/test'
import GroupSessionPage from '../pages/groupSessionPage'
import SessionPage from '../pages/sessionPage'

export default async (page: Page, groupSessionPage: GroupSessionPage, projectName: string) => {
  const sessionPage = new SessionPage(page, projectName)
  await groupSessionPage.clickOnProject(projectName)
  await sessionPage.expect.toBeOnThePage()

  return sessionPage
}
