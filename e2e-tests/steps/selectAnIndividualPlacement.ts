import { Page } from '@playwright/test'
import FindIndividualPlacementsPage from '../pages/projects/findIndividualPlacementsPage'
import ProjectPage from '../pages/projects/projectPage'

export default async (page: Page, findIndividualPlacementsPage: FindIndividualPlacementsPage, projectName: string) => {
  const projectPage = new ProjectPage(page, projectName)
  await findIndividualPlacementsPage.clickOnProject(projectName)
  await projectPage.expect.toBeOnThePage()

  return projectPage
}
