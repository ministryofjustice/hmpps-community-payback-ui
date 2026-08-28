import test from '../../fixtures/test'
import ConfirmPage from '../../pages/appointments/confirmPage'
import ChooseRegionPage from '../../pages/appointments/chooseRegionPage'
import { completeAttendedCompliedOutcome } from '../../steps/completeAttendanceOutcome'
import completeChooseSupervisor from '../../steps/completeChooseSupervisor'
import completeCompliance from '../../steps/completeCompliance'
import { checkAppointmentOnDelius } from '../../steps/delius'
import signIn from '../../steps/signIn'
import completeChooseProject from '../../steps/completeChooseProject'
import FindAPersonPage from '../../pages/findAPersonPage'
import DatePage from '../../pages/appointments/datePage'
import ChooseSupervisorPage from '../../pages/appointments/chooseSupervisorPage'
import PersonAppointmentsPage from '../../pages/people.ts/personAppointmentsPage'

test(
  'Create an appointment for individual placement session',
  { tag: '@use-induction-placement-type' },
  async ({ page, deliusUser, team, project, personOnProbation }) => {
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

    const datePage = new DatePage(page)
    await datePage.expect.toBeOnThePage()
    await datePage.datePickerComponent.openDatePicker()
    await datePage.datePickerComponent.selectTodaysDate()
    await datePage.continue()

    const chooseRegionPage = new ChooseRegionPage(page)
    await chooseRegionPage.expect.toBeOnThePage()
    await chooseRegionPage.chooseRegion(team.provider)
    await chooseRegionPage.continue()

    const chooseSupervisorPage = new ChooseSupervisorPage(page)

    const chooseProjectPage = await completeChooseSupervisor(page, chooseSupervisorPage, team)
    await chooseProjectPage.form.selectProject(team, project.name)
    const attendanceOutcomePage = await completeChooseProject(page, chooseProjectPage)

    const logHoursPage = await completeAttendedCompliedOutcome(page, attendanceOutcomePage)
    await logHoursPage.enterStartAndEndTime(project.availability)
    await logHoursPage.continue()

    await completeCompliance(page)

    const confirmPage = new ConfirmPage(page)
    await confirmPage.expect.toBeOnThePage()

    await confirmPage.expect.toShowAnswers(team.supervisor, project.availability)
    await confirmPage.expect.toShowOutcome('Attended \u2013 complied')
    await confirmPage.expect.toShowComplianceAnswer()

    await confirmPage.selectAlertPractitioner()

    await confirmPage.confirmButtonLocator.click()

    await personAppointmentsPage.expect.toBeOnThePage()

    await checkAppointmentOnDelius({
      page,
      team,
      person: personOnProbation,
      project,
      contactOutcome: { outcome: 'Attended - Complied' },
      hoursCredited: '4:00',
      outStanding: '0:00',
    })
  },
)
