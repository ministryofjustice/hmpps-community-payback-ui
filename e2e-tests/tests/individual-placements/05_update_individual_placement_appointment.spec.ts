import test from '../../fixtures/test'
import ConfirmPage from '../../pages/appointments/confirmPage'
import clickUpdateAnAppointment from '../../steps/clickUpdateAnAppointment'
import { completeAttendedCompliedOutcome } from '../../steps/completeAttendanceOutcome'
import completeCheckAppointmentDetails from '../../steps/completeCheckAppointmentDetails'
import completeCompliance from '../../steps/completeCompliance'
import { checkAppointmentOnDelius } from '../../steps/delius'
import searchForAnIndividualPlacement from '../../steps/searchForAnIndividualPlacement'
import selectAnIndividualPlacement from '../../steps/selectAnIndividualPlacement'
import signIn from '../../steps/signIn'

test('Update an individual placement appointment with attended complied', async ({
  page,
  deliusUser,
  team,
  personOnProbation,
  project,
}) => {
  const homePage = await signIn(page, deliusUser)

  const findIndividualPlacementsPage = await searchForAnIndividualPlacement(page, homePage, team)

  await findIndividualPlacementsPage.expect.toSeeResults()

  const projectPage = await selectAnIndividualPlacement(page, findIndividualPlacementsPage, project.name)

  await projectPage.expect.toSeeAppointmentForCrn(personOnProbation.crn)

  const checkAppointmentDetailsPage = await clickUpdateAnAppointment(page, projectPage, personOnProbation.crn)
  const attendanceOutcomePage = await completeCheckAppointmentDetails(
    page,
    checkAppointmentDetailsPage,
    team.supervisor,
  )

  const logHoursPage = await completeAttendedCompliedOutcome(page, attendanceOutcomePage)
  await logHoursPage.enterPenaltyHours()
  await logHoursPage.continue()

  await completeCompliance(page)

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toBeOnThePage()

  await confirmPage.expect.toShowAnswers(team.supervisor, project.availability)
  await confirmPage.expect.toShowAttendanceAnswer('Attended - Complied')
  await confirmPage.expect.toShowPenaltyHoursAnswerWithHoursApplied()
  await confirmPage.expect.toShowComplianceAnswer()

  await confirmPage.confirmButtonLocator.click()

  await projectPage.expect.toBeOnThePage()

  await checkAppointmentOnDelius({
    page,
    team,
    person: personOnProbation,
    project,
    contactOutcome: { outcome: 'Attended - Complied' },
  })
})
