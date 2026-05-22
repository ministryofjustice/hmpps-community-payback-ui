import { expect } from '@playwright/test'
import { login as deliusLogin } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import verifyAdjustment from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/verify-adjustment'
import test from '../../fixtures/test'
import signIn from '../../steps/signIn'
import searchForASession from '../../steps/searchForASession'
import selectASession from '../../steps/selectASession'
import clickUpdateAnAppointment from '../../steps/clickUpdateAnAppointment'
import completeCheckAppointmentDetails from '../../steps/completeCheckAppointmentDetails'
import completeCompliance from '../../steps/completeCompliance'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { completeAttendedCompliedOutcome } from '../../steps/completeAttendanceOutcome'
import searchForTravelTime from '../../steps/searchForTravelTime'
import creditTravelTime from '../../steps/creditTravelTime'
import completeChooseSupervisor from '../../steps/completeChooseSupervisor'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'

test(
  'Credit travel time',
  { tag: '@use-group-placement-type' },
  async ({ page, deliusUser, team, project, personOnProbation, appointment }) => {
    await page.goto('/sign-out')
    await expect(page.locator('h1')).toContainText('Sign in')

    const homePage = await signIn(page, deliusUser)
    const groupSessionPage = await searchForASession(page, homePage, team, appointment.date)

    await groupSessionPage.expect.toSeeResults()

    const sessionPage = await selectASession(page, groupSessionPage, project.name)

    await sessionPage.expect.toSeeAppointments()

    const checkAppointmentDetailsPage = await clickUpdateAnAppointment(page, sessionPage, personOnProbation.crn)
    const chooseSupervisorPage = await completeCheckAppointmentDetails(page, checkAppointmentDetailsPage)
    const attendanceOutcomePage = await completeChooseSupervisor(page, chooseSupervisorPage, team)

    const logHoursPage = await completeAttendedCompliedOutcome(page, attendanceOutcomePage)

    // 4 hours of unpaid work will be required, only credit for 2 hours
    const startTime = appointment.date.toTimeString().split(' ')[0] // appointment start time should be current time so use date from appointment fixture
    const endTime = DateTimeFormats.addHours(DateTimeFormats.stripTime(startTime), 2)
    await logHoursPage.endTimeFieldLocator.clear()
    await logHoursPage.endTimeFieldLocator.fill(endTime)
    await logHoursPage.continue()

    await completeCompliance(page)

    const confirmPage = new ConfirmPage(page)
    await confirmPage.expect.toBeOnThePage()

    await confirmPage.confirmButtonLocator.click()

    await sessionPage.expect.toBeOnThePage()

    await homePage.visit()

    const travelTimePage = await searchForTravelTime(page, homePage, team, personOnProbation)

    const timeCredited = { hours: '1', minutes: '10' }
    const searchTravelTimePage = await creditTravelTime(page, travelTimePage, timeCredited)

    await searchTravelTimePage.expect.toBeOnThePage()
    await searchTravelTimePage.expect.toSeeResults()
    await searchTravelTimePage.results.expect.notToHaveRowWithContent(personOnProbation.crn)

    await deliusLogin(page)
    await verifyAdjustment(page, {
      crn: personOnProbation.crn,
      hoursCredited: `-${timeCredited.hours}:${timeCredited.minutes}`,
      reason: 'Travel Time',
    })
  },
)
