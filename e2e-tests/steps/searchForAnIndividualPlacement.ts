import { Page } from '@playwright/test'
import HomePage from '../pages/homePage'
import { Team } from '../fixtures/testOptions'
import FindIndividualPlacementsPage from '../pages/projects/findIndividualPlacementsPage'

export default async (page: Page, homePage: HomePage, team: Team) => {
  const findIndividualPlacementsPage = new FindIndividualPlacementsPage(page)

  await homePage.trackIndividualPlacementsLink.click()
  await findIndividualPlacementsPage.expect.toBeOnThePage()

  await findIndividualPlacementsPage.teamFilter.selectRegion(team)
  await findIndividualPlacementsPage.teamFilter.selectTeam(team)
  await findIndividualPlacementsPage.teamFilter.submitForm()
  return findIndividualPlacementsPage
}
