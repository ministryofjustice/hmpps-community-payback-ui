import { Page } from '@playwright/test'
import TravelTimePage from '../pages/travelTime/travelTimePage'
import SearchTravelTimePage from '../pages/travelTime/searchTravelTimePage'

export default async (page: Page, travelTimePage: TravelTimePage, timeCredited: { time: 60 | 120 } = { time: 60 }) => {
  await travelTimePage.completeTravelTimeForm(timeCredited.time)

  await travelTimePage.submitCreditTravelTime()

  const searchTravelTimePage = new SearchTravelTimePage(page)

  return searchTravelTimePage
}
