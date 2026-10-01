import verifyTimeCredited from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/verify-time-credited'
import { login as deliusLogin } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import test from '../../fixtures/test'
import ConfirmPage from '../../pages/appointments/confirmPage'
import ChooseRegionPage from '../../pages/appointments/chooseRegionPage'
import ChooseProjectPage from '../../pages/appointments/chooseProjectPage'
import RecordActivityPage from '../../pages/appointments/recordActivityPage'
import completeCompliance from '../../steps/completeCompliance'
import signIn from '../../steps/signIn'
import FindAPersonPage from '../../pages/findAPersonPage'
import PersonAppointmentsPage from '../../pages/people.ts/personAppointmentsPage'
import ChooseAppointmentTypePage from '../../pages/appointments/chooseAppointmentTypePage'

test(
  'Record an education, training and employment (ETE) appointment outside community campus',
  { tag: '@use-other-ete-placement-type' },
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

    await confirmPage.details.expect.toHaveItemWith('Region', team.provider)
    await confirmPage.details.expect.toHaveItemWith('Project team', team.name)
    await confirmPage.expect.toShowOutcome('Attended \u2013 complied')
    await confirmPage.expect.toShowComplianceAnswer()

    await confirmPage.selectAlertPractitioner()

    await confirmPage.confirmButtonLocator.click()

    await personAppointmentsPage.expect.toBeOnThePage()

    await deliusLogin(page)
    await verifyTimeCredited(page, {
      crn: personOnProbation.crn,
      projectName: project.name,
      hoursCredited: `1:00`,
      outcome: 'Attended - Complied',
      date: new Date(),
    })
  },
)
