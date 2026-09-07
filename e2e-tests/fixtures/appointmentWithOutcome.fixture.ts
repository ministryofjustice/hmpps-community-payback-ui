import { Page, expect } from '@playwright/test'
import PersonOnProbation from '../delius/personOnProbation'
import { Team, PlacementType } from './testOptions'
import DeliusUser from '../delius/deliusUser'
import signIn from '../steps/signIn'
import searchForASession from '../steps/searchForASession'
import selectASession from '../steps/selectASession'
import viewAppointmentFromList from '../steps/viewAppointmentFromList'
import completeCheckAppointmentDetails from '../steps/completeCheckAppointmentDetails'
import completeChooseSupervisor from '../steps/completeChooseSupervisor'
import completeChooseProject from '../steps/completeChooseProject'
import { completeAttendedCompliedOutcome } from '../steps/completeAttendanceOutcome'
import completeCompliance from '../steps/completeCompliance'
import ConfirmPage from '../pages/appointments/confirmPage'
import DateTimeFormats from '../../server/utils/dateTimeUtils'
import Project from '../delius/project'
import Appointment from '../delius/appointment'

interface FixtureSetup {
  page: Page
  team: Team
  deliusUser: DeliusUser
  project: Project
  placementType: PlacementType
  personOnProbation: PersonOnProbation
  isLoggedInToDelius: boolean
  appointment: Appointment
}

export default async ({ page, deliusUser, team, project, personOnProbation, appointment }: FixtureSetup) => {
  await page.goto('/sign-out')
  await expect(page.locator('h1')).toContainText('Sign in')

  const homePage = await signIn(page, deliusUser)
  const groupSessionPage = await searchForASession(page, homePage, team, appointment.date)

  await groupSessionPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, groupSessionPage, project.name)

  await sessionPage.expect.toSeeAppointments()

  const checkAppointmentDetailsPage = await viewAppointmentFromList(page, sessionPage, personOnProbation.crn)
  const chooseSupervisorPage = await completeCheckAppointmentDetails(page, checkAppointmentDetailsPage)
  const chooseProjectPage = await completeChooseSupervisor(page, chooseSupervisorPage, team)
  const attendanceOutcomePage = await completeChooseProject(page, chooseProjectPage)
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

  await confirmPage.selectAlertPractitioner()
  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()

  return {
    project,
    date: appointment.date,
    personOnProbation,
  }
}
