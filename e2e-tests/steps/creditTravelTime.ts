import { Page } from '@playwright/test'
import TravelTimePage from '../pages/travelTime/travelTimePage'
import SearchTravelTimePage from '../pages/travelTime/searchTravelTimePage'

export default async (page: Page, travelTimePage: TravelTimePage) => {
  await travelTimePage.completeTravelTimeForm()

  await travelTimePage.submitCreditTravelTime()

  const searchTravelTimePage = new SearchTravelTimePage(page)

  return searchTravelTimePage
}
