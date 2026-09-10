import { login as deliusLogin } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import verifyAdjustment from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/verify-adjustment'
import test from '../../fixtures/test'
import creditTravelTime from '../../steps/creditTravelTime'
import TravelTimePage from '../../pages/travelTime/travelTimePage'
import visitAppointment from '../../steps/visitAppointment'

test(
  'Credit travel time from task',
  { tag: '@use-group-placement-type' },
  async ({ appointmentWithOutcome: { personOnProbation, date }, page }) => {
    const appointmentDetailsPage = await visitAppointment(page, date, personOnProbation)
    await appointmentDetailsPage.expect.toBeOnThePage()

    await appointmentDetailsPage.clickProcessTravelTime()

    await creditTravelTime(page, new TravelTimePage(page, personOnProbation), { time: 60 })
    await appointmentDetailsPage.expect.toBeOnThePage()
    await appointmentDetailsPage.expect.toSeeTravelTime('1 hour')

    await deliusLogin(page)
    await verifyAdjustment(page, {
      crn: personOnProbation.crn,
      hoursCredited: '-1:00',
      reason: 'Travel Time',
    })
  },
)
