import test from '../../fixtures/test'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { completeAttendedCompliedOutcome } from '../../steps/completeAttendanceOutcome'
import completeChooseSupervisor from '../../steps/completeChooseSupervisor'
import completeCompliance from '../../steps/completeCompliance'
import { checkAppointmentOnDelius } from '../../steps/delius'
import searchForAnIndividualPlacement from '../../steps/searchForAnIndividualPlacement'
import selectAnIndividualPlacement from '../../steps/selectAnIndividualPlacement'
import signIn from '../../steps/signIn'
import completeChooseProject from '../../steps/completeChooseProject'
import FindAPersonPage from '../../pages/findAPersonPage'
import DatePage from '../../pages/appointments/datePage'
import ChooseSupervisorPage from '../../pages/appointments/chooseSupervisorPage'

test('Create an appointment for individual placement session', async ({
  page,
  deliusUser,
  team,
  project,
  personOnProbation,
}) => {
  const homePage = await signIn(page, deliusUser)

  const findIndividualPlacementsPage = await searchForAnIndividualPlacement(page, homePage, team)

  await findIndividualPlacementsPage.expect.toSeeResults()

  const projectPage = await selectAnIndividualPlacement(page, findIndividualPlacementsPage, project.name)

  await projectPage.expect.toBeOnThePage()
  await projectPage.clickAddAppointment()

  const findAPersonPage = new FindAPersonPage(page)
  await findAPersonPage.search.enterSearchTerm(personOnProbation.crn)
  await findAPersonPage.search.submitForm()
  await findAPersonPage.people.clickPersonLink(personOnProbation.crn)

  const datePage = new DatePage(page)
  await datePage.datePickerComponent.openDatePicker()
  await datePage.datePickerComponent.selectTodaysDate()
  await datePage.continue()

  const chooseSupervisorPage = new ChooseSupervisorPage(page)

  const chooseProjectPage = await completeChooseSupervisor(page, chooseSupervisorPage, team)
  const attendanceOutcomePage = await completeChooseProject(page, chooseProjectPage)

  const logHoursPage = await completeAttendedCompliedOutcome(page, attendanceOutcomePage)
  await logHoursPage.continue()

  await completeCompliance(page)

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toBeOnThePage()

  await confirmPage.expect.toShowAnswers(team.supervisor, project.availability)
  await confirmPage.expect.toShowOutcome('Attended \u2013 complied')
  await confirmPage.expect.toShowComplianceAnswer()

  await confirmPage.selectAlertPractitioner()

  await confirmPage.confirmButtonLocator.click()

  await projectPage.expect.toBeOnThePage()

  await checkAppointmentOnDelius({
    page,
    team,
    person: personOnProbation,
    project,
    contactOutcome: { outcome: 'Attended - Complied' },
    hoursCredited: '4:00',
    outStanding: '0:00',
  })
})
