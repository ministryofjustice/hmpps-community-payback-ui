import { Page } from '@playwright/test'
import DeliusUser from '../delius/deliusUser'
import PersonOnProbation from '../delius/personOnProbation'
import Project from '../delius/project'
import { Team } from '../fixtures/testOptions'
import ChooseAppointmentTypePage from '../pages/appointments/chooseAppointmentTypePage'
import ChooseProjectPage from '../pages/appointments/chooseProjectPage'
import ChooseRegionPage from '../pages/appointments/chooseRegionPage'
import ConfirmPage from '../pages/appointments/confirmPage'
import RecordActivityPage from '../pages/appointments/recordActivityPage'
import FindAPersonPage from '../pages/findAPersonPage'
import PersonAppointmentsPage from '../pages/people/personAppointmentsPage'
import completeCompliance from './completeCompliance'
import signIn from './signIn'

export default async (
  page: Page,
  {
    deliusUser,
    team,
    project,
    personOnProbation,
  }: { deliusUser: DeliusUser; team: Team; project: Project; personOnProbation: PersonOnProbation },
): Promise<ConfirmPage> => {
  const homePage = await signIn(page, deliusUser)

  await homePage.findAPersonLinkLocator.click()

  const findAPersonPage = new FindAPersonPage(page)
  await findAPersonPage.expect.toBeOnThePage()
  await findAPersonPage.search.enterSearchTerm(personOnProbation.crn)
  await findAPersonPage.search.submitForm()
  await findAPersonPage.people.clickPersonLink(personOnProbation.crn)

  const personAppointmentsPage = new PersonAppointmentsPage(page, personOnProbation.getFullName())
  await personAppointmentsPage.expect.toBeOnThePage()
  await personAppointmentsPage.clickAddAppointment()

  const appointmentTypePage = new ChooseAppointmentTypePage(page)
  await appointmentTypePage.expect.toBeOnThePage()
  await appointmentTypePage.chooseOtherEte()
  await appointmentTypePage.continue()

  const chooseRegionPage = new ChooseRegionPage(page)
  await chooseRegionPage.expect.toBeOnThePage()
  await chooseRegionPage.chooseRegion(team.provider)
  await chooseRegionPage.continue()

  const chooseProjectPage = new ChooseProjectPage(page)
  await chooseProjectPage.expect.toBeOnThePage()
  await chooseProjectPage.form.selectProject(team, project.name)
  await chooseProjectPage.continue()

  const recordActivityPage = new RecordActivityPage(page)
  await recordActivityPage.expect.toBeOnThePage()
  await recordActivityPage.datePickerComponent.openDatePicker()
  await recordActivityPage.datePickerComponent.selectTodaysDate()
  await recordActivityPage.enterStartAndEndTime({ startTime: '09:00', endTime: '10:00' })
  await recordActivityPage.chooseAttendedCompliedOutcome()
  await recordActivityPage.continue()

  await completeCompliance(page)

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toBeOnThePage()
  await confirmPage.selectAlertPractitioner()
  return confirmPage
}
