import { Page } from '@playwright/test'
import TravelTimePage from '../pages/travelTime/travelTimePage'
import SearchTravelTimePage from '../pages/travelTime/searchTravelTimePage'

export default async (
  page: Page,
  travelTimePage: TravelTimePage,
  timeCredited: { hours: string; minutes: string } = { hours: '1', minutes: '10' },
) => {
  await travelTimePage.completeTravelTimeForm(timeCredited)

  await travelTimePage.submitCreditTravelTime()

  const searchTravelTimePage = new SearchTravelTimePage(page)

  return searchTravelTimePage
}
