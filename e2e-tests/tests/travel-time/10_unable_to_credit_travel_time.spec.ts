import { expect } from '@playwright/test'
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
import completeChooseSupervisor from '../../steps/completeChooseSupervisor'
import SearchTravelTimePage from '../../pages/travelTime/searchTravelTimePage'

test(
  'Unable to credit travel time',
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
    const attendanceOutcomePage = await completeChooseSupervisor(page, chooseSupervisorPage, team.supervisor)

    const logHoursPage = await completeAttendedCompliedOutcome(page, attendanceOutcomePage)
    await logHoursPage.continue()

    await completeCompliance(page)

    const confirmPage = new ConfirmPage(page)
    await confirmPage.expect.toBeOnThePage()

    await confirmPage.confirmButtonLocator.click()

    await sessionPage.expect.toBeOnThePage()

    await homePage.visit()

    const travelTimePage = await searchForTravelTime(page, homePage, team, personOnProbation)
    await travelTimePage.submitNotEligibleForTravelTime()

    const searchTravelTimePage = new SearchTravelTimePage(page)

    await searchTravelTimePage.expect.toBeOnThePage()
    await searchTravelTimePage.expect.toSeeResults()
    await searchTravelTimePage.results.expect.notToHaveRowWithContent(personOnProbation.crn)
  },
)
