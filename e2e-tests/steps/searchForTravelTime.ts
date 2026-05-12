import { Page } from '@playwright/test'
import HomePage from '../pages/homePage'
import { Team } from '../fixtures/testOptions'
import SearchTravelTimePage from '../pages/travelTime/searchTravelTimePage'
import TravelTimePage from '../pages/travelTime/travelTimePage'
import PersonOnProbation from '../delius/personOnProbation'

export default async (page: Page, homePage: HomePage, team: Team, personOnProbation: PersonOnProbation) => {
  const searchTravelTimePage = new SearchTravelTimePage(page)

  await homePage.adjustTravelTimeLink.click()
  await searchTravelTimePage.expect.toBeOnThePage()

  await searchTravelTimePage.completeSearchForm(team)
  await searchTravelTimePage.submitForm()

  await searchTravelTimePage.clickUpdateAnAppointment(personOnProbation.crn)

  const travelTimePage = new TravelTimePage(page, personOnProbation)

  return travelTimePage
}
