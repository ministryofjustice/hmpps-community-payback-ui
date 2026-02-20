import PersonOnProbation from '../../delius/personOnProbation'
import Project from '../../delius/project'
import test from '../../fixtures/test'
import ConfirmPage from '../../pages/appointments/confirmPage'
import clickUpdateAnAppointment from '../../steps/clickUpdateAnAppointment'
import { completeAttendedCompliedOutcome } from '../../steps/completeAttendanceOutcome'
import completeCheckProjectDetails from '../../steps/completeCheckProjectDetails'
import completeCompliance from '../../steps/completeCompliance'
import searchForAnIndividualPlacement from '../../steps/searchForAnIndividualPlacement'
import selectAnIndividualPlacement from '../../steps/selectAnIndividualPlacement'
import signIn from '../../steps/signIn'

test('Update an individual placement appointment with attended complied', async ({ page, deliusUser, team }) => {
  const supervisor = 'Unallocated Unallocated'
  const project = new Project('Cancer Research UK', 'TEST01')
  const person = new PersonOnProbation('Lena', 'Leonard', 'CRN0002')
  const appointmentTimes = { startTime: '09:00', endTime: '17:00' }

  const homePage = await signIn(page, deliusUser)

  const findIndividualPlacementsPage = await searchForAnIndividualPlacement(page, homePage, team)

  await findIndividualPlacementsPage.expect.toSeeResults()

  const projectPage = await selectAnIndividualPlacement(page, findIndividualPlacementsPage, project.name)

  await projectPage.expect.toSeeAppointmentForCrn(person.crn)

  const checkAppointmentDetailsPage = await clickUpdateAnAppointment(page, projectPage, person.crn)
  const attendanceOutcomePage = await completeCheckProjectDetails(page, checkAppointmentDetailsPage, supervisor)

  const logHoursPage = await completeAttendedCompliedOutcome(page, attendanceOutcomePage)
  await logHoursPage.enterPenaltyHours()
  await logHoursPage.continue()

  await completeCompliance(page)

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toBeOnThePage()

  await confirmPage.expect.toShowAnswers(supervisor, appointmentTimes)
  await confirmPage.expect.toShowAttendanceAnswer('Attended - Complied')
  await confirmPage.expect.toShowPenaltyHoursAnswerWithHoursApplied()
  await confirmPage.expect.toShowComplianceAnswer()

  await confirmPage.confirmButtonLocator.click()

  await projectPage.expect.toBeOnThePage()
})
