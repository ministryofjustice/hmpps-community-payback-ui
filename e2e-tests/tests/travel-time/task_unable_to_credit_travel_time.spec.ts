import test from '../../fixtures/test'
import searchForTravelTime from '../../steps/searchForTravelTime'
import SearchTravelTimePage from '../../pages/travelTime/searchTravelTimePage'
import HomePage from '../../pages/homePage'

test(
  'Unable to credit travel time from task',
  { tag: '@use-group-placement-type' },
  async ({ appointmentWithOutcome: { personOnProbation }, team, page }) => {
    const homePage = new HomePage(page)
    await homePage.visit()

    const travelTimePage = await searchForTravelTime(page, homePage, team, personOnProbation)
    await travelTimePage.submitNotEligibleForTravelTime()

    const searchTravelTimePage = new SearchTravelTimePage(page)

    await searchTravelTimePage.expect.toBeOnThePage()
    await searchTravelTimePage.expect.toSeeResults()
    await searchTravelTimePage.results.expect.notToHaveRowWithContent(personOnProbation.crn)
  },
)
