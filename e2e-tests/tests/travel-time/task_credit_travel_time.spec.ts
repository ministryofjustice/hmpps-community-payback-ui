import { login as deliusLogin } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import verifyAdjustment from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/verify-adjustment'
import test from '../../fixtures/test'
import searchForTravelTime from '../../steps/searchForTravelTime'
import creditTravelTime from '../../steps/creditTravelTime'
import HomePage from '../../pages/homePage'

test(
  'Credit travel time from task',
  { tag: '@use-group-placement-type' },
  async ({ appointmentWithOutcome: { personOnProbation }, team, page }) => {
    const homePage = new HomePage(page)
    await homePage.visit()

    const travelTimePage = await searchForTravelTime(page, homePage, team, personOnProbation)

    const timeCredited = { hours: '1', minutes: '0' }
    const searchTravelTimePage = await creditTravelTime(page, travelTimePage, { time: 60 })

    await searchTravelTimePage.expect.toBeOnThePage()

    await searchTravelTimePage.clickSortByDateAscending()

    await searchTravelTimePage.expect.toSeeResults()

    await searchTravelTimePage.results.expect.notToHaveTodaysRowWithContent(personOnProbation.crn)

    await deliusLogin(page)
    await verifyAdjustment(page, {
      crn: personOnProbation.crn,
      hoursCredited: `-${timeCredited.hours}:${timeCredited.minutes}`,
      reason: 'Travel Time',
    })
  },
)
