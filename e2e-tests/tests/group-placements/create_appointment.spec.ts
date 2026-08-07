import { slow } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/common/common'
import test from '../../fixtures/test'
import signIn from '../../steps/signIn'
import searchForASession from '../../steps/searchForASession'
import completeCompliance from '../../steps/completeCompliance'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { completeAttendedCompliedOutcome } from '../../steps/completeAttendanceOutcome'
import { checkAppointmentOnDelius } from '../../steps/delius'
import completeChooseSupervisor from '../../steps/completeChooseSupervisor'
import completeChooseProject from '../../steps/completeChooseProject'
import FindAPersonPage from '../../pages/findAPersonPage'
import DatePage from '../../pages/appointments/datePage'
import ChooseSupervisorPage from '../../pages/appointments/chooseSupervisorPage'
import SessionPage from '../../pages/sessionPage'

test('Create an appointment for group session', async ({
  page,
  deliusUser,
  team,
  project,
  personOnProbation,
  placeholderAppointment,
}) => {
  slow()
  const homePage = await signIn(page, deliusUser)
  const sessionSearchPage = await searchForASession(page, homePage, team, placeholderAppointment.date)

  await sessionSearchPage.clickOnProject(project.name)
  const sessionPage = new SessionPage(page, project.name)
  await sessionPage.expect.toBeOnThePage()

  await sessionPage.expect.toSeeAppointments()
  await sessionPage.clickAddAppointment()

  const findAPersonPage = new FindAPersonPage(page)
  await findAPersonPage.search.enterSearchTerm(personOnProbation.crn)
  await findAPersonPage.search.submitForm()
  await findAPersonPage.people.clickPersonLink(personOnProbation.crn)

  const datePage = new DatePage(page)
  await datePage.continue()

  const chooseSupervisorPage = new ChooseSupervisorPage(page)

  const chooseProjectPage = await completeChooseSupervisor(page, chooseSupervisorPage, team)
  const attendanceOutcomePage = await completeChooseProject(page, chooseProjectPage)

  const logHoursPage = await completeAttendedCompliedOutcome(page, attendanceOutcomePage, true)
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

  await sessionPage.expect.toBeOnThePage()

  await checkAppointmentOnDelius({
    page,
    team,
    person: personOnProbation,
    project,
    contactOutcome: { outcome: 'Attended - Complied' },
  })
})
